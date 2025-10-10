export interface Reminder {
  id: string;
  employeeId: string;
  employeeName: string;
  unit: string;
  contractEndDate: Date;
  reminderType: 'upcoming' | 'overdue'; // upcoming: <30 hari, overdue: sudah lewat
  daysRemaining: number; // positif untuk upcoming, negatif untuk overdue
  status: 'pending' | 'notified' | 'resolved'; // pending: belum kirim, notified: sudah kirim, resolved: sudah evaluasi
  lastEmailSent?: Date;
  emailCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface CreateReminderData {
  employeeId: string;
  employeeName: string;
  unit: string;
  contractEndDate: Date;
  reminderType: 'upcoming' | 'overdue';
  daysRemaining: number;
}
