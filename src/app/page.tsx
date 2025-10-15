'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Auto redirect to dashboard if already logged in
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Section */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-md">
              <img 
                src="/Logo Bpr.png" 
                alt="Logo BPR MAA" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-sm font-semibold text-gray-700">Bank BPR MAA</span>
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                Sistem
                <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"> PKWT</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Sistem Manajemen Perjanjian Kerja Waktu Tertentu yang modern, elegan, dan efisien
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="group flex justify-center items-center py-4 px-8 rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login Admin
              </Link>
            </div>
          </div>
          
          {/* Right Side - Features Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Fitur Unggulan</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Manajemen data karyawan PKWT</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Email reminder otomatis sisa 30 hari kontrak</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Evaluasi: lanjut, diangkat, dilepas</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">History lengkap aktivitas karyawan</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Dashboard dengan notifikasi real-time</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Powered by Next.js, Firebase & Resend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
