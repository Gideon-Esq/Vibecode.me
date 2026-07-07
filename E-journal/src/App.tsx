import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Timeline } from '@/pages/Timeline';
import { Editor } from '@/pages/Editor';
import { Settings } from '@/pages/Settings';
import { UnlockScreen } from '@/components/auth/UnlockScreen';
import { Onboarding } from '@/components/onboarding/Onboarding';

const AuthenticatedApp = () => {
  const { isUnlocked, hasAccount, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-paper paper-grain flex items-center justify-center text-ink/40">Loading...</div>;
  }

  if (!hasAccount) {
    return <Onboarding />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Timeline />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Editor outside of Layout for distraction-free mode (no bottom nav), or inside?
            "The Editor: A distraction-free canvas."
            Let's keep it separate from the Layout that has the header and bottom nav.
        */}
        <Route path="/write" element={<div className="min-h-screen bg-paper paper-grain p-6"><Editor /></div>} />
        <Route path="/edit/:id" element={<div className="min-h-screen bg-paper paper-grain p-6"><Editor /></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
