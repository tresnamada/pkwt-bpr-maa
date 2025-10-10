import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Reminder, CreateReminderData } from '@/types/reminder';

const REMINDERS_COLLECTION = 'reminders';

export const reminderDatabase = {
  // Buat reminder baru
  async createReminder(data: CreateReminderData): Promise<string> {
    // Cek apakah reminder untuk employee ini sudah ada
    const existing = await this.getReminderByEmployeeId(data.employeeId);
    if (existing) {
      // Update existing reminder instead
      await this.updateReminder(existing.id, {
        daysRemaining: data.daysRemaining,
        reminderType: data.reminderType,
      });
      return existing.id;
    }

    // Tentukan priority berdasarkan daysRemaining
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    if (data.daysRemaining < 0) {
      // Overdue
      if (Math.abs(data.daysRemaining) >= 30) {
        priority = 'urgent';
      } else if (Math.abs(data.daysRemaining) >= 14) {
        priority = 'high';
      } else {
        priority = 'medium';
      }
    } else {
      // Upcoming
      if (data.daysRemaining <= 7) {
        priority = 'high';
      } else if (data.daysRemaining <= 14) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
    }

    const reminderData = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      unit: data.unit,
      contractEndDate: Timestamp.fromDate(data.contractEndDate),
      reminderType: data.reminderType,
      daysRemaining: data.daysRemaining,
      status: 'pending',
      emailCount: 0,
      priority: priority,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), reminderData);
    return docRef.id;
  },

  // Ambil semua reminders
  async getAllReminders(): Promise<Reminder[]> {
    // Simple query without orderBy to avoid composite index
    const q = query(collection(db, REMINDERS_COLLECTION));
    
    const querySnapshot = await getDocs(q);
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastEmailSent: doc.data().lastEmailSent ? doc.data().lastEmailSent.toDate() : undefined,
      resolvedAt: doc.data().resolvedAt ? doc.data().resolvedAt.toDate() : undefined,
    })) as Reminder[];

    // Sort in memory by priority then daysRemaining
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return reminders.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.daysRemaining - b.daysRemaining;
    });
  },

  // Ambil reminders yang pending (belum resolved)
  async getPendingReminders(): Promise<Reminder[]> {
    // Query tanpa orderBy untuk avoid composite index
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('status', 'in', ['pending', 'notified'])
    );
    
    const querySnapshot = await getDocs(q);
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastEmailSent: doc.data().lastEmailSent ? doc.data().lastEmailSent.toDate() : undefined,
      resolvedAt: doc.data().resolvedAt ? doc.data().resolvedAt.toDate() : undefined,
    })) as Reminder[];

    // Sort in memory by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },

  // Ambil reminders berdasarkan priority
  async getRemindersByPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<Reminder[]> {
    // Get all pending reminders first
    const allPending = await this.getPendingReminders();
    
    // Filter by priority in memory
    return allPending.filter(r => r.priority === priority);
  },

  // Ambil reminder berdasarkan employeeId
  async getReminderByEmployeeId(employeeId: string): Promise<Reminder | null> {
    // Query by employeeId only, filter status in memory
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('employeeId', '==', employeeId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    // Filter pending/notified in memory
    const pendingDocs = querySnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return status === 'pending' || status === 'notified';
    });

    if (pendingDocs.length === 0) {
      return null;
    }

    const doc = pendingDocs[0];
    return {
      id: doc.id,
      ...doc.data(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastEmailSent: doc.data().lastEmailSent ? doc.data().lastEmailSent.toDate() : undefined,
      resolvedAt: doc.data().resolvedAt ? doc.data().resolvedAt.toDate() : undefined,
    } as Reminder;
  },

  // Ambil reminders yang perlu kirim email (belum kirim dalam 24 jam)
  async getRemindersNeedingEmail(): Promise<Reminder[]> {
    const allReminders = await this.getPendingReminders();
    const now = new Date();
    
    return allReminders.filter(reminder => {
      // Jika belum pernah kirim email, kirim sekarang
      if (!reminder.lastEmailSent) {
        return true;
      }
      
      // Cek apakah sudah 24 jam sejak email terakhir
      const hoursSinceLastEmail = (now.getTime() - reminder.lastEmailSent.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastEmail >= 24;
    });
  },

  // Update reminder
  async updateReminder(reminderId: string, updates: Partial<{
    daysRemaining: number;
    reminderType: string;
    status: string;
    contractEndDate: Date;
    lastEmailSent: Date;
    resolvedAt: Date;
  }>): Promise<void> {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Timestamps
    if (updates.contractEndDate && updates.contractEndDate instanceof Date) {
      updateData.contractEndDate = Timestamp.fromDate(updates.contractEndDate);
    }
    if (updates.lastEmailSent && updates.lastEmailSent instanceof Date) {
      updateData.lastEmailSent = Timestamp.fromDate(updates.lastEmailSent);
    }
    if (updates.resolvedAt && updates.resolvedAt instanceof Date) {
      updateData.resolvedAt = Timestamp.fromDate(updates.resolvedAt);
    }

    await updateDoc(reminderRef, updateData);
  },

  // Mark reminder as notified (email sent)
  async markAsNotified(reminderId: string): Promise<void> {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    const reminderDoc = await getDoc(reminderRef);
    
    if (!reminderDoc.exists()) {
      throw new Error('Reminder not found');
    }

    const currentData = reminderDoc.data();
    
    await updateDoc(reminderRef, {
      status: 'notified',
      lastEmailSent: Timestamp.now(),
      emailCount: (currentData.emailCount || 0) + 1,
      updatedAt: Timestamp.now(),
    });
  },

  // Mark reminder as resolved (employee evaluated)
  async markAsResolved(reminderId: string, resolvedBy: string): Promise<void> {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    
    await updateDoc(reminderRef, {
      status: 'resolved',
      resolvedAt: Timestamp.now(),
      resolvedBy: resolvedBy,
      updatedAt: Timestamp.now(),
    });
  },

  // Resolve reminder by employeeId (dipanggil saat employee dievaluasi)
  async resolveReminderByEmployeeId(employeeId: string, resolvedBy: string): Promise<void> {
    const reminder = await this.getReminderByEmployeeId(employeeId);
    if (reminder) {
      await this.markAsResolved(reminder.id, resolvedBy);
    }
  },

  // Delete reminder
  async deleteReminder(reminderId: string): Promise<void> {
    await deleteDoc(doc(db, REMINDERS_COLLECTION, reminderId));
  },

  // Delete reminder by employeeId (dipanggil saat employee dihapus)
  async deleteReminderByEmployeeId(employeeId: string): Promise<void> {
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('employeeId', '==', employeeId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Delete all reminders for this employee
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
  },

  // Batch create reminders dari employees
  async syncRemindersFromEmployees(employees: Array<{
    id: string;
    name: string;
    unit: string;
    contractEndDate: Date;
    status: string;
  }>): Promise<void> {
    const now = new Date();

    for (const employee of employees) {
      const daysRemaining = Math.ceil((employee.contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Skip jika sudah dievaluasi
      if (employee.status === 'evaluated') {
        // Resolve reminder jika ada
        const existing = await this.getReminderByEmployeeId(employee.id);
        if (existing) {
          await this.markAsResolved(existing.id, 'System');
        }
        continue;
      }

      // Buat/update reminder jika perlu
      if (daysRemaining <= 30 || employee.status === 'expired') {
        const reminderType = daysRemaining < 0 ? 'overdue' : 'upcoming';
        
        await this.createReminder({
          employeeId: employee.id,
          employeeName: employee.name,
          unit: employee.unit,
          contractEndDate: employee.contractEndDate,
          reminderType: reminderType,
          daysRemaining: daysRemaining,
        });
      }
    }
  },

  // Get statistics
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    notified: number;
    resolved: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const allReminders = await this.getAllReminders();
    
    return {
      total: allReminders.length,
      pending: allReminders.filter(r => r.status === 'pending').length,
      notified: allReminders.filter(r => r.status === 'notified').length,
      resolved: allReminders.filter(r => r.status === 'resolved').length,
      urgent: allReminders.filter(r => r.priority === 'urgent').length,
      high: allReminders.filter(r => r.priority === 'high').length,
      medium: allReminders.filter(r => r.priority === 'medium').length,
      low: allReminders.filter(r => r.priority === 'low').length,
    };
  },
};
