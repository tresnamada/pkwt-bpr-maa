'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService } from '@/lib/employeeService';
import { reminderDatabase } from '@/lib/reminderDatabase';
import { Employee } from '@/types/employee';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmployeeList from '@/components/EmployeeList';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EvaluationModal from '@/components/EvaluationModal';
import NotificationPanel from '@/components/NotificationPanel';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';
export default function DashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [reminders, setReminders] = useState<Employee[]>([]);
  const [unevaluatedCount, setUnevaluatedCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [reminderStats, setReminderStats] = useState<{
    pending: number;
    notified: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  } | null>(null);

  useEffect(() => {
    loadEmployees();
    loadReminders();
    loadUnevaluatedCount();
    loadReminderStats();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const data = await employeeService.getEmployeesNeedingReminder();
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadUnevaluatedCount = async () => {
    try {
      const data = await employeeService.getUnevaluatedEmployees();
      setUnevaluatedCount(data.length);
    } catch (error) {
      console.error('Error loading unevaluated count:', error);
    }
  };

  const loadReminderStats = async () => {
    try {
      await reminderDatabase.syncRemindersFromEmployees(await employeeService.getAllEmployees());
      const stats = await reminderDatabase.getStatistics();
      setReminderStats(stats);
    } catch (error) {
      console.error('Error loading reminder stats:', error);
    }
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleEvaluateEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEvaluationModal(true);
  };

  const handleEmployeeAdded = () => {
    loadEmployees();
    loadReminders();
    loadUnevaluatedCount();
    loadReminderStats();
    setShowAddModal(false);
  };

  const handleEvaluationSubmitted = () => {
    loadEmployees();
    loadReminders();
    loadUnevaluatedCount();
    loadReminderStats();
    setShowEvaluationModal(false);
    setSelectedEmployee(null);
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const expiredEmployees = employees.filter(emp => emp.status === 'expired');
  const evaluatedEmployees = employees.filter(emp => emp.status === 'evaluated');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
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
                  <p className="text-xs text-gray-500 hidden sm:block">Sistem Manajemen PKWT</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/performance"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Nilai
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
                <Link
                  href="/cron-settings"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Testing
                </Link>
                <NotificationPanel 
                  onNotificationClick={(notification) => {
                    const employee = employees.find(emp => emp.id === notification.employeeId);
                    if (employee) {
                      handleEvaluateEmployee(employee);
                    }
                  }}
                />
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
                  Rangkuman Nilai
                </Link>
                <Link
                  href="/applicants"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  Database Pelamar
                </Link>
                <Link
                  href="/cron-settings"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  Testing Cron Job
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
              Selamat Datang Kembali
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Kelola dan pantau status kontrak karyawan PKWT Anda dengan mudah
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Active Employees Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{activeEmployees.length}</p>
                <p className="text-sm font-medium text-gray-600">Karyawan Aktif</p>
              </div>
            </div>

            {/* Reminders Card */}
            <Link href="/reminders" className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {reminderStats && reminderStats.urgent > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {reminderStats.urgent} Urgent
                    </span>
                  )}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {reminderStats ? (reminderStats.pending + reminderStats.notified) : reminders.length}
                </p>
                <p className="text-sm font-medium text-gray-600">Perlu Pengingat</p>
              </div>
            </Link>

            {/* Expired Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{expiredEmployees.length}</p>
                <p className="text-sm font-medium text-gray-600">Kontrak Berakhir</p>
              </div>
            </div>

            {/* Evaluated Card */}
            <Link href="/evaluated" className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{evaluatedEmployees.length}</p>
                <p className="text-sm font-medium text-gray-600">Sudah Dievaluasi</p>
              </div>
            </Link>
          </div>

          {/* Alert Banners */}
          {reminders.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-l-4 border-amber-600 rounded-r-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900 mb-1">Perhatian!</h3>
                  <p className="text-sm text-amber-800">
                    Ada <span className="font-bold">{reminders.length} karyawan</span> yang kontraknya akan berakhir dalam 30 hari dan perlu dievaluasi segera.
                  </p>
                </div>
              </div>
            </div>
          )}

          {unevaluatedCount > 0 && (
            <div className="mb-8 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-l-4 border-red-600 rounded-r-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 mb-1">Karyawan Belum Dievaluasi!</h3>
                  <p className="text-sm text-red-800">
                    Ada <span className="font-bold">{unevaluatedCount} karyawan</span> yang kontraknya sudah berakhir dan belum dievaluasi. Silakan evaluasi segera!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daftar Karyawan PKWT</h2>
              <p className="text-sm text-gray-600 mt-1">Kelola dan pantau karyawan kontrak yang aktif dan expired</p>
              <p className="text-xs text-gray-500 mt-1">
                💡 Karyawan yang sudah dievaluasi dapat dilihat di halaman <Link href="/evaluated" className="text-red-600 hover:underline font-medium">Karyawan Dievaluasi</Link>
              </p>
            </div>
            <button
              onClick={handleAddEmployee}
              className="group flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <svg className="h-5 w-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Karyawan</span>
            </button>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : (
            <EmployeeList
              employees={employees.filter(emp => emp.status !== 'evaluated')}
              onEvaluate={handleEvaluateEmployee}
              onRefresh={loadEmployees}
            />
          )}
        </main>

        {/* Modals */}
        {showAddModal && (
          <AddEmployeeModal
            onClose={() => setShowAddModal(false)}
            onEmployeeAdded={handleEmployeeAdded}
          />
        )}

        {showEvaluationModal && selectedEmployee && (
          <EvaluationModal
            employee={selectedEmployee}
            onClose={() => {
              setShowEvaluationModal(false);
              setSelectedEmployee(null);
            }}
            onEvaluationSubmitted={handleEvaluationSubmitted}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}