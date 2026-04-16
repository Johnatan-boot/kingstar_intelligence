import { PurchaseOrder, Receiving, Conference, Divergence } from '../../domain/entities/types';

export class ScoreCalculatorService {
  calculateDailyScore(
    pos: PurchaseOrder[],
    receivings: Receiving[],
    conferences: Conference[],
    divergences: Divergence[]
  ) {
    const completedPOs = pos.filter(po => po.status === 'COMPLETED');
    const totalDivergences = divergences.length;
    const errorRate = conferences.length > 0 ? (totalDivergences / conferences.length) * 100 : 0;

    let totalReceivingTime = 0;
    let completedReceivings = 0;
    receivings.forEach(r => {
      if (r.startTime && r.endTime) {
        totalReceivingTime += new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
        completedReceivings++;
      }
    });
    const avgReceivingTimeMin = completedReceivings > 0 ? (totalReceivingTime / completedReceivings) / 60000 : 0;

    let totalConfTime = 0;
    let completedConfs = 0;
    conferences.forEach(c => {
      if (c.startTime && c.endTime) {
        totalConfTime += new Date(c.endTime).getTime() - new Date(c.startTime).getTime();
        completedConfs++;
      }
    });
    const avgConfTimeMin = completedConfs > 0 ? (totalConfTime / completedConfs) / 60000 : 0;

    // Score Calculation (0-100)
    
    // Volume (20%): Based on completed POs vs total POs
    const volumeScore = pos.length > 0 ? (completedPOs.length / pos.length) * 20 : 0;

    // Processing time (30%): Ideal < 60 mins total
    const totalAvgTime = avgReceivingTimeMin + avgConfTimeMin;
    const timeScore = (completedReceivings > 0 || completedConfs > 0) 
      ? Math.max(0, 30 - (totalAvgTime / 60) * 30) 
      : 0;
    
    // Divergences (30%): Ideal 0%
    const divScore = conferences.length > 0 
      ? Math.max(0, 30 - (errorRate / 100) * 30) 
      : 0;
    
    // Attempts (20%): Ideal 1 attempt per conf
    const avgAttempts = conferences.length > 0 ? conferences.reduce((acc, c) => acc + c.attempts, 0) / conferences.length : 1;
    const attemptScore = conferences.length > 0 
      ? Math.max(0, 20 - ((avgAttempts - 1) / 2) * 20) 
      : 0;

    const totalScore = Math.round(timeScore + divScore + attemptScore + volumeScore);
    
    let classification = 'Aguardando Dados';
    if (totalScore === 0 && pos.length === 0) classification = 'Sem Dados';
    else if (totalScore >= 90) classification = 'Excelente';
    else if (totalScore >= 75) classification = 'Bom';
    else if (totalScore >= 60) classification = 'Regular';
    else classification = 'Crítico';

    return {
      timeScore: Number(timeScore.toFixed(2)),
      errorScore: Number(divScore.toFixed(2)),
      attemptsScore: Number(attemptScore.toFixed(2)),
      volumeScore: Number(volumeScore.toFixed(2)),
      totalScore,
      classification
    };
  }
}
