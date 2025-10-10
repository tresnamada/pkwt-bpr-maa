export interface EmailNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  adminEmail: string;
  lastEmailSent: Date;
  emailCount: number;
  daysUntilExpiry: number;
  contractEndDate: Date;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailReminderData {
  employeeName: string;
  unit: string; // Cabang perusahaan
  contractEndDate: string; // Formatted date string
  daysRemaining: number;
  dashboardLink: string;
}

export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}
