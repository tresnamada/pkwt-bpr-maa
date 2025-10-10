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
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Employee, CreateEmployeeData, EvaluationData, HistoryEntry } from '@/types/employee';
import { reminderDatabase } from './reminderDatabase';
const EMPLOYEES_COLLECTION = 'employees';


export const employeeService = {
  // Tambah karyawan baru
  async createEmployee(data: CreateEmployeeData): Promise<string> {
    const initialHistory: HistoryEntry = {
      id: crypto.randomUUID(),
      action: 'Karyawan Dibuat',
      details: `Karyawan ${data.name} ditambahkan dengan kontrak dari ${data.contractStartDate.toLocaleDateString('id-ID')} hingga ${data.contractEndDate.toLocaleDateString('id-ID')}`,
      timestamp: new Date(),
      performedBy: 'Admin'
    };

    const employeeData = {
      name: data.name,
      unit: data.unit,
      contractStartDate: Timestamp.fromDate(data.contractStartDate),
      contractEndDate: Timestamp.fromDate(data.contractEndDate),
      status: 'active',
      history: [{
        ...initialHistory,
        timestamp: Timestamp.fromDate(initialHistory.timestamp)
      }],
      reminderSent: false,
      emailReminderCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);
    return docRef.id;
  },

  // Ambil semua karyawan
  async getAllEmployees(): Promise<Employee[]> {
    const q = query(
      collection(db, EMPLOYEES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractStartDate: doc.data().contractStartDate.toDate(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastReminderEmailSent: doc.data().lastReminderEmailSent ? doc.data().lastReminderEmailSent.toDate() : undefined,
      emailReminderCount: doc.data().emailReminderCount || 0,
      history: doc.data().history ? doc.data().history.map((h: { id: string; action: string; details: string; timestamp: { toDate: () => Date }; performedBy: string }) => ({
        ...h,
        timestamp: h.timestamp.toDate(),
      })) : [],
      evaluation: doc.data().evaluation ? {
        ...doc.data().evaluation,
        evaluatedAt: doc.data().evaluation.evaluatedAt.toDate(),
      } : undefined,
    })) as Employee[];
  },

  // Ambil karyawan yang perlu diingatkan (sisa 1 bulan)
  async getEmployeesNeedingReminder(): Promise<Employee[]> {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    // Simplified query - filter by status first, then filter in memory
    const q = query(
        collection(db, EMPLOYEES_COLLECTION),
        where('status', '==', 'active')
      );
      

    const querySnapshot = await getDocs(q);
    const allActiveEmployees = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractStartDate: doc.data().contractStartDate.toDate(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastReminderEmailSent: doc.data().lastReminderEmailSent 
        ? doc.data().lastReminderEmailSent.toDate() 
        : undefined,
      emailReminderCount: doc.data().emailReminderCount || 0,
      history: doc.data().history 
        ? doc.data().history.map((h: { id: string; action: string; details: string; timestamp: { toDate: () => Date }; performedBy: string }) => ({
            ...h,
            timestamp: h.timestamp.toDate(),
          })) 
        : [],
    })) as Employee[];

