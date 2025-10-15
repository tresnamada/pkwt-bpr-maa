'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { performanceService } from '@/lib/performanceService';
import { PerformanceEvaluation } from '@/types/performance';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

export default function PerformancePage() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setStatistics] = useState<unknown>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evaluationsData, stats] = await Promise.all([
        performanceService.getAllEvaluations(),
        performanceService.getStatistics()
      ]);
      setEvaluations(evaluationsData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus evaluasi ini?')) {
      try {
        await performanceService.deleteEvaluation(id);
        loadData();
      } catch (error) {
        console.error('Error deleting evaluation:', error);
        alert('Gagal menghapus evaluasi');
      }
    }
  };

  const getRatingLabel = (rating: string) => {
    const labels: Record<string, string> = {
      'kurang': 'Kurang',
      'cukup': 'Cukup',
      'baik': 'Baik',
      'mahir': 'Mahir'
    };
    return labels[rating] || rating;
  };

  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      'kurang': 'bg-red-100 text-red-800',
      'cukup': 'bg-yellow-100 text-yellow-800',
      'baik': 'bg-blue-100 text-blue-800',
      'mahir': 'bg-green-100 text-green-800'
    };
    return colors[rating] || 'bg-gray-100 text-gray-800';
  };

  const filteredEvaluations = evaluations
    .filter(e => filterPosition === 'all' || e.position === filterPosition)
    .filter(e =>
      searchQuery === '' ||
      e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.unit.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const positions = Array.from(new Set(evaluations.map(e => e.position)));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 text-slate-900">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo & Title */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform p-1.5">
                  <img
                    src="/Logo Bpr.png"
                    alt="Logo BPR MAA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base md:text-xl font-bold text-gray-900 tracking-tight">Bank BPR MAA</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Rapot Kompetensi OPS</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/applicants"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pelamar
                </Link>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <LogoutButton />
                </div>
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
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Dashboard Utama
                </Link>
                <Link
                  href="/applicants"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  Database Pelamar
                </Link>
                <div className="px-4 py-3 mt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="px-4 mt-2">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Welcome Section */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Rangkuman Nilai Karyawan
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Kelola dan pantau hasil evaluasi kinerja karyawan berdasarkan jabatan
            </p>
          </div>

          {/* Rating Criteria Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-200">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kriteria Penilaian
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-3 md:p-4 border-l-4 border-red-500 shadow-sm">
                <h4 className="font-bold text-red-700 mb-1.5 md:mb-2 text-sm md:text-base flex items-center gap-1">
                  <span className="text-base md:text-lg">🔴</span> Kurang
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">Sudah mengetahui transaksi/pekerjaan namun belum mampu menjalankan secara mandiri, masih harus dibimbing untuk melakukan.</p>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border-l-4 border-yellow-500 shadow-sm">
                <h4 className="font-bold text-yellow-700 mb-1.5 md:mb-2 text-sm md:text-base flex items-center gap-1">
                  <span className="text-base md:text-lg">🟡</span> Cukup
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">Mengerti transaksi/pekerjaan dan sudah mampu menjalankan secara mandiri, namun hasil belum sesuai dengan standar (masih sering terjadi kesalahan).</p>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border-l-4 border-blue-500 shadow-sm">
                <h4 className="font-bold text-blue-700 mb-1.5 md:mb-2 text-sm md:text-base flex items-center gap-1">
                  <span className="text-base md:text-lg">🔵</span> Baik
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">Memahami transaksi/pekerjaan secara tuntas dan sudah mampu menjalankan secara mandiri, hasil sudah sesuai, tapi jika bertemu kasus berbeda enggan berpikir untuk mencari solusi.</p>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border-l-4 border-green-500 shadow-sm">
                <h4 className="font-bold text-green-700 mb-1.5 md:mb-2 text-sm md:text-base flex items-center gap-1">
                  <span className="text-base md:text-lg">🟢</span> Mahir
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">Memahami dan sudah mampu menjalankan secara mandiri, hasil sudah sesuai, dan jika bertemu kasus berbeda sudah berpikir untuk mencari alternatif solusi.</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:min-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Cari nama karyawan atau unit..."
                />
              </div>

              {/* Position Filter */}
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Jabatan</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <Link
              href="/performance/add"
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all w-full sm:w-auto"
            >
              <svg className="h-5 w-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Evaluasi</span>
            </Link>
          </div>

          {/* Evaluations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data...</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Evaluasi</h3>
              <p className="text-gray-600 mb-6">Mulai tambahkan evaluasi kinerja karyawan</p>
              <Link
                href="/performance/add"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Evaluasi Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredEvaluations.map((evaluation) => {
                const isExpanded = expandedCards.has(evaluation.id);
                return (
                  <div
                    key={evaluation.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Card Header - Always Visible */}
                    <div
                      onClick={() => toggleCard(evaluation.id)}
                      className="p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{evaluation.employeeName}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                {evaluation.position}
                              </span>
                              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                                {evaluation.unit}
                              </span>
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                {new Date(evaluation.evaluationDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-5 h-5 md:w-6 md:h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Card Body - Expandable Content */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-gray-100">
                        {/* Questions with Ratings */}
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Penilaian Kinerja
                          </h4>
                          <div className="space-y-2">
                            {evaluation.questions.map((question, index) => (
                              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 hover:bg-gray-100 transition-colors">
                                <span className="text-sm text-gray-700 flex-1">{index + 1}. {question.question}</span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${getRatingColor(question.rating)}`}>
                                  {getRatingLabel(question.rating)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {evaluation.overallNotes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              Catatan
                            </h4>
                            <p className="text-sm text-blue-800">{evaluation.overallNotes}</p>
                          </div>
                        )}

                        {/* Footer Info & Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Dievaluasi oleh: <span className="font-medium text-gray-700">{evaluation.evaluatedBy}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvaluation(evaluation.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 rounded-lg transition-colors w-fit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
