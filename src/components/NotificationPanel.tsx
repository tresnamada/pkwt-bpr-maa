'use client';

import { useState, useEffect } from 'react';
import { reminderService, ReminderNotification } from '@/lib/reminderService';

interface NotificationPanelProps {
  onNotificationClick?: (notification: ReminderNotification) => void;
}

export default function NotificationPanel({ onNotificationClick }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing notifications from storage immediately
    const existingNotifications = reminderService.getNotifications();
    setNotifications(existingNotifications);
    console.log('[NOTIFICATION_PANEL] Loaded', existingNotifications.length, 'existing notifications');
    
    // Then load fresh data
    loadNotifications();
    
    // Set interval untuk cek notifikasi setiap 5 menit
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Clear old notifications (older than 7 days)
      reminderService.clearOldNotifications();
      
      await reminderService.runDailyCheck();
      const allNotifications = reminderService.getNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: ReminderNotification) => {
    reminderService.markAsRead(notification.id);
    setNotifications(reminderService.getNotifications());
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAllRead = () => {
    reminderService.markAllAsRead();
    setNotifications(reminderService.getNotifications());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'reminder':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-all"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.5-1.5M5.07 19H19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setShowPanel(false)}
          />
          <div className="fixed sm:absolute left-0 right-0 sm:right-0 sm:left-auto bottom-0 sm:bottom-auto top-auto sm:top-auto mt-0 sm:mt-2 w-full sm:w-96 bg-white rounded-t-2xl sm:rounded-lg shadow-2xl border-t sm:border z-50 max-h-[80vh] sm:max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b flex-shrink-0 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadNotifications}
                    disabled={loading}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
                  >
                    {loading ? '⟳' : '↻'}
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium hidden sm:block"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="sm:hidden text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi</p>
                  <p className="text-xs text-gray-400 mt-1">Semua karyawan terpantau dengan baik</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm leading-relaxed ${
                            !notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {notification.createdAt.toLocaleString('id-ID', { 
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2.5 sm:p-3 border-t bg-gray-50 text-center flex-shrink-0">
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
