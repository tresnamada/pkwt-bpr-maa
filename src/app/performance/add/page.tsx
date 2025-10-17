'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { performanceService } from '@/lib/performanceService';
import { RatingLevel, PositionTemplate } from '@/types/performance';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

export default function AddPerformanceEvaluationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employeeName, setEmployeeName] = useState('');
  const [employeeUnit, setEmployeeUnit] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [template, setTemplate] = useState<PositionTemplate | null>(null);
  const [questionRatings, setQuestionRatings] = useState<Record<string, RatingLevel | null>>({});
  const [overallNotes, setOverallNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const positionTemplates = performanceService.getAllPositionTemplates();

  useEffect(() => {
    if (selectedPosition) {
      const tmpl = performanceService.getPositionTemplate(selectedPosition);
      setTemplate(tmpl || null);
      
      if (tmpl) {
        // Initialize question ratings
        const ratings: Record<string, RatingLevel | null> = {};
        tmpl.questions.forEach(question => {
          ratings[question.id] = null;
        });
        setQuestionRatings(ratings);
      }
    }
  }, [selectedPosition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeName.trim() || !employeeUnit.trim() || !template || !user?.email) {
      alert('Mohon lengkapi semua data');
      return;
    }

    // Validate all questions have ratings
    const allQuestionsRated = template.questions.every(question => questionRatings[question.id]);
    if (!allQuestionsRated) {
      alert('Mohon berikan penilaian untuk semua pertanyaan');
      return;
    }

    try {
      setSubmitting(true);

      const evaluationData = {
        employeeId: `manual-${Date.now()}`,
        employeeName: employeeName.trim(),
        position: selectedPosition,
        unit: employeeUnit.trim(),
        questions: template.questions.map(question => ({
          questionId: question.id,
          question: question.question,
          rating: questionRatings[question.id] as RatingLevel
        })),
        overallNotes
      };

      await performanceService.createEvaluation(evaluationData, user.email);
      alert('Evaluasi berhasil disimpan!');
      router.push('/performance');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Gagal menyimpan evaluasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: RatingLevel) => {
    const labels: Record<RatingLevel, string> = {
      'kurang': 'Kurang',
      'cukup': 'Cukup',
      'baik': 'Baik',
      'mahir': 'Mahir'
    };
    return labels[rating];
  };

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
                  <p className="text-xs text-gray-500 hidden sm:block">Tambah Evaluasi Karyawan</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/performance"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
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
                  href="/performance"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Kembali ke Dashboard
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Rating Criteria Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border border-blue-200">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kriteria Penilaian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            {/* Employee Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Karyawan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Karyawan <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan nama karyawan"
                    required
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit / Cabang <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={employeeUnit}
                    onChange={(e) => setEmployeeUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan unit/cabang"
                    required
                  />
                </div>

                {/* Position */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jabatan <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Pilih Jabatan --</option>
                    {positionTemplates.map(tmpl => (
                      <option key={tmpl.position} value={tmpl.position}>
                        {tmpl.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Questions Rating */}
            {template && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Penilaian Kinerja
                </h2>
                <div className="space-y-6">
                  {template.questions.map((question, index) => (
                    <div key={question.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {index + 1}. {question.question}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['kurang', 'cukup', 'baik', 'mahir'] as RatingLevel[]).map((rating) => (
                          <label
                            key={rating}
                            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              questionRatings[question.id] === rating
                                ? 'border-red-600 bg-red-50 text-red-900 shadow-md'
                                : 'border-gray-300 hover:border-red-300 bg-white hover:shadow'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={rating}
                              checked={questionRatings[question.id] === rating}
                              onChange={(e) => setQuestionRatings({
                                ...questionRatings,
                                [question.id]: e.target.value as RatingLevel
                              })}
                              className="sr-only"
                              required
                            />
                            <span className="text-sm font-medium">{getRatingLabel(rating)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Notes */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Catatan Tambahan
              </h2>
              <textarea
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Tambahkan catatan atau komentar tambahan (opsional)..."
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/performance"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-center"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting || !employeeName || !employeeUnit || !selectedPosition}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Evaluasi'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
