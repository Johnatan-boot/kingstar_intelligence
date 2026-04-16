import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { EventEmitter } from 'events';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// --- Domain / Entities ---
interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  status: 'PENDING' | 'RECEIVING' | 'CONFERENCE' | 'COMPLETED' | 'CANCELLED';
  items: POItem[];
  nf?: string;
}

interface POItem {
  sku: string;
  description: string;
  expectedQuantity: number;
}

interface Receiving {
  id: string;
  purchaseOrderId: string;
  licensePlate: string;
  vehicleType: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

interface Conference {
  id: string;
  receivingId: string;
  purchaseOrderId: string;
  racksCount: number;
  leftoversCount: number;
  totalPieces: number;
  checkedPieces: number;
  damages: number;
  damage_type?: 'AVARIA' | 'CONFERENCIA';
  attempts: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PCL_ANALYSIS' | 'APPROVED' | 'REJECTED';
  startTime?: string;
  endTime?: string;
}

interface Divergence {
  id: string;
  conferenceId: string;
  purchaseOrderId: string;
  errorType: 'MISSING_ITEMS' | 'EXTRA_ITEMS' | 'DAMAGED' | 'OTHER';
  description: string;
  status: 'IN_ANALYSIS' | 'APPROVED' | 'REJECTED';
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  department: 'Compras' | 'Recebimento' | 'Conferência' | 'Estoque' | 'Diretoria';
}

interface Schedule {
  id: string;
  supplier: string;
  nf: string;
  expectedDate: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'CANCELLED';
}

interface SupplierScore {
  supplier: string;
  score: number;
  totalDeliveries: number;
  divergences: number;
  avgDeliveryTime: number;
}

// --- In-Memory Repositories (with JSON persistence) ---
class InMemoryRepository<T extends { id: string }> {
  protected data: Map<string, T> = new Map();
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(process.cwd(), 'data', filename);
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        parsed.forEach((item: T) => this.data.set(item.id, item));
      }
    } catch (error) {
      console.error(`Erro ao carregar banco de dados ${this.filePath}:`, error);
    }
  }

  private saveToFile() {
    try {
      const arrayData = Array.from(this.data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(arrayData, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Erro ao salvar banco de dados ${this.filePath}:`, error);
    }
  }

  save(item: T): T {
    this.data.set(item.id, item);
    this.saveToFile();
    return item;
  }

  findById(id: string): T | undefined {
    return this.data.get(id);
  }

  findAll(): T[] {
    return Array.from(this.data.values());
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const item = this.data.get(id);
    if (item) {
      const updated = { ...item, ...updates };
      this.data.set(id, updated);
      this.saveToFile();
      return updated;
    }
    return undefined;
  }

  filter(predicate: (item: T) => boolean): void {
    const newData = new Map<string, T>();
    this.data.forEach((val, key) => {
      if (predicate(val)) {
        newData.set(key, val);
      }
    });
    this.data = newData;
    this.saveToFile();
  }
}

const poRepo = new InMemoryRepository<PurchaseOrder>('pedidos.json');
const receivingRepo = new InMemoryRepository<Receiving>('recebimentos.json');
const conferenceRepo = new InMemoryRepository<Conference>('conferencias.json');
const divergenceRepo = new InMemoryRepository<Divergence>('divergencias.json');
const scheduleRepo = new InMemoryRepository<Schedule>('agenda.json');

const userRepo = new InMemoryRepository<User>('users.json');

// --- In-Memory Repository Extensions ---
(InMemoryRepository.prototype as any).clear = function() {
  this.data.clear();
  this.saveToFile();
};

// --- Event Emitter ---
const systemEvents = new EventEmitter();

// --- Services ---
import * as xlsx from 'xlsx';

class ImportService {
  async importCSV(filePath: string): Promise<PurchaseOrder[]> {
    return new Promise((resolve, reject) => {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Read as 2D array, defval '' ensures empty cells are empty strings, not undefined
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        if (rows.length === 0) throw new Error("A planilha está vazia.");

        const normalize = (str: any) => {
          if (str === undefined || str === null) return '';
          return str.toString().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '');
        };

        const keywords = {
          poId: ['poid', 'pedido', 'id', 'npedido', 'po', 'ordem'],
          supplier: ['fornecedor', 'supplier', 'vendor', 'fabricante', 'empresa', 'nome', 'marca', 'loja'],
          date: ['data', 'date', 'criacao', 'emissao'],
          sku: ['sku', 'codigo', 'item', 'referencia', 'ref', 'ean', 'cod'],
          desc: ['descricao', 'description', 'produto', 'material', 'titulo'],
          qty: ['quantidade', 'qtd', 'qty', 'quant', 'volume', 'pecas', 'unidades'],
          nf: ['nf', 'nota', 'fiscal', 'documento']
        };

        let bestRowIdx = -1;
        let maxMatches = 0;
        let bestColMap = { poId: -1, supplier: -1, date: -1, sku: -1, desc: -1, qty: -1, nf: -1 };

        // Scan first 50 rows to find the header row (the one with the most matches)
        for (let i = 0; i < Math.min(rows.length, 50); i++) {
          const row = rows[i];
          let matches = 0;
          let colMap = { poId: -1, supplier: -1, date: -1, sku: -1, desc: -1, qty: -1, nf: -1 };

          row.forEach((cell, colIdx) => {
            const normCell = normalize(cell);
            if (!normCell) return;

            if (colMap.poId === -1 && keywords.poId.some(k => normCell.includes(k))) { colMap.poId = colIdx; matches++; }
            else if (colMap.supplier === -1 && keywords.supplier.some(k => normCell.includes(k))) { colMap.supplier = colIdx; matches++; }
            else if (colMap.date === -1 && keywords.date.some(k => normCell.includes(k))) { colMap.date = colIdx; matches++; }
            else if (colMap.sku === -1 && keywords.sku.some(k => normCell.includes(k))) { colMap.sku = colIdx; matches++; }
            else if (colMap.desc === -1 && keywords.desc.some(k => normCell.includes(k))) { colMap.desc = colIdx; matches++; }
            else if (colMap.qty === -1 && keywords.qty.some(k => normCell.includes(k))) { colMap.qty = colIdx; matches++; }
            else if (colMap.nf === -1 && keywords.nf.some(k => normCell.includes(k))) { colMap.nf = colIdx; matches++; }
          });

          if (matches > maxMatches) {
            maxMatches = matches;
            bestRowIdx = i;
            bestColMap = colMap;
          }
        }

        if (maxMatches === 0) {
          // We couldn't find ANY recognizable column.
          const sample = rows.slice(0, 3).map(r => r.join(' | ')).join('\n');
          throw new Error(`Não encontramos colunas reconhecíveis (Fornecedor, SKU, Qtd, etc). O que o sistema leu foi:\n${sample}`);
        }

        const dataRows = rows.slice(bestRowIdx + 1);
        
        const existingPos = poRepo.findAll();
        let maxId = 1000;
        existingPos.forEach(po => {
          if (po.id.startsWith('PO-')) {
            const num = parseInt(po.id.replace('PO-', ''), 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        let nextPoId = maxId + 1;

        const poMap = new Map<string, PurchaseOrder>();
        const sequenceMapping = new Map<string, string>();

        dataRows.forEach(row => {
          // Skip empty rows
          if (!row || row.length === 0 || row.every(v => v === undefined || v === null || v.toString().trim() === '')) return;

          let rawPoId = bestColMap.poId !== -1 ? row[bestColMap.poId]?.toString().trim() : '';
          let poId = rawPoId;

          // Convert numeric IDs (like 1, 2) or empty IDs to sequential PO-100X
          if (!rawPoId || /^\d+$/.test(rawPoId)) {
            if (rawPoId && sequenceMapping.has(rawPoId)) {
              poId = sequenceMapping.get(rawPoId)!;
            } else {
              poId = `PO-${nextPoId++}`;
              if (rawPoId) sequenceMapping.set(rawPoId, poId);
            }
          }

          if (!poMap.has(poId)) {
            let dateStr = new Date().toISOString();
            if (bestColMap.date !== -1) {
              let dateVal = row[bestColMap.date];
              if (typeof dateVal === 'number') {
                 const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                 date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                 dateStr = date.toISOString();
              } else if (dateVal) {
                 let dStr = dateVal.toString().trim();
                 const brMatch = dStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                 if (brMatch) {
                   dateStr = new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}T12:00:00Z`).toISOString();
                 } else {
                   const parsed = new Date(dStr);
                   if (!isNaN(parsed.getTime())) {
                     dateStr = parsed.toISOString();
                   }
                 }
              }
            }

            let supplierVal = bestColMap.supplier !== -1 ? (row[bestColMap.supplier]?.toString().trim() || 'Unknown') : 'Unknown';
            
            // Map numeric supplier IDs to actual names
            const supplierMap: Record<string, string> = {
              '1': 'UMAFLEX',
              '2': 'SÃO JORGE',
              '3': 'CRIAZZI',
              '4': 'MONTREAL',
              '5': 'ECUS',
              '6': 'ECUS',
              '7': 'LUCKSPUMA',
              '8': 'EBJ',
              '9': 'V-JOY',
              '10': 'DREAN BOX'
            };

            // Extract number from strings like "Fornecedor 1", "Loja 2", or just "3"
            const numMatch = supplierVal.match(/\d+/);
            if (numMatch) {
              const numStr = numMatch[0];
              if (supplierMap[numStr]) {
                supplierVal = supplierMap[numStr];
              }
            }

            let nfVal = bestColMap.nf !== -1 ? (row[bestColMap.nf]?.toString().trim() || '') : '';

            poMap.set(poId, {
              id: poId,
              supplier: supplierVal,
              date: dateStr,
              status: 'PENDING',
              items: [],
              nf: nfVal
            });
          }

          const po = poMap.get(poId)!;
          
          let qty = 1;
          if (bestColMap.qty !== -1) {
            const qtyVal = row[bestColMap.qty];
            qty = typeof qtyVal === 'number' ? qtyVal : parseInt(qtyVal?.toString().trim(), 10);
            if (isNaN(qty)) qty = 1;
          }

          let sku = bestColMap.sku !== -1 ? (row[bestColMap.sku]?.toString().trim() || '') : '';
          let description = bestColMap.desc !== -1 ? (row[bestColMap.desc]?.toString().trim() || '') : '';

          if (!sku || sku === 'UNKNOWN-SKU' || !description || description === 'No description') {
            const simulatedProducts = [
              { sku: 'SKU-CB01', desc: 'Cama Box' },
              { sku: 'SKU-CBB02', desc: 'Cama Box baú' },
              { sku: 'SKU-CDM03', desc: 'Colchão dupla mola' },
              { sku: 'SKU-CQ04', desc: 'Colchão queen' }
            ];
            const randomProduct = simulatedProducts[Math.floor(Math.random() * simulatedProducts.length)];
            sku = randomProduct.sku;
            description = randomProduct.desc;
          }

          po.items.push({
            sku,
            description,
            expectedQuantity: qty
          });
        });

        const createdPOs = Array.from(poMap.values());
        createdPOs.forEach(po => {
          poRepo.save(po);
          systemEvents.emit('pedido_importado', po);
        });

        resolve(createdPOs);
      } catch (err: any) {
        reject(err);
      }
    });
  }
}

