import { describe, it, expect } from 'vitest';
import { ScoreCalculatorService } from './ScoreCalculatorService';
import { PurchaseOrder, Receiving, Conference, Divergence } from '../../domain/entities/types';

describe('ScoreCalculatorService', () => {
  const service = new ScoreCalculatorService();

  it('deve calcular score Excelente para condições ideais', () => {
    const pos: PurchaseOrder[] = [
      { id: 'PO-1', supplier: 'Fornecedor A', date: new Date().toISOString(), status: 'COMPLETED', items: [] }
    ];
    
    // 15 minutos de recebimento
    const receivings: Receiving[] = [
      { id: 'REC-1', purchaseOrderId: 'PO-1', licensePlate: 'ABC-1234', vehicleType: 'TRUCK', startTime: '2023-01-01T10:00:00Z', endTime: '2023-01-01T10:15:00Z' }
    ];
    
    // 15 minutos de conferência, 1 tentativa
    const conferences: Conference[] = [
      { id: 'CONF-1', receivingId: 'REC-1', purchaseOrderId: 'PO-1', racksCount: 1, leftoversCount: 0, totalPieces: 100, checkedPieces: 100, damages: 0, attempts: 1, status: 'APPROVED', startTime: '2023-01-01T10:15:00Z', endTime: '2023-01-01T10:30:00Z' }
    ];
    
    // Zero divergências
    const divergences: Divergence[] = [];

    const result = service.calculateDailyScore(pos, receivings, conferences, divergences);
    
    expect(result.classification).toBe('Bom');
    expect(result.totalScore).toBe(85);
    expect(result.errorScore).toBe(30); // 0% de erro = pontuação máxima
    expect(result.attemptsScore).toBe(20); // 1 tentativa = pontuação máxima
    expect(result.volumeScore).toBe(20); // 100% concluído = pontuação máxima
  });

  it('deve penalizar o score se houver muitas divergências e tempo alto', () => {
    const pos: PurchaseOrder[] = [
      { id: 'PO-1', supplier: 'Fornecedor A', date: new Date().toISOString(), status: 'COMPLETED', items: [] }
    ];
    
    // 2 horas de recebimento (ruim)
    const receivings: Receiving[] = [
      { id: 'REC-1', purchaseOrderId: 'PO-1', licensePlate: 'ABC-1234', vehicleType: 'TRUCK', startTime: '2023-01-01T10:00:00Z', endTime: '2023-01-01T12:00:00Z' }
    ];
    
    // 2 horas de conferência, 3 tentativas (ruim)
    const conferences: Conference[] = [
      { id: 'CONF-1', receivingId: 'REC-1', purchaseOrderId: 'PO-1', racksCount: 1, leftoversCount: 0, totalPieces: 100, checkedPieces: 100, damages: 0, attempts: 3, status: 'APPROVED', startTime: '2023-01-01T12:00:00Z', endTime: '2023-01-01T14:00:00Z' }
    ];
    
    // 1 divergência para 1 conferência = 100% de taxa de erro (ruim)
    const divergences: Divergence[] = [
      { id: 'DIV-1', conferenceId: 'CONF-1', purchaseOrderId: 'PO-1', errorType: 'MISSING_ITEMS', description: 'Faltou item', status: 'APPROVED' }
    ];

    const result = service.calculateDailyScore(pos, receivings, conferences, divergences);
    
    expect(result.classification).not.toBe('Excelente');
    expect(result.totalScore).toBeLessThan(75);
    expect(result.errorScore).toBe(0); // 100% de erro = 0 pontos
    expect(result.attemptsScore).toBe(0); // 3 tentativas = 0 pontos
  });
});
