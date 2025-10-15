'use client';

import { useState } from 'react';
import { employeeService } from '@/lib/employeeService';
import { CreateEmployeeData } from '@/types/employee';

interface AddEmployeeModalProps {
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export default function AddEmployeeModal({ onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<CreateEmployeeData>({
    name: '',
    unit: '',
    contractStartDate: new Date(),
    contractEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan dari sekarang
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting to create employee:', formData);
      const employeeId = await employeeService.createEmployee(formData);
      console.log('Employee created successfully with ID:', employeeId);
      onEmployeeAdded();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error creating employee:', error);
      let errorMessage = 'Gagal menambahkan karyawan';
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Akses ditolak. Periksa konfigurasi Firestore rules.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Firestore tidak tersedia. Periksa koneksi internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contractStartDate') {
      const startDate = new Date(value);
      // Auto calculate end date (3 months from start)
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      
      setFormData(prev => ({
        ...prev,
        contractStartDate: startDate,
        contractEndDate: endDate,
      }));
    } else if (name === 'contractEndDate') {
      setFormData(prev => ({
        ...prev,
        contractEndDate: new Date(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative mx-auto w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 animate-scaleIn max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan gradient merah */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-500 px-4 sm:px-8 py-4 sm:py-6 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  Tambah Karyawan
                </h3>
                <p className="text-xs sm:text-sm text-red-100 mt-0.5 hidden sm:block">Karyawan PKWT Baru</p>
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Nama Lengkap */}
            <div className="group">
              <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300"
                  placeholder="Masukkan nama lengkap karyawan"
                />
              </div>
            </div>

            {/* Unit / Cabang */}
            <div className="group">
              <label htmlFor="unit" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Unit / Cabang
              </label>
              <div className="relative">
                <select
                  id="unit"
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-400">Pilih Unit/Cabang</option>
                  <option value="Kantor Pusat">Kantor Utama</option>
                  <option value="Cabang Ngaliyan">Cabang Ngaliyan</option>
                  <option value="Cabang Majapahit">Cabang Majapahit</option>
                  <option value="Cabang Kedungmundu">Cabang Kedungmundu</option>
                  <option value="Cabang Ungaran">Cabang Ungaran</option>
                  <option value="Cabang Tegal">Cabang Tegal</option>
                  <option value="Cabang Pati">Cabang Pati</option>
                  <option value="Cabang Kudus">Cabang Kudus</option>
                  <option value="KPNO">KPNO</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Tanggal Masuk */}
              <div className="group">
                <label htmlFor="contractStartDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  id="contractStartDate"
                  name="contractStartDate"
                  required
                  value={formData.contractStartDate.toISOString().split('T')[0]}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>

              {/* Tanggal Jatuh Tempo */}
              <div className="group">
                <label htmlFor="contractEndDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Jatuh Tempo
                </label>
                <input
                  type="date"
                  id="contractEndDate"
                  name="contractEndDate"
                  required
                  value={formData.contractEndDate.toISOString().split('T')[0]}
                  onChange={handleChange}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-blue-900 font-medium">Kontrak Otomatis 3 Bulan</p>
                  <p className="text-xs text-blue-700 mt-1">Tanggal jatuh tempo otomatis dihitung 3 bulan dari tanggal masuk. Anda dapat mengubahnya secara manual jika diperlukan.</p>
                </div>
              </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan Karyawan</span>
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