class ReceivingService {
  startReceiving(poId: string, licensePlate: string, vehicleType: string): Receiving {
    const po = poRepo.findById(poId);
    if (!po) throw new Error('Purchase Order not found');
    if (po.status !== 'PENDING') throw new Error('PO is not in PENDING status');

    poRepo.update(poId, { status: 'RECEIVING' });

    const receiving: Receiving = {
      id: uuidv4(),
      purchaseOrderId: poId,
      licensePlate,
      vehicleType,
      startTime: new Date().toISOString()
    };
    receivingRepo.save(receiving);
    
    systemEvents.emit('recebimento_iniciado', receiving);
    return receiving;
  }
}

class ConferenceService {
  startConference(receivingId: string): Conference {
    const receiving = receivingRepo.findById(receivingId);
    if (!receiving) throw new Error('Receiving not found');
    
    const po = poRepo.findById(receiving.purchaseOrderId);
    if (!po) throw new Error('PO not found');

    poRepo.update(po.id, { status: 'CONFERENCE' });
    receivingRepo.update(receivingId, { endTime: new Date().toISOString() });

    const conference: Conference = {
      id: uuidv4(),
      receivingId,
      purchaseOrderId: po.id,
      racksCount: 0,
      leftoversCount: 0,
      totalPieces: po.items.reduce((acc, item) => acc + item.expectedQuantity, 0),
      checkedPieces: 0,
      damages: 0,
      attempts: 0,
      status: 'PENDING',
      startTime: new Date().toISOString()
    };
    
    conferenceRepo.save(conference);
    return conference;
  }

