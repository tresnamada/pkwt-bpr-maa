'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { performanceService } from '@/lib/performanceService';
import { PerformanceEvaluation, KnowledgeEntry } from '@/types/performance';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

export default function PerformancePage() {
  const { user, isSuperAdmin, userBranch } = useAuth();
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState<'evaluation' | 'knowledge'>('evaluation');
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showAddKnowledgeModal, setShowAddKnowledgeModal] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ name: '', branch: '', score: 0, tw1: 0, tw2: 0, tw3: 0 });
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data based on user role
      let evaluationsData: PerformanceEvaluation[];
      let knowledgeData: KnowledgeEntry[];
      
      if (isSuperAdmin) {
        // Super admin can see all data
        [evaluationsData, knowledgeData] = await Promise.all([
          performanceService.getAllEvaluations(),
          performanceService.getAllKnowledgeEntries()
        ]);
      } else {
        // Branch admin can only see their own data
        if (user?.email) {
          [evaluationsData, knowledgeData] = await Promise.all([
            performanceService.getEvaluationsByCreator(user.email),
            performanceService.getKnowledgeEntriesByCreator(user.email)
          ]);
        } else {
          evaluationsData = [];
          knowledgeData = [];
        }
      }
      
      setEvaluations(evaluationsData);
      setKnowledgeEntries(knowledgeData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteKnowledge = async (id: string) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus data ini?',
      async () => {
        try {
          await performanceService.deleteKnowledgeEntry(id);
          await loadData();
          showSuccess('Data berhasil dihapus');
        } catch (error) {
          console.error('Error deleting knowledge:', error);
          showError('Gagal menghapus data');
        }
      }
    );
  };

  const handleAddKnowledge = async () => {
    // For branch admin, use their branch; for super admin, use input branch
    const branchToUse = isSuperAdmin ? newKnowledge.branch : (userBranch || '');
    
    if (!newKnowledge.name || !branchToUse) {
      showWarning('Mohon lengkapi nama dan cabang.');
      return;
    }

    if (newKnowledge.tw1 < 0 || newKnowledge.tw1 > 100 ||
        newKnowledge.tw2 < 0 || newKnowledge.tw2 > 100 ||
        newKnowledge.tw3 < 0 || newKnowledge.tw3 > 100) {
      showWarning('Nilai TW harus antara 0-100.');
      return;
    }

    if (!user?.email) {
      showError('User tidak ditemukan');
      return;
    }

    try {
      setSavingKnowledge(true);
      const knowledgeData = {
        name: newKnowledge.name,
        branch: branchToUse,
        score: newKnowledge.tw1, // Use TW1 as main score
        tw1: newKnowledge.tw1,
        tw2: newKnowledge.tw2,
        tw3: newKnowledge.tw3
      };
      await performanceService.createKnowledgeEntry(knowledgeData, user.email);
      showSuccess('Data karyawan berhasil ditambahkan!');
      setShowAddKnowledgeModal(false);
      setNewKnowledge({ name: '', branch: '', score: 0, tw1: 0, tw2: 0, tw3: 0 });
      await loadData();
    } catch (error) {
      console.error('Error adding knowledge:', error);
      showError('Gagal menambahkan data karyawan');
    } finally {
      setSavingKnowledge(false);
    }
  };
  const handleDeleteEvaluation = async (id: string) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus evaluasi ini?',
      async () => {
        try {
          await performanceService.deleteEvaluation(id);
          loadData();
          showSuccess('Evaluasi berhasil dihapus');
        } catch (error) {
          console.error('Error deleting evaluation:', error);
          showError('Gagal menghapus evaluasi');
        }
      }
    );
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

  // Filter knowledge based on branch filter and search
  const filteredKnowledge = knowledgeEntries
    .filter(k => filterBranch === 'all' || k.branch === filterBranch)
    .filter(k =>
      searchQuery === '' ||
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const positions = Array.from(new Set(evaluations.map(e => e.position)));
  const branches = Array.from(new Set(knowledgeEntries.map(k => k.branch)));

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
                  <Image
                    src="/Logo Bpr.png"
                    alt="Logo BPR MAA"
                    width={48}
                    height={48}
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
                {/* Only show Dashboard and Applicants for Super Admin */}
                {isSuperAdmin && (
                  <>
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
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500">{isSuperAdmin ? 'Super Admin' : 'Admin Cabang'}</p>
                    {!isSuperAdmin && userBranch && (
                      <p className="text-xs font-medium text-gray-700">{userBranch}</p>
                    )}
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
                {/* Only show Dashboard and Applicants for Super Admin */}
                {isSuperAdmin && (
                  <>
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
                  </>
                )}
                <div className="px-4 py-3 mt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">{isSuperAdmin ? 'Super Admin' : 'Admin Cabang'}</p>
                  {!isSuperAdmin && userBranch && (
                    <p className="text-xs font-medium text-gray-700 mt-1">{userBranch}</p>
                  )}
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
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Rapot Kompetensi OPS
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Kelola dan pantau hasil evaluasi kinerja karyawan berdasarkan jabatan
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('evaluation')}
                className={`pb-3 px-2 text-sm md:text-base font-semibold border-b-2 transition-colors ${activeTab === 'evaluation'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Skills
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{evaluations.length}</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`pb-3 px-2 text-sm md:text-base font-semibold border-b-2 transition-colors ${activeTab === 'knowledge'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Knowledge
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{knowledgeEntries.length}</span>
                </span>
              </button>
            </div>
          </div>

          {/* Rating Criteria Info - Only show for evaluation tab */}
          {activeTab === 'evaluation' && (
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
          )}

          {/* Action Bar */}
          {activeTab === 'evaluation' && (
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
          )}

          {/* Evaluations List */}
          {activeTab === 'evaluation' && (
            loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data...</p>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum Ada Evaluasi
                </h3>
                <p className="text-gray-600 mb-6">
                  Mulai tambahkan evaluasi kinerja karyawan
                </p>
                <Link
                  href="/performance/add"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
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
                      {/* Card Header */}
                      <div
                        onClick={() => {
                          const newExpanded = new Set(expandedCards);
                          if (isExpanded) {
                            newExpanded.delete(evaluation.id);
                          } else {
                            newExpanded.add(evaluation.id);
                          }
                          setExpandedCards(newExpanded);
                        }}
                        className="px-4 md:px-5 py-4 md:py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm md:text-base font-bold">
                                  {evaluation.employeeName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-900">
                                  {evaluation.employeeName}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500">
                                  {evaluation.position} • {evaluation.unit}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg
                              className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${isExpanded
                            ? 'max-h-[2000px] opacity-100'
                            : 'max-h-0 opacity-0'
                          } overflow-hidden`}
                      >
                        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-gray-100">
                          {/* Questions */}
                          <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              Penilaian Kinerja
                            </h4>
                            <div className="space-y-2">
                              {evaluation.questions.map((question, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-sm text-gray-700 flex-1">
                                    {index + 1}. {question.question}
                                  </span>
                                  <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${getRatingColor(
                                      question.rating
                                    )}`}
                                  >
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
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                  />
                                </svg>
                                Catatan
                              </h4>
                              <p className="text-sm text-blue-800">
                                {evaluation.overallNotes}
                              </p>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              Dievaluasi oleh:{' '}
                              <span className="font-medium text-gray-700">
                                {evaluation.evaluatedBy}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link
                                href={`/performance/${evaluation.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 hover:text-white hover:bg-blue-600 border border-blue-300 hover:border-blue-600 rounded-lg transition-colors w-fit"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Lihat Rapot
                              </Link>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvaluation(evaluation.id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 rounded-lg transition-colors w-fit"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}


          {/* Knowledge Section */}
          {activeTab === 'knowledge' && (
            <>
              {/* Knowledge Filter & Search */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
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
                      placeholder="Cari nama atau cabang..."
                    />
                  </div>

                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Semua Cabang</option>
                    {branches.sort().map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddKnowledgeModal(true)}
                    className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex-1 sm:flex-initial"
                  >
                    <svg className="h-5 w-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Karyawan</span>
                  </button>
                  
                  
                </div>
              </div>

              {/* Knowledge Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Memuat data...</p>
                </div>
              ) : filteredKnowledge.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">No</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cabang</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">TW 1</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">TW 2</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">TW 3</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredKnowledge.map((entry, index) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{entry.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                                {entry.branch}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                                (entry.tw1 || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                (entry.tw1 || 0) >= 60 ? 'bg-blue-100 text-blue-800' :
                                (entry.tw1 || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {entry.tw1 || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                                (entry.tw2 || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                (entry.tw2 || 0) >= 60 ? 'bg-blue-100 text-blue-800' :
                                (entry.tw2 || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {entry.tw2 || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                                (entry.tw3 || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                (entry.tw3 || 0) >= 60 ? 'bg-blue-100 text-blue-800' :
                                (entry.tw3 || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {entry.tw3 || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDeleteKnowledge(entry.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold">{filteredKnowledge.length}</span> dari <span className="font-semibold">{knowledgeEntries.length}</span> data
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Add Knowledge Modal */}
        {showAddKnowledgeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Tambah Karyawan</h3>
                <button
                  onClick={() => {
                    setShowAddKnowledgeModal(false);
                    setNewKnowledge({ name: '', branch: '', score: 0, tw1: 0, tw2: 0, tw3: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Karyawan <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newKnowledge.name}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan nama karyawan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cabang <span className="text-red-600">*</span>
                  </label>
                  {isSuperAdmin ? (
                    <input
                      type="text"
                      value={newKnowledge.branch}
                      onChange={(e) => setNewKnowledge({ ...newKnowledge, branch: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Masukkan nama cabang"
                    />
                  ) : (
                    <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-700 font-medium">
                      {userBranch || 'Cabang Anda'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      TW 1 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newKnowledge.tw1}
                      onChange={(e) => setNewKnowledge({ ...newKnowledge, tw1: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      TW 2 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newKnowledge.tw2}
                      onChange={(e) => setNewKnowledge({ ...newKnowledge, tw2: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      TW 3 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newKnowledge.tw3}
                      onChange={(e) => setNewKnowledge({ ...newKnowledge, tw3: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddKnowledgeModal(false);
                    setNewKnowledge({ name: '', branch: '', score: 0, tw1: 0, tw2: 0, tw3: 0 });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  disabled={savingKnowledge}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddKnowledge}
                  disabled={savingKnowledge}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingKnowledge ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
