import { ScoreCalculatorService } from '../services/ScoreCalculatorService';
import { PurchaseOrder, Receiving, Conference } from '../../domain/entities/types';

export class GetAnalyticsUseCase {
  constructor(
    private poRepo: any,
    private receivingRepo: any,
    private conferenceRepo: any,
    private divergenceRepo: any,
    private scoreService: ScoreCalculatorService
  ) {}

  async execute() {
    const pos = await this.poRepo.findAll();
    const receivings = await this.receivingRepo.findAll();
    const conferences = await this.conferenceRepo.findAll();
    const divergences = await this.divergenceRepo.findAll();

    const completedPOs = pos.filter((po: PurchaseOrder) => po.status === 'COMPLETED');
    
    // Metrics
    const totalVehiclesReceived = receivings.length;
    const totalCompletedNFs = completedPOs.length;
    const totalPiecesChecked = conferences.reduce((acc: number, conf: Conference) => acc + conf.checkedPieces, 0);
    const totalDivergences = divergences.length;
    const errorRate = conferences.length > 0 ? (totalDivergences / conferences.length) * 100 : 0;

    const avarias = conferences.filter((c: Conference) => (c as any).damage_type === 'AVARIA').length;
    const errosConferencia = conferences.filter((c: Conference) => (c as any).damage_type === 'CONFERENCIA').length;

    // Productivity
    let totalReceivingTime = 0;
    let completedReceivings = 0;
    receivings.forEach((r: Receiving) => {
      if (r.startTime && r.endTime) {
        totalReceivingTime += new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
        completedReceivings++;
      }
    });
    const avgReceivingTimeMin = completedReceivings > 0 ? (totalReceivingTime / completedReceivings) / 60000 : 0;

    let totalConfTime = 0;
    let completedConfs = 0;
    conferences.forEach((c: Conference) => {
      if (c.startTime && c.endTime) {
        totalConfTime += new Date(c.endTime).getTime() - new Date(c.startTime).getTime();
        completedConfs++;
      }
    });
    const avgConfTimeMin = completedConfs > 0 ? (totalConfTime / completedConfs) / 60000 : 0;

    // Score
    const score = this.scoreService.calculateDailyScore(pos, receivings, conferences, divergences);

    // History for charts (last 7 days)
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      history.push({
        date: dateStr,
        vehicles: receivings.filter((r: Receiving) => r.startTime.startsWith(dateStr)).length,
        nfs: completedPOs.filter((p: PurchaseOrder) => p.date.startsWith(dateStr)).length,
        pieces: conferences.filter((c: Conference) => c.startTime?.startsWith(dateStr)).reduce((acc: number, c: Conference) => acc + c.checkedPieces, 0),
        avarias: conferences.filter((c: Conference) => c.startTime?.startsWith(dateStr) && (c as any).damage_type === 'AVARIA').length,
        errosConferencia: conferences.filter((c: Conference) => c.startTime?.startsWith(dateStr) && (c as any).damage_type === 'CONFERENCIA').length
      });
    }

    // Supplier Scores
    const supplierMap = new Map<string, any>();
    pos.forEach((po: PurchaseOrder) => {
      if (!supplierMap.has(po.supplier)) {
        supplierMap.set(po.supplier, { supplier: po.supplier, totalDeliveries: 0, divergences: 0, avarias: 0, totalTime: 0, countTime: 0 });
      }
      const s = supplierMap.get(po.supplier);
      if (po.status === 'COMPLETED') s.totalDeliveries++;
      
      const confs = conferences.filter((c: Conference) => c.purchaseOrderId === po.id);
      confs.forEach((c: Conference) => {
        if ((c as any).damage_type === 'AVARIA') s.avarias++;
        if ((c as any).damage_type === 'CONFERENCIA') s.divergences++;
      });

      const rec = receivings.find((r: Receiving) => r.purchaseOrderId === po.id);
      if (rec && rec.startTime && rec.endTime) {
        s.totalTime += new Date(rec.endTime).getTime() - new Date(rec.startTime).getTime();
        s.countTime++;
      }
    });

    const supplierScores = Array.from(supplierMap.values()).map(s => {
      const avgTime = s.countTime > 0 ? (s.totalTime / s.countTime) / 60000 : 0;
      // Calculate a simple score 0-100
      let score = 100;
      score -= (s.divergences * 5);
      score -= (s.avarias * 10);
      if (avgTime > 120) score -= 10;
      else if (avgTime > 60) score -= 5;
      return {
        supplier: s.supplier,
        score: Math.max(0, Math.min(100, score)),
        totalDeliveries: s.totalDeliveries,
        divergences: s.divergences + s.avarias,
        avgDeliveryTime: avgTime
      };
    }).sort((a, b) => b.score - a.score);

    return {
      metrics: {
        totalVehiclesReceived,
        totalCompletedNFs,
        totalPiecesChecked,
        totalDivergences,
        errorRate: errorRate.toFixed(1),
        avarias,
        errosConferencia
      },
      productivity: {
        avgReceivingTimeMin: avgReceivingTimeMin.toFixed(1),
        avgConfTimeMin: avgConfTimeMin.toFixed(1)
      },
      score: {
        total: score.totalScore,
        classification: score.classification,
        breakdown: { 
          timeScore: score.timeScore, 
          divScore: score.errorScore, 
          attemptScore: score.attemptsScore, 
          volumeScore: score.volumeScore 
        }
      },
      history,
      supplierScores
    };
  }
}
