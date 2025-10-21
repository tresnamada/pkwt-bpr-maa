'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showError, showConfirm } = useAlert();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Logout error:', error);
      showError(err.message || 'Gagal logout');
    } finally {
      setIsLoggingOut(false);
      setShowConfirmModal(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* User Info & Logout Button */}
      <div className="flex items-center gap-4">
        <UserInfo email={user.email || ''} />
        <LogoutTriggerButton 
          onClick={() => setShowConfirmModal(true)} 
          disabled={isLoggingOut} 
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          isLoggingOut={isLoggingOut}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}

// User Info Component
function UserInfo({ email }: { email: string }) {
  return (
    <div className="hidden md:block text-right">
      <p className="text-sm font-semibold text-gray-900">{email}</p>
      <p className="text-xs text-gray-500">Admin</p>
    </div>
  );
}

// Logout Trigger Button Component
function LogoutTriggerButton({ 
  onClick, 
  disabled 
}: { 
  onClick: () => void; 
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Logout"
    >
      <LogoutIcon />
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}

// Logout Icon Component
function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
      />
    </svg>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isLoggingOut,
  onCancel,
  onConfirm,
}: {
  isLoggingOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
          <LogoutIcon />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Konfirmasi Logout
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8">
          Apakah Anda yakin ingin keluar dari sistem?
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <CancelButton onClick={onCancel} disabled={isLoggingOut} />
          <ConfirmButton onClick={onConfirm} isLoading={isLoggingOut} />
        </div>
      </div>
    </div>
  );
}

// Cancel Button Component
function CancelButton({ 
  onClick, 
  disabled 
}: { 
  onClick: () => void; 
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Batal
    </button>
  );
}

// Confirm Button Component
function ConfirmButton({ 
  onClick, 
  isLoading 
}: { 
  onClick: () => void; 
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Keluar...</span>
        </>
      ) : (
        'Ya, Keluar'
      )}
    </button>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
