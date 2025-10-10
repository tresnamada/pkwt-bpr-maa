'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import RemindersDashboard from '@/components/RemindersDashboard';
import LogoutButton from '@/components/LogoutButton';

export default function RemindersPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    
    try {
      const response = await fetch('/api/reminders/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`✅ Sync berhasil! ${data.statistics.total} reminders`);
        // Reload page to show updated data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setSyncMessage(`❌ Sync gagal: ${data.error}`);
      }
    } catch (error) {
      setSyncMessage(`❌ Error: ${error}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.5-1.5M5.07 19H19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Pengingat
                  </h1>
                </div>
                <p className="text-sm text-gray-600 ml-13">
                  Kelola dan pantau semua reminder evaluasi PKWT
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-gray-200 hover:border-red-200 hover:shadow-md transition-all"
                >
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Sync Message */}
        {syncMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className={`rounded-lg p-4 ${
              syncMessage.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {syncMessage}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Daftar Pengingat Evaluasi</h2>
            <p className="text-sm text-gray-600">
              Semua karyawan yang perlu evaluasi, diurutkan berdasarkan prioritas
            </p>
          </div>

          <RemindersDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}
