'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'branch_admin')[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles = ['super_admin', 'branch_admin'],
  redirectTo = '/performance'
}: RoleProtectedRouteProps) {
  const { user, loading, adminData, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!adminData) {
      router.push('/login');
      return;
    }

    const userRole = adminData.role;
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      router.push(redirectTo);
    }
  }, [user, loading, adminData, isSuperAdmin, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    );
  }

  // Not authenticated or no admin data - show nothing (will redirect)
  if (!user || !adminData) {
    return null;
  }

  // Check role
  const userRole = adminData.role;
  const isAllowed = allowedRoles.includes(userRole);

  // Not allowed - show nothing (will redirect)
  if (!isAllowed) {
    return null;
  }

  // Allowed - render children
  return <>{children}</>;
}
