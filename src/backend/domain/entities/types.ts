export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  status: 'PENDING' | 'RECEIVING' | 'CONFERENCE' | 'COMPLETED' | 'CANCELLED';
  items: POItem[];
}

export interface POItem {
  sku: string;
  description: string;
  expectedQuantity: number;
}

export interface Receiving {
  id: string;
  purchaseOrderId: string;
  licensePlate: string;
  vehicleType: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface Conference {
  id: string;
  receivingId: string;
  purchaseOrderId: string;
  racksCount: number;
  leftoversCount: number;
  totalPieces: number;
  checkedPieces: number;
  damages: number;
  attempts: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PCL_ANALYSIS' | 'APPROVED' | 'REJECTED';
  damage_type?: 'AVARIA' | 'CONFERENCIA';
  startTime?: string;
  endTime?: string;
}

export interface Divergence {
  id: string;
  conferenceId: string;
  purchaseOrderId: string;
  errorType: 'MISSING_ITEMS' | 'EXTRA_ITEMS' | 'DAMAGED' | 'OTHER';
  description: string;
  status: 'IN_ANALYSIS' | 'APPROVED' | 'REJECTED';
}

export interface DailyMetric {
  date: string;
  totalVehicles: number;
  totalNfsCompleted: number;
  totalPiecesChecked: number;
  totalDivergences: number;
  avgReceivingTimeMin: number;
  avgConferenceTimeMin: number;
  errorRatePercentage: number;
}

export interface OperationalScore {
  id?: number;
  date: string;
  timeScore: number;
  errorScore: number;
  attemptsScore: number;
  volumeScore: number;
  totalScore: number;
  classification: 'Excelente' | 'Bom' | 'Regular' | 'Crítico';
}

export interface OperationalLog {
  id?: number;
  eventType: string;
  entityId?: string;
  details: any;
  createdAt?: string;
}
