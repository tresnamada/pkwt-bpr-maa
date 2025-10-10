'use client';

import { useState } from 'react';
import { employeeService } from '@/lib/employeeService';
import { Employee, EvaluationData} from '@/types/employee';
import { useAuth } from '@/lib/useAuth';

interface EvaluationModalProps {
  employee: Employee;
  onClose: () => void;
  onEvaluationSubmitted: () => void;
}

export default function EvaluationModal({ employee, onClose, onEvaluationSubmitted }: EvaluationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EvaluationData>({
    rating: 3,
    notes: '',
    result: 'lanjut',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await employeeService.addEvaluation(
        employee.id, 
        formData, 
        user?.email || 'Admin'
      );
      onEvaluationSubmitted();
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || 'Gagal menyimpan evaluasi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Sangat Kurang';
      case 2: return 'Kurang';
      case 3: return 'Cukup';
      case 4: return 'Baik';
      case 5: return 'Sangat Baik';
      default: return '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative mx-auto w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 animate-scaleIn max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan gradient merah */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-500 px-4 sm:px-8 py-4 sm:py-6 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  Evaluasi Karyawan
                </h3>
                <p className="text-xs sm:text-sm text-red-100 mt-0.5 hidden sm:block">Penilaian Kinerja PKWT</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          {/* Info Karyawan Card */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl sm:rounded-2xl">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg sm:text-xl mb-2">{employee.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">Unit:</span>
                    <span className="ml-2">{employee.unit}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Periode:</span>
                    <span className="ml-2">{employee.contractStartDate.toLocaleDateString('id-ID')} - {employee.contractEndDate.toLocaleDateString('id-ID')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Rating Kinerja */}
            <div className="group">
              <label htmlFor="rating" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Rating Kinerja
              </label>
              <div className="relative">
                <select
                  id="rating"
                  name="rating"
                  required
                  value={formData.rating}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value={1}>⭐ 1 - Sangat Kurang</option>
                  <option value={2}>⭐⭐ 2 - Kurang</option>
                  <option value={3}>⭐⭐⭐ 3 - Cukup</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Baik</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Sangat Baik</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Penilaian saat ini:</span>
                <span className="font-bold text-yellow-600">
                  {'⭐'.repeat(formData.rating)} {formData.rating}/5 - {getRatingText(formData.rating)}
                </span>
              </div>
            </div>

            {/* Hasil Evaluasi */}
            <div className="group">
              <label htmlFor="result" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Keputusan Akhir
              </label>
              <div className="relative">
                <select
                  id="result"
                  name="result"
                  required
                  value={formData.result}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="lanjut">✅ Lanjut - Kontrak diperpanjang</option>
                  <option value="diangkat">🎉 Diangkat - Menjadi karyawan tetap</option>
                  <option value="dilepas">❌ Dilepas - Kontrak tidak diperpanjang</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 Keputusan ini akan menentukan status karyawan setelah periode PKWT berakhir
              </p>
            </div>

            {/* Catatan Evaluasi */}
            <div className="group">
              <label htmlFor="notes" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Catatan Evaluasi
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                required
                value={formData.notes}
                onChange={handleChange}
                placeholder="Berikan catatan detail mengenai kinerja karyawan selama masa kontrak...&#10;&#10;Contoh:&#10;- Tingkat kehadiran&#10;- Kualitas pekerjaan&#10;- Kerjasama tim&#10;- Disiplin&#10;- Rekomendasi"
                className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300 resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                Minimum 10 karakter - Catatan ini akan tersimpan di history karyawan
              </p>
            </div>

            {error && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-4 animate-slideDown">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-900 font-semibold">Terjadi Kesalahan</p>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Simpan Evaluasi</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
