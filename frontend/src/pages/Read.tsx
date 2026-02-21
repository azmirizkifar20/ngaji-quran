import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { api } from '../lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function parseVerseKey(key: string) {
  const [c, v] = key.split(':').map(Number);
  return { chapter: c, verse: v };
}

export default function Read() {
  const { chapters, state, bootstrap, updateProgress } = useAppStore();
  const [chapter, setChapter] = useState<number>(() => parseVerseKey(state?.lastVerseKey ?? '1:1').chapter);
  const [verse, setVerse] = useState<number>(() => parseVerseKey(state?.lastVerseKey ?? '1:1').verse);
  const [arabic, setArabic] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(state?.lastPageNumber ?? 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const currentChapter = useMemo(() => chapters.find(c => c.id === chapter), [chapters, chapter]);

  async function loadVerse(key: string) {
    setLoading(true);
    try {
      const res = await api.verse(key);
      setArabic(res.verse.text_uthmani);
      setPageNumber(res.verse.page_number);
      await updateProgress(res.verse.verse_key, res.verse.page_number);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const key = `${chapter}:${verse}`;
    loadVerse(key).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, verse]);

  function next() {
    setVerse(v => v + 1);
  }
  function prev() {
    setVerse(v => Math.max(1, v - 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight">Baca</div>
          <div className="text-sm text-zinc-500">Auto page mapping dari Quran.com API</div>
        </div>
        <div className="rounded-xl2 border border-zinc-100 bg-white px-3 py-2 shadow-soft text-right">
          <div className="text-xs text-zinc-500">Page</div>
          <div className="text-sm font-semibold">{pageNumber}</div>
        </div>
      </div>

      <Card className="p-4">
        <button
          className="flex w-full items-center justify-between gap-3 rounded-xl2 bg-zinc-50 p-3 text-left"
          onClick={() => setOpen(o => !o)}
        >
          <div>
            <div className="text-xs text-zinc-500">Surah</div>
            <div className="text-sm font-semibold">{currentChapter ? `${currentChapter.name_simple}` : `#${chapter}`}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            Ayat {verse}
            {open ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
          </div>
        </button>

        {open && (
          <div className="mt-3 max-h-56 overflow-auto rounded-xl2 border border-zinc-100">
            {chapters.map(c => (
              <button
                key={c.id}
                onClick={() => { setChapter(c.id); setVerse(1); setOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 ${
                  c.id === chapter ? 'bg-zinc-50' : ''
                }`}
              >
                <span className="font-medium">{c.id}. {c.name_simple}</span>
                <span className="text-xs text-zinc-500">{c.verses_count} ayat</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <motion.div
          key={`${chapter}:${verse}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-3"
        >
          <div className="text-xs text-zinc-500">({chapter}:{verse})</div>
          <div className="arabic select-text">{arabic || (loading ? '...' : '')}</div>
        </motion.div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={prev} disabled={loading || verse <= 1}>Sebelumnya</Button>
          <Button onClick={next} disabled={loading}>Berikutnya</Button>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Terakhir tersimpan: <span className="font-medium text-zinc-900">{state?.lastVerseKey ?? '-'}</span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Tips kenyamanan baca</div>
        <div className="mt-1 text-sm text-zinc-600">
          Untuk tampilan paling nyaman seperti mushaf, tambahkan font QCF/Uthmanic Hafs ke <code className="rounded bg-zinc-50 px-1">frontend/public/fonts</code>.
          Lihat <code className="rounded bg-zinc-50 px-1">src/styles/arabic-fonts.css</code>.
        </div>
      </Card>
    </div>
  );
}
