'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { adminService } from '@/lib/adminService';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState('Pusat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Firebase auth user
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Create super admin record in Firestore
      await adminService.createBranchAdmin(
        email,
        branch,
        'super_admin',
        'system'
      );
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let errorMessage = 'Gagal membuat admin';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah digunakan';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah';
          break;
        default:
          errorMessage = err.message || 'Gagal membuat admin';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Super Admin berhasil dibuat!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Email: <strong>{email}</strong></p>
                  <p>Role: <strong>Super Admin</strong></p>
                  <p className="mt-2">Anda akan diarahkan ke halaman login...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setup Super Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Buat akun Super Admin pertama untuk sistem PKWT BPR MAA
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Penting:</strong> Halaman ini hanya untuk setup Super Admin pertama. 
                Super Admin memiliki akses penuh ke semua fitur termasuk manajemen admin cabang.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="admin@bprmaa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Nama Cabang/Unit
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contoh: Pusat, Kantor Pusat"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Super Admin dapat melihat dan mengelola semua cabang
              </p>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Membuat Super Admin...' : 'Buat Super Admin'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Sudah punya akun admin? Login di sini
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