  submitConference(conferenceId: string, checkedPieces: number, damages: number): Conference {
    const conf = conferenceRepo.findById(conferenceId);
    if (!conf) throw new Error('Conference not found');
    if (conf.status === 'PCL_ANALYSIS' || conf.status === 'APPROVED') {
      throw new Error('Conference already finalized or in analysis');
    }

    conf.attempts += 1;
    conf.checkedPieces = checkedPieces;
    conf.damages = damages;

    const isMatch = conf.checkedPieces === conf.totalPieces && conf.damages === 0;

    if (isMatch) {
      conf.status = 'APPROVED';
      conf.endTime = new Date().toISOString();
      conferenceRepo.update(conferenceId, conf);
      systemEvents.emit('conferencia_aprovada', conf);
    } else {
      if (conf.attempts >= 3) {
        conf.status = 'PCL_ANALYSIS';
        conf.endTime = new Date().toISOString();
        
        // Determine damage type
        if (conf.damages > 0) {
          conf.damage_type = 'AVARIA';
        } else if (conf.checkedPieces !== conf.totalPieces) {
          conf.damage_type = 'CONFERENCIA';
        }

        conferenceRepo.update(conferenceId, conf);
        
        const divergence: Divergence = {
          id: uuidv4(),
          conferenceId: conf.id,
          purchaseOrderId: conf.purchaseOrderId,
          errorType: conf.checkedPieces < conf.totalPieces ? 'MISSING_ITEMS' : (conf.checkedPieces > conf.totalPieces ? 'EXTRA_ITEMS' : 'DAMAGED'),
          description: `Expected ${conf.totalPieces}, got ${conf.checkedPieces}. Damages: ${conf.damages}. Max attempts reached.`,
          status: 'IN_ANALYSIS'
        };
        divergenceRepo.save(divergence);
        
        systemEvents.emit('divergencia_detectada', divergence);
        systemEvents.emit('divergencia_em_analise', divergence);
      } else {
        conf.status = 'IN_PROGRESS';
        conferenceRepo.update(conferenceId, conf);
        systemEvents.emit('conferencia_reprovada', conf);
      }
    }

    return conf;
  }
}

