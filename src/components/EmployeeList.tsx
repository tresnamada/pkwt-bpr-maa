'use client';

import { useState } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { Employee } from '@/types/employee';
import { employeeService } from '@/lib/employeeService';

interface EmployeeListProps {
  employees: Employee[];
  onEvaluate: (employee: Employee) => void;
  onRefresh: () => void;
}

export default function EmployeeList({ employees, onEvaluate, onRefresh }: EmployeeListProps) {
  const { showSuccess, showError, showConfirm } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (employeeId: string) => {
    showConfirm(
      `Yakin ingin menghapus ${employee.name}?`,
      async () => {
        try {
          await employeeService.deleteEmployee(employeeId);
          showSuccess('Karyawan berhasil dihapus');
          onRefresh();
        } catch (error) {
          console.error('Error deleting employee:', error);
          showError('Gagal menghapus karyawan');
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Berakhir</span>;
      case 'evaluated':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Dievaluasi</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRemainingDaysColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Filter employees berdasarkan search query
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Karyawan Aktif</h3>
        <p className="text-sm text-gray-600 mb-4">
          Semua karyawan sudah dievaluasi atau belum ada data karyawan PKWT
        </p>
        <p className="text-xs text-gray-500">
          Klik tombol <span className="font-semibold">&quot;Tambah Karyawan&quot;</span> untuk menambah karyawan baru
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Search Box */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 hover:border-gray-300"
            placeholder="Cari nama atau unit karyawan..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs sm:text-sm text-gray-600">
            <span className="font-medium">{filteredEmployees.length}</span> karyawan ditemukan
            {searchQuery && ` untuk "${searchQuery}"`}
          </div>
        )}
      </div>
      
      {filteredEmployees.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ditemukan</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tidak ada karyawan yang cocok dengan pencarian <span className="font-semibold">&quot;{searchQuery}&quot;</span>
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Hapus Pencarian
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredEmployees.map((employee) => {
          const remainingDays = getRemainingDays(employee.contractEndDate);
          return (
            <li key={employee.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-red-900 truncate">
                        {employee.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(employee.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">🏢</span>
                          Unit: {employee.unit}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <span className="mr-2">📅</span>
                          {employee.contractStartDate.toLocaleDateString('id-ID')} - {employee.contractEndDate.toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className={`font-semibold ${getRemainingDaysColor(remainingDays)}`}>
                          {remainingDays < 0 
                            ? `⚠️ Berakhir ${Math.abs(remainingDays)} hari lalu`
                            : remainingDays === 0
                            ? '⚠️ Berakhir hari ini'
                            : `Sisa ${remainingDays} hari`
                          }
                        </p>
                      </div>
                    </div>
                    {employee.evaluation && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Evaluasi:</span> {employee.evaluation.rating}/5 - {employee.evaluation.notes}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dievaluasi pada {employee.evaluation.evaluatedAt.toLocaleDateString('id-ID')} oleh {employee.evaluation.evaluatedBy}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {employee.status === 'active' && remainingDays <= 30 && (
                      <button
                        onClick={() => onEvaluate(employee)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Evaluasi
                      </button>
                    )}
                    {employee.status === 'expired' && !employee.evaluation && (
                      <button
                        onClick={() => onEvaluate(employee)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Evaluasi
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
