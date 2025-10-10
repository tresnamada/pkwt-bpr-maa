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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set persistence to LOCAL (survives browser restart)
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
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
