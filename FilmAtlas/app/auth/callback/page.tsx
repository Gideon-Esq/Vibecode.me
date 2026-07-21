'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService, AccountService } from '@/lib/tmdb';
import { useAuthStore } from '@/store/auth';

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, setAccount } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const approved = searchParams.get('approved');
        const requestToken = typeof window !== 'undefined' ? sessionStorage.getItem('request_token') : null;

        if (approved === 'true' && requestToken) {
          // Create session
          const sessionData = await AuthService.createSession(requestToken);
          
          if (sessionData.success) {
            setSession(sessionData.session_id);
            
            // Fetch account details
            const accountData = await AccountService.getDetails();
            setAccount(accountData);
            
            // Clean up
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('request_token');
            }
            
            setStatus('success');
            setTimeout(() => router.push('/'), 2000);
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router, setSession, setAccount]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-netflix-red mx-auto mb-4" />
            <p className="text-xl">Completing authentication...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✓</div>
            <p className="text-xl text-green-500 mb-2">Authentication successful!</p>
            <p className="text-gray-400">Redirecting to home...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">✗</div>
            <p className="text-xl text-red-500 mb-4">Authentication failed</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-netflix-red hover:bg-netflix-red/90 rounded-md font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-netflix-red" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
