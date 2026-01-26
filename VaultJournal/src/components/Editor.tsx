import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/StorageService';
import { CryptoService } from '../services/CryptoService';
import { Button } from './Button';
import { ArrowLeft, Save, Trash2, Bold, List, Code, Italic } from 'lucide-react';
import { clsx } from 'clsx';

interface EditorProps {
  id: number | null;
  onBack: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={clsx("p-2", editor.isActive('bold') && 'bg-gray-100 dark:bg-gray-700')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={clsx("p-2", editor.isActive('italic') && 'bg-gray-100 dark:bg-gray-700')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={clsx("p-2", editor.isActive('bulletList') && 'bg-gray-100 dark:bg-gray-700')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={clsx("p-2", editor.isActive('codeBlock') && 'bg-gray-100 dark:bg-gray-700')}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const Editor = ({ id, onBack }: EditorProps) => {
  const { key } = useAuth();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
      },
    },
  });

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
  }, [id]);

  const loadEntry = async (entryId: number) => {
    if (!key || !editor) return;
    setLoading(true);
    try {
      const entry = await StorageService.getEntry(entryId);
      if (entry) {
        const decTitle = await CryptoService.decrypt(entry.titleData, entry.titleIv, key);
        const decBody = await CryptoService.decrypt(entry.bodyData, entry.bodyIv, key);
        setTitle(decTitle);
        editor.commands.setContent(decBody);
        setLastSaved(entry.updatedAt);
      }
    } catch (e) {
      console.error("Failed to load entry", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!key || !editor) return;
    setSaving(true);
    try {
      const body = editor.getHTML();

      const { iv: titleIv, data: titleData } = await CryptoService.encrypt(title, key);
      const { iv: bodyIv, data: bodyData } = await CryptoService.encrypt(body, key);

      const entryData = {
        titleData,
        titleIv,
        bodyData,
        bodyIv,
      };

      if (id) {
        await StorageService.updateEntry(id, entryData);
      } else {
        await StorageService.addEntry({
            ...entryData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        onBack();
        return;
      }
      setLastSaved(new Date());
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!id || !confirm('Are you sure you want to delete this entry?')) return;
      await StorageService.deleteEntry(id);
      onBack();
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 min-h-[80vh] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl">
            <Button variant="ghost" onClick={onBack} className="text-gray-500">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
            </Button>
            <div className="flex gap-2 items-center">
                {lastSaved && <span className="text-xs text-gray-400 mr-2">Saved {lastSaved.toLocaleTimeString()}</span>}
                {id && (
                    <Button variant="danger" onClick={handleDelete} className="p-2">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
        <div className="p-6 md:p-10 flex-1 flex flex-col">
            <input
                type="text"
                placeholder="Entry Title"
                className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-6 w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <MenuBar editor={editor} />
            <div className="flex-1">
                <EditorContent editor={editor} />
            </div>
        </div>
    </div>
  );
};
