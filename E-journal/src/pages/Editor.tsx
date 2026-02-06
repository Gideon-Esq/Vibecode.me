import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/db';
import { CryptoService } from '@/services/crypto';
import { ArrowLeft, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const FONTS = [
  { name: 'Serif', class: 'font-serif' },
  { name: 'Sans', class: 'font-sans' },
  { name: 'Hand', class: 'font-handwriting text-xl' },
  { name: 'Script', class: 'font-script text-xl' },
];

export const Editor = () => {
  const { id } = useParams();
  const { dek } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fontIndex, setFontIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  // Create a stable ID for this session if it's a new entry, or use the param
  const [entryId] = useState(id || uuidv4());

  // Load entry if editing
  useEffect(() => {
    if (!id || !dek) return;

    const loadEntry = async () => {
      try {
        const entry = await db.entries.get(id);
        if (entry) {
            const titleData = { ciphertext: entry.titleCipher, iv: entry.titleIv };
            const bodyData = { ciphertext: entry.bodyCipher, iv: entry.bodyIv };

            const decryptedTitle = await CryptoService.decrypt(titleData, dek);
            const decryptedBody = await CryptoService.decrypt(bodyData, dek);

            setTitle(decryptedTitle);
            setBody(decryptedBody);
            setLastSaved(new Date(entry.updatedAt));
        }
      } catch (e) {
        console.error("Failed to load entry", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadEntry();
  }, [id, dek]);

  // Auto-save debounce
  useEffect(() => {
    if (!title && !body) return;
    // Don't save if just loaded and untouched?
    // Actually simplicity: if title/body changes, save.
    // Ideally we track 'isDirty'.

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, body]);

  const handleSave = async () => {
    if (!dek || (!title && !body)) return;

    setIsSaving(true);
    try {
      const encryptedTitle = await CryptoService.encrypt(title, dek);
      const encryptedBody = await CryptoService.encrypt(body, dek);

      const now = new Date();

      await db.entries.put({
        id: entryId,
        date: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        titleCipher: encryptedTitle.ciphertext,
        titleIv: encryptedTitle.iv,
        bodyCipher: encryptedBody.ciphertext,
        bodyIv: encryptedBody.iv,
        createdAt: now.getTime(),
        updatedAt: now.getTime(),
      });

      setLastSaved(now);
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentFont = FONTS[fontIndex];

  if (isLoading) return <div className="p-8 text-center text-ink/40">Opening entry...</div>;

  return (
    <div className="h-full flex flex-col relative pb-20">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-paper/95 z-10 py-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-ink/40 hover:text-ink transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontIndex((i) => (i + 1) % FONTS.length)}
            className="p-2 text-ink/40 hover:text-ink transition-colors rounded-full hover:bg-ink/5"
            aria-label="Change Font"
          >
            <Type size={20} />
          </button>

          <div className="text-[10px] uppercase tracking-widest text-ink/40 font-medium min-w-[60px] text-right">
            {isSaving ? "Saving..." : lastSaved ? "Saved" : "Draft"}
          </div>
        </div>
      </div>

      <div className={cn("flex-1 flex flex-col gap-4 max-w-none", currentFont.class)}>
        <input
          type="text"
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-3xl font-bold text-ink placeholder:text-ink/20 focus:outline-none"
        />

        <textarea
          placeholder="Write your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full flex-1 bg-transparent text-lg text-ink/80 placeholder:text-ink/20 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
