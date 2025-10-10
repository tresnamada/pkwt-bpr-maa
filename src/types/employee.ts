export type EvaluationResult = 'lanjut' | 'diangkat' | 'dilepas';

export interface Employee {
  id: string;
  name: string;
  unit: string; // Cabang perusahaan
  contractStartDate: Date;
  contractEndDate: Date;
  status: 'active' | 'expired' | 'evaluated';
  evaluation?: {
    rating: number;
    notes: string;
    result: EvaluationResult;
    evaluatedAt: Date;
    evaluatedBy: string;
  };
  history: HistoryEntry[];
  reminderSent: boolean;
  lastReminderEmailSent?: Date;
  emailReminderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  performedBy: string;
}

export interface CreateEmployeeData {
  name: string;
  unit: string; // Cabang perusahaan
  contractStartDate: Date;
  contractEndDate: Date; // Jatuh tempo (3 bulan dari start)
}

export interface EvaluationData {
  rating: number;
  notes: string;
  result: EvaluationResult;
}