class PCLService {
  analyzeDivergence(divergenceId: string, approved: boolean, notes: string): Divergence {
    const divergence = divergenceRepo.findById(divergenceId);
    if (!divergence) throw new Error('Divergence not found');

    divergence.status = approved ? 'APPROVED' : 'REJECTED';
    divergence.description += ` | Gestor Notes: ${notes}`;
    divergenceRepo.update(divergenceId, divergence);

    const conf = conferenceRepo.findById(divergence.conferenceId);
    if (conf) {
      conf.status = approved ? 'APPROVED' : 'REJECTED';
      conferenceRepo.update(conf.id, conf);
      
      if (approved) {
         systemEvents.emit('divergencia_aprovada', divergence);
         systemEvents.emit('conferencia_aprovada', conf);
      }
    }

    return divergence;
  }
}

class StockService {
  constructor() {
    systemEvents.on('conferencia_aprovada', (conf: Conference) => {
      this.moveToStock(conf);
    });
  }

  moveToStock(conf: Conference) {
    const receiving = receivingRepo.findById(conf.receivingId);
    if (receiving) {
       poRepo.update(receiving.purchaseOrderId, { status: 'COMPLETED' });
       systemEvents.emit('movido_para_estoque', { conferenceId: conf.id, poId: receiving.purchaseOrderId });
       console.log(`[STOCK] Items from PO ${receiving.purchaseOrderId} moved to stock.`);
    }
  }
}

