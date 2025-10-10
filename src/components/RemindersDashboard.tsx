'use client';

import { useState, useEffect } from 'react';
import { reminderDatabase } from '@/lib/reminderDatabase';
import { Reminder } from '@/types/reminder';

export default function RemindersDashboard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<{
    pending: number;
    notified: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadReminders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'all') {
        data = await reminderDatabase.getPendingReminders();
      } else {
        data = await reminderDatabase.getRemindersByPriority(filter);
      }
      setReminders(data);

      const statistics = await reminderDatabase.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⏰';
      case 'low': return 'ℹ️';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-600 mb-1">Total Pending</div>
            <div className="text-2xl font-bold text-gray-900">{stats.pending + stats.notified}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600 mb-1">🚨 Urgent</div>
            <div className="text-2xl font-bold text-red-900">{stats.urgent}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-sm text-orange-600 mb-1">⚠️ High</div>
            <div className="text-2xl font-bold text-orange-900">{stats.high}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-sm text-yellow-600 mb-1">⏰ Medium</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.medium}</div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          Semua ({(stats?.pending ?? 0) + (stats?.notified ?? 0)})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'urgent'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          🚨 Urgent ({stats?.urgent || 0})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'high'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          ⚠️ High ({stats?.high || 0})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'medium'
              ? 'bg-yellow-600 text-white shadow-md'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          ⏰ Medium ({stats?.medium || 0})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">✅</div>
            <p className="text-gray-600">Tidak ada reminder untuk filter ini</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-4 hover:shadow-md transition-all ${
                reminder.priority === 'urgent' ? 'border-l-red-600' :
                reminder.priority === 'high' ? 'border-l-orange-500' :
                reminder.priority === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getPriorityIcon(reminder.priority)}</span>
                    <h3 className="font-bold text-gray-900">{reminder.employeeName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reminder.status === 'pending' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {reminder.status === 'pending' ? 'Belum Notif' : `Email: ${reminder.emailCount}x`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Unit:</span>
                      <span className="ml-2 font-medium">{reminder.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kontrak Berakhir:</span>
                      <span className="ml-2 font-medium">
                        {reminder.contractEndDate.toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-bold ${
                        reminder.daysRemaining < 0 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {reminder.daysRemaining < 0 
                          ? `${Math.abs(reminder.daysRemaining)} hari terlambat`
                          : `${reminder.daysRemaining} hari lagi`
                        }
                      </span>
                    </div>
                    {reminder.lastEmailSent && (
                      <div>
                        <span className="text-gray-600">Email Terakhir:</span>
                        <span className="ml-2 text-xs">
                          {reminder.lastEmailSent.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
