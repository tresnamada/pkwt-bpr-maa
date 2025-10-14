'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';

interface CronResult {
  success: boolean;
  timestamp: string;
  results: {
    total: number;
    sent: number;
    failed: number;
    skipped?: number;
    details: Array<{
      employeeName: string;
      status: string;
      reason?: string;
    }>;
  };
}

export default function CronSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [forceSending, setForceSending] = useState(false);
  const [result, setResult] = useState<CronResult | null>(null);
  const [error, setError] = useState<string>('');

  const testCronJob = async () => {
    setTesting(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/cron/send-reminders-v2');
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to test cron job');
    } finally {
      setTesting(false);
    }
  };

  const forceSendReminders = async () => {
    if (!confirm('⚠️ WARNING: This will send emails immediately, bypassing the 24-hour cooldown. Continue?')) {
      return;
    }

    setForceSending(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/cron/force-send-reminders');
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to force send reminders');
    } finally {
      setForceSending(false);
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Pengaturan Cron Job
                  </h1>
                </div>
                <p className="text-sm text-gray-600 ml-13">
                  Kelola jadwal pengingat otomatis email
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cron Schedule Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Jadwal Otomatis</h2>
                  <p className="text-sm text-gray-600">Pengingat email harian</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Schedule Cron</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-1">Setiap Hari, Jam 09:00 WIB</div>
                  <div className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                    Cron: 0 2 * * * (UTC) = 09:00 WIB
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Reminder Aktif</p>
                      <p className="text-xs text-gray-600">Kontrak akan berakhir ≤30 hari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Urgent</p>
                      <p className="text-xs text-gray-600">Belum evaluasi ≥30 hari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Max 1 Email / 24 Jam</p>
                      <p className="text-xs text-gray-600">Mencegah spam email</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cron Job */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Test Manual</h2>
                  <p className="text-sm text-gray-600">Jalankan cron job sekarang</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Perhatian:</p>
                      <p>Test ini akan mengirim email ke <strong>muliawanl18@gmail.com</strong> jika ada karyawan yang perlu reminder.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={testCronJob}
                  disabled={testing || forceSending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {testing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Test Normal (24h Cooldown)
                    </>
                  )}
                </button>

                {/* Force Send Button */}
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-xs text-orange-800">
                      <p className="font-semibold">Testing Only:</p>
                      <p>Bypass 24-hour cooldown dan kirim email sekarang</p>
                    </div>
                  </div>
                  <button
                    onClick={forceSendReminders}
                    disabled={testing || forceSending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    {forceSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Force Sending...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Force Send (Bypass Cooldown)
                      </>
                    )}
                  </button>
                </div>

                {/* Result Display */}
                {result && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start gap-2 mb-3">
                      <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 mb-2">✅ Test Berhasil!</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white rounded p-2 border border-green-200">
                            <span className="text-gray-600">Total:</span>
                            <span className="ml-2 font-bold text-gray-900">{result.results.total}</span>
                          </div>
                          <div className="bg-white rounded p-2 border border-green-200">
                            <span className="text-gray-600">Sent:</span>
                            <span className="ml-2 font-bold text-green-600">{result.results.sent}</span>
                          </div>
                          <div className="bg-white rounded p-2 border border-green-200">
                            <span className="text-gray-600">Skipped:</span>
                            <span className="ml-2 font-bold text-yellow-600">{result.results.skipped}</span>
                          </div>
                          <div className="bg-white rounded p-2 border border-green-200">
                            <span className="text-gray-600">Failed:</span>
                            <span className="ml-2 font-bold text-red-600">{result.results.failed}</span>
                          </div>
                        </div>
                        {result.results.details && result.results.details.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-700">Detail:</p>
                            {result.results.details.map((detail, idx: number) => (
                              <div key={idx} className="text-xs bg-white rounded p-2 border border-green-200">
                                <span className="font-medium">{detail.employeeName}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                  detail.status === 'sent' ? 'bg-green-100 text-green-800' :
                                  detail.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {detail.status}
                                </span>
                                {detail.reason && (
                                  <p className="text-gray-600 mt-1">{detail.reason}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-900 mb-1">❌ Test Gagal</p>
                        <p className="text-xs text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Email Admin</h3>
              </div>
              <p className="text-sm text-gray-600">muliawanl18@gmail.com</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              <p className="text-sm text-green-600 font-medium">✓ Aktif & Berjalan</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Platform</h3>
              </div>
              <p className="text-sm text-gray-600">Vercel Cron Jobs</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