// Initialize listeners
new StockService();

import { GetAnalyticsUseCase } from './src/backend/application/useCases/GetAnalyticsUseCase';
import { ScoreCalculatorService } from './src/backend/application/services/ScoreCalculatorService';
import { BotService } from './src/backend/infrastructure/bot/BotService';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// --- Controllers / Express App ---
const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Vite dev server compatibility
  crossOriginEmbedderPolicy: false,
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit payload size

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit for uploads

const importService = new ImportService();
const receivingService = new ReceivingService();
const conferenceService = new ConferenceService();
const pclService = new PCLService();
const scoreCalculatorService = new ScoreCalculatorService();
const getAnalyticsUseCase = new GetAnalyticsUseCase(poRepo, receivingRepo, conferenceRepo, divergenceRepo, scoreCalculatorService);
const botService = new BotService(getAnalyticsUseCase);

import bcrypt from 'bcryptjs';

// --- Authentication Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  // Simple token-based or session-basedauth can be added here
  // For now, we'll assume the frontend sends user info if needed
  next();
};

// --- Historical Score Service ---
let historicalNFCounter = 0;
let lastScoreReset = new Date().toISOString();

const getHistoricalScore = () => {
  // Logic: Each completed NF in the last 30 days contributes
  const completedPOs = poRepo.findAll().filter(po => po.status === 'COMPLETED');
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const recentCompleted = completedPOs.filter(po => {
    // We'll use the conference end time as completion time
    const confs = conferenceRepo.findAll().filter(c => c.purchaseOrderId === po.id && c.status === 'APPROVED');
    if (confs.length === 0) return false;
    const endTime = confs[0].endTime;
    return endTime && new Date(endTime) > monthAgo;
  });

  // Calculate score: Simple incremental logic for demo, or based on volume
  // Max score 100, goal 50 NFs per month?
  const goal = 50;
  const score = Math.min(100, (recentCompleted.length / goal) * 100);
  return Math.round(score);
};

// Bot Rate Limiter (Stricter)
const botLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: { error: 'Limite de mensagens excedido. Aguarde um momento.' },
});

