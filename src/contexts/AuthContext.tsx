'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { adminService } from '@/lib/adminService';
import { BranchAdmin } from '@/types/admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  adminData: BranchAdmin | null;
  isSuperAdmin: boolean;
  userBranch: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAdminData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<BranchAdmin | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userBranch, setUserBranch] = useState<string | null>(null);

  // Set persistence to LOCAL (survives browser restart)
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });
  }, []);

  // Function to load admin data
  const loadAdminData = async (userEmail: string) => {
    try {
      const admin = await adminService.getBranchAdminByEmail(userEmail);
      setAdminData(admin);
      setIsSuperAdmin(admin?.role === 'super_admin');
      setUserBranch(admin?.branch || null);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setAdminData(null);
      setIsSuperAdmin(false);
      setUserBranch(null);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      async (user) => {
        setUser(user);
        if (user?.email) {
          await loadAdminData(user.email);
        } else {
          setAdminData(null);
          setIsSuperAdmin(false);
          setUserBranch(null);
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(getErrorMessage(error));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Login function with comprehensive error handling
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      if (!email.includes('@')) {
        throw new Error('Format email tidak valid');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Attempt login
      await signInWithEmailAndPassword(auth, email, password);
      
      // Success - user state will be updated by onAuthStateChanged
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function with error handling
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      // Success - user state will be updated by onAuthStateChanged
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh admin data
  const refreshAdminData = async () => {
    if (user?.email) {
      await loadAdminData(user.email);
    }
  };

  const value = {
    user,
    loading,
    error,
    adminData,
    isSuperAdmin,
    userBranch,
    login,
    logout,
    clearError,
    refreshAdminData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to convert Firebase errors to user-friendly messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const authError = error as AuthError;
    
    switch (authError.code) {
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan';
      case 'auth/user-not-found':
        return 'Email tidak terdaftar';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/invalid-credential':
        return 'Email atau password salah';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Coba lagi nanti';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah. Coba lagi';
      case 'auth/email-already-in-use':
        return 'Email sudah digunakan';
      case 'auth/weak-password':
        return 'Password terlalu lemah. Minimal 6 karakter';
      case 'auth/requires-recent-login':
        return 'Silakan login ulang untuk melanjutkan';
      case 'auth/operation-not-allowed':
        return 'Metode login ini tidak diizinkan';
      default:
        return authError.message || 'Terjadi kesalahan. Silakan coba lagi';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan yang tidak diketahui';
}
