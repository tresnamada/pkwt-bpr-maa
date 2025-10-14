'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import RemindersDashboard from '@/components/RemindersDashboard';
import LogoutButton from '@/components/LogoutButton';

export default function RemindersPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    
    try {
      const response = await fetch('/api/reminders/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`✅ Sync berhasil! ${data.statistics.total} reminders`);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo & Title */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.5-1.5M9 17H4l1.5-1.5M9 3v4m0 4v10m6-18v4m0 4v10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Pengingat Evaluasi</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Sistem Reminder PKWT</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <div className="w-px h-8 bg-gray-200"></div>
                <LogoutButton />
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Kembali ke Dashboard
                </Link>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg shadow-md transition-all disabled:opacity-50"
                >
                  <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </button>
                <div className="px-4 mt-3 pt-3 border-t border-gray-200">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Sync Message Alert */}
        {syncMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className={`rounded-2xl p-5 shadow-sm border-l-4 ${
              syncMessage.includes('✅') 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-600' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-600'
            }`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    syncMessage.includes('✅') ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {syncMessage.includes('✅') ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    syncMessage.includes('✅') ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {syncMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Page Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Daftar Pengingat
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Semua karyawan yang perlu evaluasi, diurutkan berdasarkan prioritas dan tanggal kontrak
                </p>
              </div>
              
              {/* Desktop Sync Button */}
              <button
                onClick={handleSync}
                disabled={syncing}
                className="hidden md:flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{syncing ? 'Syncing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Status Urgent</p>
                  <p className="text-sm text-gray-700">Prioritas Tertinggi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Auto Reminder</p>
                  <p className="text-sm text-gray-700">Notifikasi Otomatis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Tracking Status</p>
                  <p className="text-sm text-gray-700">Monitoring Real-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reminders Dashboard Component */}
          <RemindersDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}