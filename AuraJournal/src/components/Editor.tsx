import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import type { FontTheme, DecryptedEntry } from '../types';

interface EditorProps {
  entry?: DecryptedEntry;
  onSave?: () => void;
  onClose?: () => void;
}

export function Editor({ entry, onSave, onClose }: EditorProps) {
  const { settings, saveEntry } = useApp();
  const [content, setContent] = useState(entry?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Font class mapping
  const fontClass: Record<FontTheme, string> = {
    handwriting: 'font-handwriting',
    'handwriting-alt': 'font-handwriting-alt',
    serif: 'font-serif',
    sans: 'font-sans'
  };

  // Auto-save functionality
  const doSave = useCallback(async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      await saveEntry(content, entry?.id);
      setLastSaved(new Date());
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Failed to save:', error);
    }
    setIsSaving(false);
  }, [content, entry?.id, saveEntry, onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasChanges) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      doSave();
    }, settings.autoSaveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, hasChanges, settings.autoSaveInterval, doSave]);

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      doSave();
    }
    
    // Handle markdown shortcuts
    if (e.ctrlKey || e.metaKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.slice(start, end);
      
      if (e.key === 'b') {
        // Bold
        e.preventDefault();
        const newText = `**${selectedText}**`;
        replaceSelection(start, end, newText);
      } else if (e.key === 'i') {
        // Italic
        e.preventDefault();
        const newText = `*${selectedText}*`;
        replaceSelection(start, end, newText);
      }
    }
  };

  const replaceSelection = (start: number, end: number, replacement: string) => {
    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
    setHasChanges(true);
    
    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + replacement.length;
        textareaRef.current.selectionEnd = start + replacement.length;
      }
    }, 0);
  };

  // Format current date
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-paper-white dark:bg-midnight-slate">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-ink/5 dark:border-paper-white/5">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 min-h-touch min-w-[44px] rounded-lg hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
              aria-label="Back"
            >
              <svg
                className="w-6 h-6 text-ink dark:text-paper-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-lg font-serif text-ink dark:text-paper-white">
              {formatDate()}
            </h2>
          </div>
        </div>
        
        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm font-sans">
          {isSaving ? (
            <span className="text-ink-muted dark:text-paper-cream/60 flex items-center gap-1">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved {formatTime(lastSaved)}
            </span>
          ) : hasChanges ? (
            <span className="text-ink-muted dark:text-paper-cream/60">Unsaved changes</span>
          ) : null}
        </div>
      </header>

      {/* Markdown Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-ink/5 dark:border-paper-white/5">
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.slice(start, end);
            replaceSelection(start, end, `**${selectedText}**`);
          }}
          className="p-2 min-h-touch min-w-[44px] rounded hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold text-ink dark:text-paper-white">B</span>
        </button>
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.slice(start, end);
            replaceSelection(start, end, `*${selectedText}*`);
          }}
          className="p-2 min-h-touch min-w-[44px] rounded hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <span className="italic text-ink dark:text-paper-white">I</span>
        </button>
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const lineStart = content.lastIndexOf('\n', start - 1) + 1;
            const before = content.slice(0, lineStart);
            const after = content.slice(lineStart);
            setContent(before + '- ' + after);
            setHasChanges(true);
          }}
          className="p-2 min-h-touch min-w-[44px] rounded hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
          title="List"
        >
          <svg className="w-5 h-5 text-ink dark:text-paper-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto p-4 pb-24">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing your thoughts..."
          className={`w-full h-full min-h-[60vh] resize-none bg-transparent text-ink dark:text-paper-white placeholder-ink-muted dark:placeholder-paper-cream/40 focus:outline-none text-lg leading-relaxed ${fontClass[settings.fontTheme]}`}
          style={{
            fontSize: settings.fontTheme.startsWith('handwriting') ? '1.5rem' : '1.125rem',
            lineHeight: settings.fontTheme.startsWith('handwriting') ? '2' : '1.75'
          }}
        />
      </div>
    </div>
  );
}
