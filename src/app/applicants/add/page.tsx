'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAlert } from '@/contexts/AlertContext';
import { applicantService } from '@/lib/applicantService';
import { HasilAkhir } from '@/types/applicant';

export default function AddApplicantPage() {
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    sumberLamaran: '',
    hasilAkhir: 'Tidak Lolos' as HasilAkhir,
    keterangan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama.trim()) {
      showWarning('Nama harus diisi');
      return;
    }
    if (!formData.sumberLamaran.trim()) {
      showWarning('Sumber lamaran harus diisi');
      return;
    }
    if (!formData.keterangan.trim()) {
      showWarning('Keterangan harus diisi');
      return;
    }

    try {
      setLoading(true);
      await applicantService.createApplicant(formData);
      showSuccess('Data pelamar berhasil ditambahkan');
      router.push('/applicants');
    } catch (error) {
      console.error('Error creating applicant:', error);
      showError('Gagal menambahkan data pelamar');
    } finally {
      setLoading(false);
    }
  };

  const handleHasilChange = (hasil: HasilAkhir) => {
    setFormData({
      ...formData,
      hasilAkhir: hasil,
      keterangan: hasil === 'Lolos' ? 'PKWT' : '',
    });
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = applicantService.getAllBulanNames();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-slate-900">
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tambah Pelamar Baru</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Masukkan data pelamar yang baru mendaftar
                </p>
              </div>
              <button
                onClick={() => router.push('/applicants')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Tahun & Bulan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bulan}
                  onChange={(e) => setFormData({ ...formData, bulan: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sumber Lamaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sumber Lamaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sumberLamaran}
                onChange={(e) => setFormData({ ...formData, sumberLamaran: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: JobStreet, LinkedIn, Walk-in, Referral, dll"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Dari mana pelamar mendapatkan informasi lowongan
              </p>
            </div>

            {/* Hasil Akhir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasil Akhir <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleHasilChange('Lolos')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                    formData.hasilAkhir === 'Lolos'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ Lolos
                </button>
                <button
                  type="button"
                  onClick={() => handleHasilChange('Tidak Lolos')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                    formData.hasilAkhir === 'Tidak Lolos'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✗ Tidak Lolos
                </button>
                <button
                  type="button"
                  onClick={() => handleHasilChange('Proses')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                    formData.hasilAkhir === 'Proses'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⏳ Proses
                </button>
                <button
                  type="button"
                  onClick={() => handleHasilChange('Blm Proses')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                    formData.hasilAkhir === 'Blm Proses'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⏸️ Blm Proses
                </button>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan <span className="text-red-500">*</span>
              </label>
              {formData.hasilAkhir === 'Lolos' ? (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Otomatis: PKWT (Perjanjian Kerja Waktu Tertentu)
                  </p>
                  <input
                    type="hidden"
                    value="PKWT"
                  />
                </div>
              ) : (
                <>
                  <textarea
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alasan tidak lolos (contoh: Tidak memenuhi kualifikasi, Gagal tes tulis, Tidak hadir interview, dll)"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Jelaskan alasan mengapa pelamar tidak lolos
                  </p>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/applicants')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
