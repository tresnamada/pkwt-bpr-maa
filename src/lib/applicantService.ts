import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { Applicant, ApplicantFilter, ApplicantStats, } from '@/types/applicant';

const COLLECTION_NAME = 'applicants';

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const applicantService = {
  /**
   * Get all applicants with optional filtering
   */
  async getApplicants(filter?: ApplicantFilter): Promise<Applicant[]> {
    try {
      const applicantsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filter?.hasilAkhir) {
        constraints.push(where('hasilAkhir', '==', filter.hasilAkhir));
      }

      if (filter?.tahun) {
        constraints.push(where('tahun', '==', filter.tahun));
      }

      if (filter?.bulan) {
        constraints.push(where('bulan', '==', filter.bulan));
      }

      if (filter?.sumberLamaran) {
        constraints.push(where('sumberLamaran', '==', filter.sumberLamaran));
      }

      // Order by most recent
      constraints.push(orderBy('tanggalInput', 'desc'));

      const q = query(applicantsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const applicants = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalInput: doc.data().tanggalInput.toDate(),
        tanggalUpdate: doc.data().tanggalUpdate.toDate(),
      })) as Applicant[];

      // Client-side search filter (nama)
      if (filter?.search) {
        const searchLower = filter.search.toLowerCase();
        return applicants.filter(app =>
          app.nama.toLowerCase().includes(searchLower)
        );
      }

      return applicants;
    } catch (error) {
      console.error('Error getting applicants:', error);
      throw error;
    }
  },

  /**
   * Get single applicant by ID
   */
  async getApplicantById(id: string): Promise<Applicant | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        tanggalInput: docSnap.data().tanggalInput.toDate(),
        tanggalUpdate: docSnap.data().tanggalUpdate.toDate(),
      } as Applicant;
    } catch (error) {
      console.error('Error getting applicant:', error);
      throw error;
    }
  },

  /**
   * Create new applicant
   */
  async createApplicant(applicant: Omit<Applicant, 'id' | 'tanggalInput' | 'tanggalUpdate'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...applicant,
        tanggalInput: now,
        tanggalUpdate: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating applicant:', error);
      throw error;
    }
  },

  /**
   * Update applicant
   */
  async updateApplicant(id: string, updates: Partial<Omit<Applicant, 'id' | 'tanggalInput'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        tanggalUpdate: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  },

  /**
   * Delete applicant
   */
  async deleteApplicant(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting applicant:', error);
      throw error;
    }
  },

  /**
   * Get statistics
   */
  async getStats(): Promise<ApplicantStats> {
    try {
      const applicants = await this.getApplicants();
      
      return {
        total: applicants.length,
        lolos: applicants.filter(a => a.hasilAkhir === 'Lolos').length,
        tidakLolos: applicants.filter(a => a.hasilAkhir === 'Tidak Lolos').length,
        proses: applicants.filter(a => a.hasilAkhir === 'Proses').length,
        blmProses: applicants.filter(a => a.hasilAkhir === 'Blm Proses').length,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  /**
   * Get unique years from applicants
   */
  async getUniqueYears(): Promise<number[]> {
    try {
      const applicants = await this.getApplicants();
      const years = [...new Set(applicants.map(a => a.tahun))];
      return years.sort((a, b) => b - a);
    } catch (error) {
      console.error('Error getting unique years:', error);
      throw error;
    }
  },

  /**
   * Get unique sumber lamaran
   */
  async getUniqueSumberLamaran(): Promise<string[]> {
    try {
      const applicants = await this.getApplicants();
      const sumber = [...new Set(applicants.map(a => a.sumberLamaran))];
      return sumber.sort();
    } catch (error) {
      console.error('Error getting unique sumber lamaran:', error);
      throw error;
    }
  },

  /**
   * Helper: Get month name
   */
  getBulanName(bulan: number): string {
    return BULAN_NAMES[bulan - 1] || '';
  },

  /**
   * Helper: Get all month names
   */
  getAllBulanNames(): string[] {
    return BULAN_NAMES;
  },
};
