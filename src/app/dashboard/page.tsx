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

export default function DashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [reminders, setReminders] = useState<Employee[]>([]);
  const [unevaluatedCount, setUnevaluatedCount] = useState(0);
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
      // Sync reminders first
      await reminderDatabase.syncRemindersFromEmployees(await employeeService.getAllEmployees());
      // Get statistics
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-6 gap-3 sm:gap-0">
              <div className="w-full sm:w-auto">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Dashboard PKWT
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 ml-10 sm:ml-13 truncate max-w-[200px] sm:max-w-none">
                  Selamat datang, {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
                <NotificationPanel 
                  onNotificationClick={(notification) => {
                    const employee = employees.find(emp => emp.id === notification.employeeId);
                    if (employee) {
                      handleEvaluateEmployee(employee);
                    }
                  }}
                />
                <Link
                  href="/cron-settings"
                  className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                  title="Pengaturan Cron Job"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Testing</span>
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Active Employees Card */}
            <div className="group bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-green-200 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Karyawan Aktif</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{activeEmployees.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminders Card - Link to Database Reminder */}
            <Link href="/reminders" className="group bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100 hover:to-white rounded-2xl shadow-sm hover:shadow-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-300 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.5-1.5M5.07 19H19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Perlu Pengingat</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                        {reminderStats ? (reminderStats.pending + reminderStats.notified) : reminders.length}
                      </p>
                      {reminderStats && reminderStats.urgent > 0 && (
                        <p className="text-xs text-red-600 font-semibold mt-1">🚨 {reminderStats.urgent} Urgent</p>
                      )}
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Expired Card */}
            <div className="group bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-red-200 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Kontrak Berakhir</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">{expiredEmployees.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluated Card - Clickable */}
            <Link href="/evaluated" className="group bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Sudah Dievaluasi</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{evaluatedEmployees.length}</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Reminders Alert */}
          {reminders.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl p-5 mb-8 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-yellow-900 mb-1">Perhatian!</h3>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Ada <span className="font-bold">{reminders.length} karyawan</span> yang kontraknya akan berakhir dalam 30 hari dan perlu dievaluasi segera.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unevaluated Alert */}
          {unevaluatedCount > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-8 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 mb-1">Karyawan Belum Dievaluasi!</h3>
                  <p className="text-sm text-red-800 leading-relaxed">
                    Ada <span className="font-bold">{unevaluatedCount} karyawan</span> yang kontraknya sudah berakhir dan belum dievaluasi. Silakan evaluasi segera!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daftar Karyawan PKWT</h2>
              <p className="text-sm text-gray-600 mt-1">Kelola dan pantau karyawan kontrak yang aktif dan expired</p>
              <p className="text-xs text-gray-500 mt-1">
                💡 Karyawan yang sudah dievaluasi dapat dilihat di halaman <Link href="/evaluated" className="text-blue-600 hover:underline font-medium">Karyawan Dievaluasi</Link>
              </p>
            </div>
            <button
              onClick={handleAddEmployee}
              className="group flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <svg className="h-5 w-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Karyawan</span>
            </button>
          </div>

          {/* Employee List - Hanya tampilkan karyawan yang belum dievaluasi */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <EmployeeList
              employees={employees.filter(emp => emp.status !== 'evaluated')}
              onEvaluate={handleEvaluateEmployee}
              onRefresh={loadEmployees}
            />
          )}
        </div>

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
