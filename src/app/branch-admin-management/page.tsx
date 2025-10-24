'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/lib/adminService';
import { BranchAdmin } from '@/types/admin';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function BranchAdminManagementPage() {
  const { user, isSuperAdmin } = useAuth();
  const [branchAdmins, setBranchAdmins] = useState<BranchAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    branch: '',
    role: 'branch_admin' as 'super_admin' | 'branch_admin'
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBranchAdmins();
  }, []);

  const loadBranchAdmins = async () => {
    try {
      setLoading(true);
      const admins = await adminService.getAllBranchAdmins();
      setBranchAdmins(admins);
    } catch (error) {
      console.error('Error loading branch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!newAdmin.email || !newAdmin.password || !newAdmin.branch) {
        setError('Mohon lengkapi semua data');
        return;
      }

      if (newAdmin.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }

      // Create admin using API route (won't logout current user)
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password,
          branch: newAdmin.branch,
          role: newAdmin.role,
          createdBy: user?.email || 'system'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat admin');
      }

      setSuccess(`Admin ${newAdmin.email} berhasil dibuat untuk cabang ${newAdmin.branch}!`);
      setNewAdmin({ email: '', password: '', branch: '', role: 'branch_admin' });
      await loadBranchAdmins();
    } catch (error: unknown) {
      let errorMessage = 'Gagal membuat admin';
      const err = error as { code?: string; message?: string };
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah digunakan';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah (minimal 6 karakter)';
          break;
        default:
          errorMessage = err.message || 'Gagal membuat admin';
      }
      
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus admin ${email}?`)) {
      return;
    }

    try {
      await adminService.deleteBranchAdmin(id);
      setSuccess(`Admin ${email} berhasil dihapus`);
      await loadBranchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError('Gagal menghapus admin');
    }
  };

  // Only super admin can access this page
  if (!isSuperAdmin && !loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Hanya Super Admin yang dapat mengakses halaman ini.</p>
            <Link
              href="/dashboard"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-slate-700">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manajemen Admin Cabang
                </h1>
                <p className="text-gray-600">Kelola admin untuk setiap cabang</p>
              </div>
              <Link
                href="/dashboard"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Current Admin Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Saat Ini</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Role:</strong> Super Admin
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Admin Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tambah Admin Cabang</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Admin cabang hanya dapat melihat dan mengelola data karyawan di cabang mereka sendiri.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Admin
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="admin.cabang@bprmaa.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    minLength={6}
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Nama Cabang
                  </label>
                  <input
                    type="text"
                    id="branch"
                    required
                    value={newAdmin.branch}
                    onChange={(e) => setNewAdmin({ ...newAdmin, branch: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Contoh: Cabang Jakarta"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as 'super_admin' | 'branch_admin' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="branch_admin">Branch Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {creating ? 'Membuat Admin...' : 'Buat Admin Cabang'}
                </button>
              </form>
            </div>

            {/* List of Branch Admins */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daftar Admin Cabang</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Memuat data...</p>
                </div>
              ) : branchAdmins.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600">Belum ada admin cabang</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {branchAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{admin.email}</h3>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                admin.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {admin.role === 'super_admin' ? 'Super Admin' : 'Branch Admin'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Cabang:</span> {admin.branch}
                          </p>
                          <p className="text-xs text-gray-500">
                            Dibuat: {new Date(admin.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          className="text-red-600 hover:text-red-900 transition-colors p-2"
                          title="Hapus Admin"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
