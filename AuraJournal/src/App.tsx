import { useState } from 'react';
import { useApp } from './contexts/AppContext';
import { VaultLock } from './components/VaultLock';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { Editor } from './components/Editor';
import { Settings } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import type { DecryptedEntry } from './types';

type View = 'timeline' | 'write' | 'settings';

function App() {
  const { appState, settings } = useApp();
  const [currentView, setCurrentView] = useState<View>('timeline');
  const [editingEntry, setEditingEntry] = useState<DecryptedEntry | undefined>();

  // Show vault lock screen when not unlocked
  if (appState === 'setup') {
    return <VaultLock mode="setup" />;
  }

  if (appState === 'locked') {
    return <VaultLock mode="unlock" />;
  }

  // Handle navigation
  const handleNavigate = (view: View) => {
    if (view === 'write') {
      setEditingEntry(undefined);
    }
    setCurrentView(view);
  };

  // Handle entry selection from timeline
  const handleSelectEntry = (entry: DecryptedEntry) => {
    setEditingEntry(entry);
    setCurrentView('write');
  };

  // Handle closing editor
  const handleCloseEditor = () => {
    setEditingEntry(undefined);
    setCurrentView('timeline');
  };

  return (
    <div className={`h-full flex flex-col bg-paper-white dark:bg-midnight-slate paper-texture ${settings.darkMode ? 'dark' : ''}`}>
      {/* Header - only show when not in editor */}
      {currentView !== 'write' && <Header />}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'timeline' && (
          <Timeline onSelectEntry={handleSelectEntry} />
        )}
        {currentView === 'write' && (
          <Editor
            entry={editingEntry}
            onClose={handleCloseEditor}
            onSave={() => {}}
          />
        )}
        {currentView === 'settings' && <Settings />}
      </main>

      {/* Bottom Navigation - hide when in editor */}
      {currentView !== 'write' && (
        <BottomNav activeItem={currentView} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
