import { db } from './firebase';
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
import { 
  PerformanceEvaluation, 
  CreatePerformanceEvaluationData,
  PositionTemplate 
} from '@/types/performance';

const COLLECTION_NAME = 'performanceEvaluations';


export const positionTemplates: PositionTemplate[] = [
  {
    position: 'Staf Kas',
    aspects: [],
    questions: [
      {
        id: 'kas_q1',
        question: 'Ketepatan hitung uang menggunakan jari',
        rating: null
      },
      {
        id: 'kas_q2',
        question: 'Ketepatan identifikasi uang palsu tanpa bantuan mesin hitung/UV',
        rating: null
      },
      {
        id: 'kas_q3',
        question: 'Ketepatan identifikasi UTLE dan ULE',
        rating: null
      },
      {
        id: 'kas_q4',
        question: 'Ketepatan pelayanan penarikan dan penyetoran uang (voucher dan kelengkapan transaksi)',
        rating: null
      },
      {
        id: 'kas_q5',
        question: 'Ketepatan transaksi back office / penjurnalan transaksi (voucher dan kelengkapan transaksi)',
        rating: null
      }
    ]
  },
  {
    position: 'Staf Layanan Nasabah',
    aspects: [],
    questions: [
      {
        id: 'layanan_q1',
        question: 'Ketepatan perhitungan bunga tabungan dan deposito',
        rating: null
      },
      {
        id: 'layanan_q2',
        question: 'Ketepatan dan kecakapan dalam memberikan informasi produk Dana',
        rating: null
      },
      {
        id: 'layanan_q3',
        question: 'Ketepatan dan kecakapan dalam memberikan informasi produk Kredit',
        rating: null
      },
      {
        id: 'layanan_q4',
        question: 'Kemampuan menangani komplain nasabah',
        rating: null
      },
      {
        id: 'layanan_q5',
        question: 'Kemampuan melakukan pengkinian data',
        rating: null
      }
    ]
  },
  {
    position: 'Staf Pinjaman',
    aspects: [],
    questions: [
      {
        id: 'pinjaman_q1',
        question: 'Ketepatan perhitungan bunga pinjaman dan pelunasan',
        rating: null
      },
      {
        id: 'pinjaman_q2',
        question: 'Ketepatan transaksi droping, pembayaran angsuran, dan back office',
        rating: null
      },
      {
        id: 'pinjaman_q3',
        question: 'Ketepatan pemilihan sandi SLIK dan LB BPR',
        rating: null
      },
      {
        id: 'pinjaman_q4',
        question: 'Ketepatan identifikasi dan verifikasi pelunasan disertai pengambilan jaminan',
        rating: null
      },
      {
        id: 'pinjaman_q5',
        question: 'Ketepatan penginputan data agunan',
        rating: null
      }
    ]
  },
  {
    position: 'Staf Pengikatan',
    aspects: [],
    questions: [
      {
        id: 'pengikatan_q1',
        question: 'Kecakapan dalam proses review MUK',
        rating: null
      },
      {
        id: 'pengikatan_q2',
        question: 'Ketepatan penghitungan nilai HT',
        rating: null
      },
      {
        id: 'pengikatan_q3',
        question: 'Ketepatan pembuatan MPF',
        rating: null
      },
      {
        id: 'pengikatan_q4',
        question: 'Kecakapan dan ketepatan dalam proses akad kredit',
        rating: null
      },
      {
        id: 'pengikatan_q5',
        question: 'Ketepatan dan ketelitian pembuatan order notaris dan PK/PPK intern',
        rating: null
      }
    ]
  },
  {
    position: 'Staf Admin',
    aspects: [],
    questions: [
      {
        id: 'admin_q1',
        question: 'Ketepatan dan kerapian administrasi serta penyimpanan MUK',
        rating: null
      },
      {
        id: 'admin_q2',
        question: 'Ketepatan perhitungan asuransi jiwa dan TLO',
        rating: null
      },
      {
        id: 'admin_q3',
        question: 'Ketepatan dalam proses administrasi dan penyimpanan agunan',
        rating: null
      },
      {
        id: 'admin_q4',
        question: 'Ketepatan administrasi pasca pengikatan',
        rating: null
      },
      {
        id: 'admin_q5',
        question: 'Kecakapan dalam tindak lanjut berkas notaris / pendingan notaris',
        rating: null
      }
    ]
  }
];

class PerformanceService {
  // Get position template by position name
  getPositionTemplate(position: string): PositionTemplate | undefined {
    return positionTemplates.find(
      template => template.position.toLowerCase() === position.toLowerCase()
    );
  }

  // Get all position templates
  getAllPositionTemplates(): PositionTemplate[] {
    return positionTemplates;
  }

  // Create new performance evaluation
  async createEvaluation(
    data: CreatePerformanceEvaluationData,
    evaluatedBy: string
  ): Promise<string> {
    try {
      const evaluationData = {
        ...data,
        evaluationDate: Timestamp.now(),
        evaluatedBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), evaluationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating performance evaluation:', error);
      throw error;
    }
  }

  // Get all evaluations
  async getAllEvaluations(): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('evaluationDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        evaluationDate: doc.data().evaluationDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations:', error);
      throw error;
    }
  }

  // Get evaluations by employee ID
  async getEvaluationsByEmployee(employeeId: string): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('evaluationDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        evaluationDate: doc.data().evaluationDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations by employee:', error);
      throw error;
    }
  }

  // Get evaluations by position
  async getEvaluationsByPosition(position: string): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('position', '==', position),
        orderBy('evaluationDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        evaluationDate: doc.data().evaluationDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations by position:', error);
      throw error;
    }
  }

  // Get single evaluation by ID
  async getEvaluationById(id: string): Promise<PerformanceEvaluation | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          evaluationDate: docSnap.data().evaluationDate?.toDate() || new Date(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as PerformanceEvaluation;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting evaluation:', error);
      throw error;
    }
  }

  // Update evaluation
  async updateEvaluation(
    id: string,
    data: Partial<CreatePerformanceEvaluationData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
  }

  // Delete evaluation
  async deleteEvaluation(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const evaluations = await this.getAllEvaluations();
      
      const stats = {
        total: evaluations.length,
        byPosition: {} as Record<string, number>,
        byRating: {
          kurang: 0,
          cukup: 0,
          baik: 0,
          mahir: 0
        },
        recentEvaluations: evaluations.slice(0, 5)
      };

      evaluations.forEach(evaluation => {
        // Count by position
        stats.byPosition[evaluation.position] = 
          (stats.byPosition[evaluation.position] || 0) + 1;

        // Count by rating from questions
        evaluation.questions.forEach(question => {
          if (question.rating) {
            stats.byRating[question.rating]++;
          }
        });
      });

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

export const performanceService = new PerformanceService();