// API Routes
app.post('/api/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const pos = await importService.importCSV(req.file.path);
    fs.unlinkSync(req.file.path); // clean up
    res.json({ message: 'Import successful', count: pos.length, pos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchases', (req, res) => {
  res.json(poRepo.findAll());
});

app.post('/api/receiving', (req, res) => {
  try {
    const { poId, licensePlate, vehicleType } = req.body;
    const receiving = receivingService.startReceiving(poId, licensePlate, vehicleType);
    res.json(receiving);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/receiving', (req, res) => {
  res.json(receivingRepo.findAll());
});

app.post('/api/conference/start', (req, res) => {
  try {
    const { receivingId } = req.body;
    const conf = conferenceService.startConference(receivingId);
    res.json(conf);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/conference/:id/submit', (req, res) => {
  try {
    const { checkedPieces, damages } = req.body;
    const conf = conferenceService.submitConference(req.params.id, checkedPieces, damages);
    res.json(conf);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/conference', (req, res) => {
  res.json(conferenceRepo.findAll());
});

app.get('/api/pcl/divergences', (req, res) => {
  res.json(divergenceRepo.findAll());
});

app.post('/api/pcl/divergences/:id/analyze', (req, res) => {
  try {
    const { approved, notes } = req.body;
    const div = pclService.analyzeDivergence(req.params.id, approved, notes);
    res.json(div);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/history', (req, res) => {
  const pos = poRepo.findAll().filter(po => po.status === 'COMPLETED');
  const receivings = receivingRepo.findAll();
  const conferences = conferenceRepo.findAll();

  const history = pos.map(po => {
    const rec = receivings.find(r => r.purchaseOrderId === po.id);
    // Find the latest conference for this PO
    const confs = conferences.filter(c => c.purchaseOrderId === po.id);
    const conf = confs.length > 0 ? confs[confs.length - 1] : null;
    
    return {
      poId: po.id,
      nf: po.nf,
      supplier: po.supplier,
      date: po.date,
      items: po.items,
      receiving: rec ? {
        licensePlate: rec.licensePlate,
        vehicleType: rec.vehicleType,
        startTime: rec.startTime,
        endTime: rec.endTime
      } : null,
      conference: conf ? {
        totalPieces: conf.totalPieces,
        checkedPieces: conf.checkedPieces,
        damages: conf.damages,
        startTime: conf.startTime,
        endTime: conf.endTime
      } : null
    };
  });

  // Sort by most recent completion
  history.sort((a, b) => {
    const timeA = a.conference?.endTime ? new Date(a.conference.endTime).getTime() : new Date(a.date).getTime();
    const timeB = b.conference?.endTime ? new Date(b.conference.endTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  res.json(history);
});

app.post('/api/history/:poId/cancel', (req, res) => {
  try {
    const { poId } = req.params;
    const po = poRepo.findById(poId);
    if (!po) throw new Error('Pedido não encontrado');
    
    poRepo.update(poId, { status: 'CANCELLED' });
    
    res.json({ message: 'NF/Pedido cancelado com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await getAnalyticsUseCase.execute();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedule', (req, res) => {
  res.json(scheduleRepo.findAll());
});

app.post('/api/schedule', (req, res) => {
  try {
    const { supplier, nf, expectedDate } = req.body;
    const schedule = scheduleRepo.save({
      id: uuidv4(),
      supplier,
      nf,
      expectedDate,
      status: 'SCHEDULED'
    });
    res.json(schedule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/schedule/:id/arrive', (req, res) => {
  try {
    const { id } = req.params;
    const schedule = scheduleRepo.update(id, { status: 'ARRIVED' });
    if (!schedule) throw new Error('Agendamento não encontrado');
    res.json(schedule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/bot/chat', botLimiter, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'A pergunta (query) é obrigatória e deve ser um texto.' });
    }
    
    // Basic sanitization
    const sanitizedQuery = query.trim().substring(0, 500); // Limit query length

    const scheduleData = scheduleRepo.findAll();
    const answer = await botService.ask(sanitizedQuery, scheduleData);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    const existing = userRepo.findAll().find(u => u.email === email);
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      department,
      role
    };

    userRepo.save(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = userRepo.findAll().find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  const users = userRepo.findAll().map(({ password, ...u }) => u);
  res.json(users);
});

// --- Admin / Maintenance Routes ---
app.post('/api/admin/clear-data', (req, res) => {
  try {
    // 1. Identify completed POs to preserve history and stock
    const completedPOs = poRepo.findAll().filter(po => po.status === 'COMPLETED');
    const completedPoIds = new Set(completedPOs.map(po => po.id));

    // 2. Filter repositories to keep only data related to completed work
    poRepo.filter(po => po.status === 'COMPLETED');
    receivingRepo.filter(rec => completedPoIds.has(rec.purchaseOrderId));
    conferenceRepo.filter(conf => completedPoIds.has(conf.purchaseOrderId));
    divergenceRepo.filter(div => completedPoIds.has(div.purchaseOrderId));
    
    // 3. Completely clear the incoming/future queue (Schedule/Agenda)
    (scheduleRepo as any).clear();

    res.json({ message: 'Sistema redefinido: Filas limpas, Histórico e Estoque preservados.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/historical-score', (req, res) => {
  res.json({ score: getHistoricalScore() });
});

app.post('/api/analytics/reset-score', (req, res) => {
  // In a real scenario, this might clear historical logs
  // For now, we'll just clear the tables which affects the calculation
  (poRepo as any).clear();
  (receivingRepo as any).clear();
  (conferenceRepo as any).clear();
  (divergenceRepo as any).clear();
  res.json({ message: 'Contador de score reiniciado.' });
});

// --- Vite Middleware ---
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