allActiveEmployees.sort((a, b) => a.contractEndDate.getTime() - b.contractEndDate.getTime());


    // Filter in memory to avoid composite index requirement
    return allActiveEmployees.filter(employee => 
      employee.contractEndDate <= oneMonthFromNow && 
      !employee.reminderSent
    );
  },

  // Update status reminder
  async markReminderSent(employeeId: string): Promise<void> {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    
    // Get current employee data to add to history
    const employeeDoc = await getDoc(employeeRef);
    const currentEmployee = employeeDoc.data();
    
    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: 'Pengingat Dikirim',
      details: 'Pengingat evaluasi telah dikirim kepada admin',
      timestamp: new Date(),
      performedBy: 'System'
    };

    const updatedHistory = [
      ...(currentEmployee?.history || []),
      {
        ...historyEntry,
        timestamp: Timestamp.fromDate(historyEntry.timestamp)
      }
    ];

    await updateDoc(employeeRef, {
      reminderSent: true,
      history: updatedHistory,
      updatedAt: Timestamp.now(),
    });
  },

  // Tambah evaluasi
  async addEvaluation(employeeId: string, evaluation: EvaluationData, evaluatedBy: string): Promise<void> {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    
    // Get current employee data to add to history
    const employeeDoc = await getDoc(employeeRef);
    const currentEmployee = employeeDoc.data();
    
    const getResultDescription = (result: string) => {
      switch(result) {
        case 'lanjut': return 'Kontrak dilanjutkan untuk periode berikutnya';
        case 'diangkat': return 'Karyawan diangkat menjadi karyawan tetap';
        case 'dilepas': return 'Kontrak tidak dilanjutkan';
        default: return 'Evaluasi selesai';
      }
    };

    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: 'Evaluasi Selesai',
      details: `${getResultDescription(evaluation.result)} - Rating: ${evaluation.rating}/5`,
      timestamp: new Date(),
      performedBy: evaluatedBy
    };

    const updatedHistory = [
      ...(currentEmployee?.history || []),
      {
        ...historyEntry,
        timestamp: Timestamp.fromDate(historyEntry.timestamp)
      }
    ];

    await updateDoc(employeeRef, {
      evaluation: {
        ...evaluation,
        evaluatedAt: Timestamp.now(),
        evaluatedBy,
      },
      history: updatedHistory,
      status: 'evaluated',
      updatedAt: Timestamp.now(),
    });
  },

  // Ambil karyawan yang sudah dievaluasi
  async getEvaluatedEmployees(): Promise<Employee[]> {
    // Simplified query - filter by status only, then sort in memory
    const q = query(
      collection(db, EMPLOYEES_COLLECTION),
      where('status', '==', 'evaluated')
    );
    
    const querySnapshot = await getDocs(q);
    const evaluatedEmployees = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractStartDate: doc.data().contractStartDate.toDate(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastReminderEmailSent: doc.data().lastReminderEmailSent ? doc.data().lastReminderEmailSent.toDate() : undefined,
      emailReminderCount: doc.data().emailReminderCount || 0,
      history: doc.data().history ? doc.data().history.map((h: { id: string; action: string; details: string; timestamp: { toDate: () => Date }; performedBy: string }) => ({
        ...h,
        timestamp: h.timestamp.toDate(),
      })) : [],
      evaluation: doc.data().evaluation ? {
        ...doc.data().evaluation,
        evaluatedAt: doc.data().evaluation.evaluatedAt.toDate(),
      } : undefined,
    })) as Employee[];

    // Sort by updatedAt in memory to avoid composite index requirement
    return evaluatedEmployees.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  // Hapus karyawan (dengan history tracking)
  async deleteEmployee(employeeId: string): Promise<void> {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const employeeDoc = await getDoc(employeeRef);

    if (!employeeDoc.exists()) {
      throw new Error('Employee not found');
    }

    // Delete associated reminders first
    try {
      await reminderDatabase.deleteReminderByEmployeeId(employeeId);
      console.log(`[DELETE] Reminders deleted for employee: ${employeeId}`);
    } catch (error) {
      console.error('[DELETE] Error deleting reminders:', error);
      // Continue with employee deletion even if reminder deletion fails
    }

    // Hard delete (permanent removal)
    await deleteDoc(employeeRef);
  },

  // Update status karyawan yang kontraknya sudah berakhir
  async updateExpiredContracts(): Promise<void> {
    const today = new Date();
    
    // Simplified query - get all active employees and filter in memory
    const q = query(
      collection(db, EMPLOYEES_COLLECTION),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const expiredEmployees = querySnapshot.docs.filter(doc => {
      const contractEndDate = doc.data().contractEndDate.toDate();
      return contractEndDate < today;
    });

    const updatePromises = expiredEmployees.map(docSnapshot => {
      const employeeRef = doc(db, EMPLOYEES_COLLECTION, docSnapshot.id);
      return updateDoc(employeeRef, {
        status: 'expired',
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(updatePromises);
  },

  // Update email tracking setelah mengirim reminder
  async updateEmailTracking(employeeId: string): Promise<void> {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    
    // Get current employee data
    const employeeDoc = await getDoc(employeeRef);
    const currentEmployee = employeeDoc.data();
    
    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: 'Email Reminder Dikirim',
      details: 'Email pengingat evaluasi telah dikirim ke admin',
      timestamp: new Date(),
      performedBy: 'System'
    };

    const updatedHistory = [
      ...(currentEmployee?.history || []),
      {
        ...historyEntry,
        timestamp: Timestamp.fromDate(historyEntry.timestamp)
      }
    ];

    await updateDoc(employeeRef, {
      lastReminderEmailSent: Timestamp.now(),
      emailReminderCount: (currentEmployee?.emailReminderCount || 0) + 1,
      history: updatedHistory,
      updatedAt: Timestamp.now(),
    });
  },

  // Ambil karyawan yang belum dievaluasi (status expired)
  async getUnevaluatedEmployees(): Promise<Employee[]> {
    const q = query(
      collection(db, EMPLOYEES_COLLECTION),
      where('status', '==', 'expired')
    );
    
    const querySnapshot = await getDocs(q);
    const unevaluatedEmployees = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contractStartDate: doc.data().contractStartDate.toDate(),
      contractEndDate: doc.data().contractEndDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastReminderEmailSent: doc.data().lastReminderEmailSent ? doc.data().lastReminderEmailSent.toDate() : undefined,
      emailReminderCount: doc.data().emailReminderCount || 0,
      history: doc.data().history ? doc.data().history.map((h: { id: string; action: string; details: string; timestamp: { toDate: () => Date }; performedBy: string }) => ({
        ...h,
        timestamp: h.timestamp.toDate(),
      })) : [],
    })) as Employee[];

    return unevaluatedEmployees;
  },

  // Ambil karyawan yang belum dievaluasi dan perlu email reminder (30 hari sejak expired)
  async getUnevaluatedNeedingEmailReminder(): Promise<Employee[]> {
    const unevaluatedEmployees = await this.getUnevaluatedEmployees();
    const today = new Date();
    
    return unevaluatedEmployees.filter(employee => {
      const daysSinceExpired = Math.floor((today.getTime() - employee.contractEndDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Kirim email jika sudah 30 hari sejak kontrak berakhir
      if (daysSinceExpired >= 30) {
        // Cek apakah email sudah dikirim dalam 24 jam terakhir
        if (employee.lastReminderEmailSent) {
          const hoursSinceLastEmail = (today.getTime() - employee.lastReminderEmailSent.getTime()) / (1000 * 60 * 60);
          return hoursSinceLastEmail >= 24;
        }
        return true;
      }
      
      return false;
    });
  },

  // Hapus multiple karyawan sekaligus
  async deleteMultipleEmployees(employeeIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const employeeId of employeeIds) {
      try {
        await this.deleteEmployee(employeeId);
        success++;
      } catch (error: unknown) {
        const err = error as Error;
        failed++;
        errors.push(`Failed to delete ${employeeId}: ${err.message}`);
      }
    }

    return { success, failed, errors };
  },
};
