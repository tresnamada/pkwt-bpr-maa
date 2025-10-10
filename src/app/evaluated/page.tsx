'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeService } from '@/lib/employeeService';
import { Employee } from '@/types/employee';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import LogoutButton from '@/components/LogoutButton';

export default function EvaluatedEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    loadEvaluatedEmployees();
  }, []);

  const loadEvaluatedEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEvaluatedEmployees();
      setEmployees(data);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error loading evaluated employees:', error);
      setError(err.message || 'Gagal memuat data karyawan yang sudah dievaluasi');
    } finally {
      setLoading(false);
    }
  };

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'lanjut':
        return 'bg-blue-100 text-blue-800';
      case 'diangkat':
        return 'bg-green-100 text-green-800';
      case 'dilepas':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'lanjut':
        return 'Kontrak Dilanjutkan';
      case 'diangkat':
        return 'Diangkat Tetap';
      case 'dilepas':
        return 'Kontrak Berakhir';
      default:
        return result;
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data ${employeeName}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setDeleting(true);
    try {
      await employeeService.deleteEmployee(employeeId);
      await loadEvaluatedEmployees();
      alert(`Data ${employeeName} berhasil dihapus`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error deleting employee:', error);
      alert(`Gagal menghapus data: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedForDelete(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedForDelete.size === 0) {
      alert('Pilih minimal 1 karyawan untuk dihapus');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedForDelete.size} karyawan? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setDeleting(true);
    try {
      const result = await employeeService.deleteMultipleEmployees(Array.from(selectedForDelete));
      await loadEvaluatedEmployees();
      setSelectedForDelete(new Set());
      setBulkDeleteMode(false);
      alert(`Berhasil menghapus ${result.success} karyawan${result.failed > 0 ? `, gagal: ${result.failed}` : ''}`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error bulk deleting:', error);
      alert(`Gagal menghapus data: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner message="Memuat data karyawan yang sudah dievaluasi..." size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Error</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={loadEvaluatedEmployees}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Coba Lagi
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium text-center"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Dashboard
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Karyawan yang Sudah Dievaluasi</h1>
                <p className="mt-2 text-gray-600">
                  Daftar karyawan yang telah menyelesaikan proses evaluasi PKWT
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500 font-medium">
                  Total: {employees.length} karyawan
                </div>
                {employees.length > 0 && (
                  <button
                    onClick={() => {
                      setBulkDeleteMode(!bulkDeleteMode);
                      setSelectedForDelete(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      bulkDeleteMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {bulkDeleteMode ? (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Data
                      </>
                    )}
                  </button>
                )}
                {bulkDeleteMode && selectedForDelete.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Hapus {selectedForDelete.size} Terpilih
                  </button>
                )}
                <LogoutButton />
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada karyawan yang dievaluasi</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Karyawan yang sudah dievaluasi akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daftar Karyawan */}
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`bg-white rounded-lg shadow p-6 transition-all duration-200 relative ${
                        selectedEmployee?.id === employee.id
                          ? 'ring-2 ring-indigo-500 shadow-lg'
                          : 'hover:shadow-md'
                      } ${bulkDeleteMode ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => !bulkDeleteMode && setSelectedEmployee(employee)}
                    >
                      {/* Checkbox untuk bulk delete */}
                      {bulkDeleteMode && (
                        <div className="absolute top-4 left-4 z-10">
                          <input
                            type="checkbox"
                            checked={selectedForDelete.has(employee.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectEmployee(employee.id);
                            }}
                            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                      )}

                      <div className={`flex justify-between items-start mb-4 ${bulkDeleteMode ? 'ml-8' : ''}`}>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">🏢 Unit: {employee.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultBadgeColor(employee.evaluation?.result || '')}`}>
                            {getResultText(employee.evaluation?.result || '')}
                          </span>
                          {!bulkDeleteMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmployee(employee.id, employee.name);
                              }}
                              disabled={deleting}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Hapus karyawan"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Rating:</span>
                          <div className="font-medium text-yellow-600">
                            {getRatingStars(employee.evaluation?.rating || 0)} ({employee.evaluation?.rating}/5)
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Dievaluasi:</span>
                          <div className="font-medium text-gray-500">
                            {employee.evaluation?.evaluatedAt.toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Periode Kontrak:</span>
                        <div className="font-medium text-gray-500">
                          {employee.contractStartDate.toLocaleDateString('id-ID')} - {employee.contractEndDate.toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detail dan History */}
                <div className="lg:sticky lg:top-6">
                  {selectedEmployee ? (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Detail & History: {selectedEmployee.name}
                      </h3>

                      {/* Detail Evaluasi */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Hasil Evaluasi</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rating:</span>
                            <span className="font-medium text-yellow-600">
                              {getRatingStars(selectedEmployee.evaluation?.rating || 0)} ({selectedEmployee.evaluation?.rating}/5)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Keputusan:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getResultBadgeColor(selectedEmployee.evaluation?.result || '')}`}>
                              {getResultText(selectedEmployee.evaluation?.result || '')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Evaluator:</span>
                            <span className="font-medium text-red-900">{selectedEmployee.evaluation?.evaluatedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal:</span>
                            <span className="font-medium text-red-900">
                              {selectedEmployee.evaluation?.evaluatedAt.toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Catatan:</span>
                          <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border">
                            {selectedEmployee.evaluation?.notes}
                          </p>
                        </div>
                      </div>
                      {/* History */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Riwayat Aktivitas</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedEmployee?.history.map((entry) => (
                            <div key={entry.id} className="flex items-start space-x-3 text-sm">
                              <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-gray-600 mt-1">{entry.details}</p>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-2">
                                    {entry.timestamp.toLocaleDateString('id-ID')}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  oleh {entry.performedBy}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                      <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p>Pilih karyawan untuk melihat detail dan history</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
