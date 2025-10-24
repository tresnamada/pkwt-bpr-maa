import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { BranchAdmin, UpdateBranchAdminData } from '@/types/admin';

const ADMIN_COLLECTION = 'branchAdmins';

class AdminService {
  // Create branch admin record in Firestore
  async createBranchAdmin(
    email: string,
    branch: string,
    role: 'super_admin' | 'branch_admin',
    createdBy: string
  ): Promise<string> {
    try {
      const adminData = {
        email,
        branch,
        role,
        createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, ADMIN_COLLECTION), adminData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating branch admin:', error);
      throw error;
    }
  }

  // Get all branch admins
  async getAllBranchAdmins(): Promise<BranchAdmin[]> {
    try {
      const q = query(
        collection(db, ADMIN_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as BranchAdmin[];
    } catch (error) {
      console.error('Error getting branch admins:', error);
      throw error;
    }
  }

  // Get branch admin by email
  async getBranchAdminByEmail(email: string): Promise<BranchAdmin | null> {
    try {
      const q = query(
        collection(db, ADMIN_COLLECTION),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as BranchAdmin;
    } catch (error) {
      console.error('Error getting branch admin by email:', error);
      throw error;
    }
  }

  // Get branch admins by branch
  async getBranchAdminsByBranch(branch: string): Promise<BranchAdmin[]> {
    try {
      const q = query(
        collection(db, ADMIN_COLLECTION),
        where('branch', '==', branch),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as BranchAdmin[];
    } catch (error) {
      console.error('Error getting branch admins by branch:', error);
      throw error;
    }
  }

  // Update branch admin
  async updateBranchAdmin(
    id: string,
    data: UpdateBranchAdminData
  ): Promise<void> {
    try {
      const docRef = doc(db, ADMIN_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating branch admin:', error);
      throw error;
    }
  }

  // Delete branch admin
  async deleteBranchAdmin(id: string): Promise<void> {
    try {
      const docRef = doc(db, ADMIN_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting branch admin:', error);
      throw error;
    }
  }

  // Check if user is super admin
  async isSuperAdmin(email: string): Promise<boolean> {
    try {
      const admin = await this.getBranchAdminByEmail(email);
      return admin?.role === 'super_admin';
    } catch (error) {
      console.error('Error checking super admin:', error);
      return false;
    }
  }

  // Get user's branch
  async getUserBranch(email: string): Promise<string | null> {
    try {
      const admin = await this.getBranchAdminByEmail(email);
      return admin?.branch || null;
    } catch (error) {
      console.error('Error getting user branch:', error);
      return null;
    }
  }
}

export const adminService = new AdminService();
