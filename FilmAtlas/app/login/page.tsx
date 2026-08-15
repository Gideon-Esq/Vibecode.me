'use client';

import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}

function AuthFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-netflix-red" />
    </div>
  );
}
