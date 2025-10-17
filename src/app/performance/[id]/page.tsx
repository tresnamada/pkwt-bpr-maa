'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { performanceService } from '@/lib/performanceService';
import { PerformanceEvaluation, RatingLevel } from '@/types/performance';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

export default function EmployeePerformanceDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<PerformanceEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRatings, setEditedRatings] = useState<Record<string, RatingLevel>>({});
  const [editedNotes, setEditedNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadEvaluation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceService.getEvaluationById(params.id as string);
      setEvaluation(data);

      if (data) {
        // Initialize edited values with current values
        const ratings: Record<string, RatingLevel> = {};
        data.questions.forEach(q => {
          ratings[q.questionId] = q.rating;
        });
        setEditedRatings(ratings);
        setEditedNotes(data.overallNotes);
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      alert('Gagal memuat data evaluasi');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (evaluation) {
      // Reset to original values
      const ratings: Record<string, RatingLevel> = {};
      evaluation.questions.forEach(q => {
        ratings[q.questionId] = q.rating;
      });
      setEditedRatings(ratings);
      setEditedNotes(evaluation.overallNotes);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!evaluation || !user?.email) return;

    try {
      setSubmitting(true);

      const updatedQuestions = evaluation.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        rating: editedRatings[q.questionId]
      }));

      await performanceService.updateEvaluation(
        evaluation.id,
        {
          questions: updatedQuestions,
          overallNotes: editedNotes
        },
        user.email
      );

      alert('Evaluasi berhasil diperbarui!');
      setIsEditing(false);
      await loadEvaluation(); // Reload to get updated data with history
    } catch (error) {
      console.error('Error updating evaluation:', error);
      alert('Gagal memperbarui evaluasi. Silakan coba lagi.');
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

  const getRatingColor = (rating: RatingLevel) => {
    const colors: Record<RatingLevel, string> = {
      'kurang': 'bg-red-100 text-red-800 border-red-300',
      'cukup': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'baik': 'bg-blue-100 text-blue-800 border-blue-300',
      'mahir': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[rating];
  };

  const getRatingEmoji = (rating: RatingLevel) => {
    const emojis: Record<RatingLevel, string> = {
      'kurang': '🔴',
      'cukup': '🟡',
      'baik': '🔵',
      'mahir': '🟢'
    };
    return emojis[rating];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!evaluation) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data tidak ditemukan</h2>
            <Link
              href="/performance"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Kembali ke Daftar Evaluasi
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                  <p className="text-xs text-gray-500 hidden sm:block">Rapot Karyawan</p>
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
                  Kembali ke Daftar
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Header Card - Like Report Card Cover */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-2xl p-6 md:p-8 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{evaluation.employeeName}</h2>
                  <p className="text-red-100 text-sm md:text-base">{evaluation.position}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="hidden md:flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Nilai
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-red-100 text-xs mb-1">Unit/Cabang</p>
                <p className="font-semibold">{evaluation.unit}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-red-100 text-xs mb-1">Tanggal Evaluasi</p>
                <p className="font-semibold">
                  {new Date(evaluation.evaluationDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-red-100 text-xs mb-1">Dibuat Oleh</p>
                <p className="font-semibold text-sm truncate">{evaluation.evaluatedBy}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-red-100 text-xs mb-1">Terakhir Diubah</p>
                <p className="font-semibold text-sm">
                  {new Date(evaluation.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Edit Button */}
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="md:hidden w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Nilai
            </button>
          )}

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Mode Edit Aktif</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Performance Questions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Penilaian Kinerja
            </h3>

            <div className="space-y-4">
              {evaluation.questions.map((question, index) => (
                <div key={question.questionId} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}. {question.question}
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['kurang', 'cukup', 'baik', 'mahir'] as RatingLevel[]).map((rating) => (
                        <label
                          key={rating}
                          className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${editedRatings[question.questionId] === rating
                              ? 'border-red-600 bg-red-50 text-red-900 shadow-md'
                              : 'border-gray-300 hover:border-red-300 bg-white hover:shadow'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.questionId}`}
                            value={rating}
                            checked={editedRatings[question.questionId] === rating}
                            onChange={(e) => setEditedRatings({
                              ...editedRatings,
                              [question.questionId]: e.target.value as RatingLevel
                            })}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span>{getRatingEmoji(rating)}</span>
                            {getRatingLabel(rating)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 ${getRatingColor(question.rating)}`}>
                        <span className="mr-1">{getRatingEmoji(question.rating)}</span>
                        {getRatingLabel(question.rating)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Catatan Tambahan
            </h3>
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Tambahkan catatan atau komentar tambahan..."
              />
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {evaluation.overallNotes || 'Tidak ada catatan tambahan'}
                </p>
              </div>
            )}
          </div>

          {/* Edit History Section */}
          {evaluation.editHistory && evaluation.editHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Riwayat Perubahan ({evaluation.editHistory.length})
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showHistory && (
                <div className="space-y-6 mt-4">
                  {evaluation.editHistory?.map((entry, historyIndex) => (
                    <div key={historyIndex} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-sm">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-700">#{(evaluation.editHistory?.length || 0) - historyIndex}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(entry.editedAt).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {entry.editedBy}
                            </div>
                          </div>
                        </div>
                        {entry.changes && entry.changes.length > 0 && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            {entry.changes.length} Perubahan
                          </span>
                        )}
                      </div>

                      {/* All Questions with Highlights */}
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Semua Nilai Evaluasi:
                        </p>
                        {evaluation.questions.map((question, qIndex) => {
                          const change = entry.changes?.find(c => c.questionId === question.questionId);
                          const isChanged = !!change;

                          return (
                            <div
                              key={question.questionId}
                              className={`p-3 rounded-lg border-2 transition-all ${isChanged
                                  ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                                  : 'bg-white border-gray-200'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm text-gray-700 flex-1">
                                  <span className="font-semibold text-gray-900">{qIndex + 1}.</span> {question.question}
                                </p>
                                {isChanged && (
                                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                                    DIUBAH
                                  </span>
                                )}
                              </div>

                              {isChanged ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500 font-medium">Dari:</span>
                                    <span className={`px-2 py-1 rounded border ${getRatingColor(change.oldRating)}`}>
                                      {getRatingEmoji(change.oldRating)} {getRatingLabel(change.oldRating)}
                                    </span>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500 font-medium">Ke:</span>
                                    <span className={`px-2 py-1 rounded border ${getRatingColor(change.newRating)}`}>
                                      {getRatingEmoji(change.newRating)} {getRatingLabel(change.newRating)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <span className={`px-2 py-1 text-xs rounded border ${getRatingColor(question.rating)}`}>
                                    {getRatingEmoji(question.rating)} {getRatingLabel(question.rating)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Notes Changes */}
                      {entry.oldNotes !== undefined && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            Perubahan Catatan:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                              <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Sebelum:
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.oldNotes || 'Tidak ada catatan'}</p>
                            </div>
                            <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Sesudah:
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.newNotes || 'Tidak ada catatan'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
