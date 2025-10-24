'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error, adminData, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // If user is branch admin and trying to access non-performance pages
    if (!loading && user && adminData && !isSuperAdmin) {
      // Allow access only to performance pages
      const allowedPaths = ['/performance', '/login'];
      const isAllowedPath = allowedPaths.some(path => pathname?.startsWith(path));
      
      if (!isAllowedPath && pathname !== '/') {
        // Redirect branch admin to performance page
        router.push('/performance');
      }
    }
  }, [user, loading, router, adminData, isSuperAdmin, pathname]);

  // Loading state with spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing (will redirect)
  if (!user) {
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
}
