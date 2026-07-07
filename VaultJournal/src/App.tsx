import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const AppContent = () => {
  const { isLoading, hasAccount, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hasAccount) {
    return (
        <Layout>
            <Onboarding />
        </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
        <Layout>
            <Login />
        </Layout>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
