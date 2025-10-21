'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AlertProvider>{children}</AlertProvider>
    </AuthProvider>
  );
}
