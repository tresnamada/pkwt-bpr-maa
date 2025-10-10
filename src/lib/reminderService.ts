import { employeeService } from './employeeService';
import { emailService } from './emailService';
import { ADMIN_EMAILS } from './resend';

export interface ReminderNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  message: string;
  type: 'reminder' | 'overdue';
  createdAt: Date;
  read: boolean;
}

class ReminderService {
  private notifications: ReminderNotification[] = [];
  private readonly STORAGE_KEY = 'pkwt_notifications';

  constructor() {
    // Load notifications from localStorage on initialization (client-side only)
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      console.log('[REMINDER_SERVICE] Loaded', this.notifications.length, 'notifications from storage');
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: {
          id: string;
          employeeId: string;
          employeeName: string;
          message: string;
          type: 'reminder' | 'overdue';
          createdAt: string;
          read: boolean;
        }) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
        console.log('[REMINDER_SERVICE] Successfully loaded notifications:', this.notifications.length);
      } else {
        console.log('[REMINDER_SERVICE] No stored notifications found');
      }
    } catch (error) {
      console.error('[REMINDER_SERVICE] Error loading notifications from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
        console.log('[REMINDER_SERVICE] Saved', this.notifications.length, 'notifications to storage');
      } catch (error) {
        console.error('[REMINDER_SERVICE] Error saving notifications to storage:', error);
      }
    }
  }

  // Cek karyawan yang perlu diingatkan
  async checkReminders(): Promise<ReminderNotification[]> {
    try {
      const employeesNeedingReminder = await employeeService.getEmployeesNeedingReminder();
      const newNotifications: ReminderNotification[] = [];

      for (const employee of employeesNeedingReminder) {
        const remainingDays = this.getRemainingDays(employee.contractEndDate);
        
        let message = '';
        let type: 'reminder' | 'overdue' = 'reminder';

        if (remainingDays < 0) {
          message = `Kontrak ${employee.name} telah berakhir ${Math.abs(remainingDays)} hari lalu dan belum dievaluasi`;
          type = 'overdue';
        } else if (remainingDays === 0) {
          message = `Kontrak ${employee.name} berakhir hari ini dan perlu dievaluasi`;
          type = 'overdue';
        } else if (remainingDays <= 30) {
          message = `Kontrak ${employee.name} akan berakhir dalam ${remainingDays} hari dan perlu dievaluasi`;
          type = 'reminder';
        }

        if (message) {
          const notification: ReminderNotification = {
            id: `${employee.id}-${Date.now()}`,
            employeeId: employee.id,
            employeeName: employee.name,
            message,
            type,
            createdAt: new Date(),
            read: false,
          };

          newNotifications.push(notification);

          // Kirim email ke admin jika belum pernah dikirim atau sudah 24 jam sejak email terakhir
          const lastEmailDate = employee.lastReminderEmailSent ? new Date(employee.lastReminderEmailSent) : undefined;
          if (emailService.shouldSendEmail(lastEmailDate)) {
            console.log(`[REMINDER] Sending email for employee: ${employee.name} (${remainingDays} days remaining)`);
            
            const emailResult = await emailService.sendReminderEmail(
              ADMIN_EMAILS,
              {
                employeeName: employee.name,
                unit: employee.unit,
                contractEndDate: new Date(employee.contractEndDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
                daysRemaining: remainingDays,
                dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
              }
            );

            if (emailResult.success) {
              console.log(`[REMINDER] ✓ Email sent successfully to ${ADMIN_EMAILS.join(', ')}`);
              // Update lastEmailSent di database
              await employeeService.updateEmailTracking(employee.id);
            } else {
              console.error(`[REMINDER] ✗ Failed to send email: ${emailResult.error}`);
            }
          } else {
            console.log(`[REMINDER] Email sudah dikirim dalam 24 jam terakhir untuk ${employee.name}`);
          }
        }

        // Mark reminder as sent (notifikasi in-app)
        if (!employee.reminderSent) {
          await employeeService.markReminderSent(employee.id);
        }
      }

      // Add new notifications to the list (avoid duplicates)
      const existingIds = new Set(this.notifications.map(n => n.employeeId));
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.employeeId));
      
      this.notifications = [...this.notifications, ...uniqueNewNotifications];
      this.saveToStorage();
      
      return uniqueNewNotifications;
    } catch (error) {
      console.error('Error checking reminders:', error);
      return [];
    }
  }

  // Ambil semua notifikasi
  getNotifications(): ReminderNotification[] {
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Ambil notifikasi yang belum dibaca
  getUnreadNotifications(): ReminderNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Tandai notifikasi sebagai sudah dibaca
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  // Tandai semua notifikasi sebagai sudah dibaca
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  // Hapus notifikasi
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
  }

  // Clear old notifications (older than 7 days)
  clearOldNotifications(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.notifications = this.notifications.filter(n => n.createdAt > sevenDaysAgo);
    this.saveToStorage();
  }

  // Hitung sisa hari kontrak
  private getRemainingDays(endDate: Date): number {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Update status kontrak yang sudah berakhir
  async updateExpiredContracts(): Promise<void> {
    try {
      await employeeService.updateExpiredContracts();
    } catch (error) {
      console.error('Error updating expired contracts:', error);
    }
  }

  // Jalankan pemeriksaan rutin
  async runDailyCheck(): Promise<ReminderNotification[]> {
    await this.updateExpiredContracts();
    return await this.checkReminders();
  }
}

export const reminderService = new ReminderService();
