'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { applicantService } from '@/lib/applicantService';
import { Applicant, HasilAkhir } from '@/types/applicant';

export default function ApplicantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    tahun: new Date().getFullYear(),
    bulan: 1,
    sumberLamaran: '',
    hasilAkhir: 'Tidak Lolos' as HasilAkhir,
    keterangan: '',
  });

  const loadApplicant = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicantService.getApplicantById(id);
      if (data) {
        setApplicant(data);
        setFormData({
          nama: data.nama,
          tahun: data.tahun,
          bulan: data.bulan,
          sumberLamaran: data.sumberLamaran,
          hasilAkhir: data.hasilAkhir,
          keterangan: data.keterangan,
        });
      } else {
        alert('Data tidak ditemukan');
        router.push('/applicants');
      }
    } catch (error) {
      console.error('Error loading applicant:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadApplicant();
  }, [loadApplicant]);

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.sumberLamaran.trim() || !formData.keterangan.trim()) {
      alert('Semua field harus diisi');
      return;
    }

    try {
      setSaving(true);
      await applicantService.updateApplicant(id, formData);
      alert('Data berhasil diupdate');
      setEditing(false);
      loadApplicant();
    } catch (error) {
      console.error('Error updating applicant:', error);
      alert('Gagal mengupdate data');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!applicant) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Detail Pelamar</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {editing ? 'Edit data pelamar' : 'Informasi lengkap pelamar'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/applicants')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Kembali
                </button>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {editing ? (
            /* Edit Mode */
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tahun & Bulan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <select
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Bulan
                  </label>
                  <select
                    value={formData.bulan}
                    onChange={(e) => setFormData({ ...formData, bulan: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Sumber Lamaran
                </label>
                <input
                  type="text"
                  value={formData.sumberLamaran}
                  onChange={(e) => setFormData({ ...formData, sumberLamaran: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hasil Akhir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Akhir
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
                  Keterangan
                </label>
                {formData.hasilAkhir === 'Lolos' ? (
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Otomatis: PKWT (Perjanjian Kerja Waktu Tertentu)
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      nama: applicant.nama,
                      tahun: applicant.tahun,
                      bulan: applicant.bulan,
                      sumberLamaran: applicant.sumberLamaran,
                      hasilAkhir: applicant.hasilAkhir,
                      keterangan: applicant.keterangan,
                    });
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{applicant.nama}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tahun Bulan
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {applicantService.getBulanName(applicant.bulan)} {applicant.tahun}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Sumber Lamaran
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{applicant.sumberLamaran}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Hasil Akhir
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    applicant.hasilAkhir === 'Lolos'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {applicant.hasilAkhir}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Keterangan
                  </label>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{applicant.keterangan}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Input
                  </label>
                  <p className="text-sm text-gray-700">
                    {new Date(applicant.tanggalInput).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Terakhir Diupdate
                  </label>
                  <p className="text-sm text-gray-700">
                    {new Date(applicant.tanggalUpdate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
