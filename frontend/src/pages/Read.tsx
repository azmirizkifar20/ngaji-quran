import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { api, Verse } from '../lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MushafPage from '../components/MushafPage';

function parseVerseKey(key: string) {
  const [c, v] = key.split(':').map(Number);
  return { chapter: c, verse: v };
}

export default function Read() {
  const { chapters, state, bootstrap, updateProgress } = useAppStore();

  const [pageNumber, setPageNumber] = useState<number>(state?.lastPageNumber ?? 1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // jump controls (surah+ayah -> page)
  const initial = parseVerseKey(state?.lastVerseKey ?? '1:1');
  const [chapter, setChapter] = useState<number>(initial.chapter);
  const [verse, setVerse] = useState<number>(initial.verse);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => { if (state?.lastPageNumber) setPageNumber(state.lastPageNumber); }, [state?.lastPageNumber]);

  const currentChapter = useMemo(() => chapters.find(c => c.id === chapter), [chapters, chapter]);

  const header = useMemo(() => {
    const first = verses[0];
    const juz = first?.juz_number;
    // derive surah from first verse_key
    const surahId = first?.verse_key ? Number(first.verse_key.split(':')[0]) : undefined;
    const surahName = surahId ? chapters.find(c => c.id === surahId)?.name_simple : undefined;
    return { juz, surahName };
  }, [verses, chapters]);

  async function loadPage(p: number) {
    setLoading(true);
    try {
      const res = await api.byPage(p);
      setVerses(res.verses || []);

      const lastKey = res.verses?.length ? res.verses[res.verses.length - 1].verse_key : `${chapter}:${verse}`;
      await updateProgress(lastKey, p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(pageNumber).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  async function jumpToSurahAyah() {
    const key = `${chapter}:${verse}`;
    setLoading(true);
    try {
      const res = await api.verse(key);
      setPageNumber(res.verse.page_number);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  function nextPage() { setPageNumber(p => Math.min(604, p + 1)); }
  function prevPage() { setPageNumber(p => Math.max(1, p - 1)); }

  return (
    <div className="space-y-4">
      <div />

      <Card className="p-4">
        <button
          className="flex w-full items-center justify-between gap-3 rounded-xl2 bg-zinc-50 p-3 text-left"
          onClick={() => setOpen(o => !o)}
        >
          <div>
            <div className="text-xs text-zinc-500">Jump to (Surah • Ayat)</div>
            <div className="text-sm font-semibold">
              {currentChapter ? `${currentChapter.id}. ${currentChapter.name_simple}` : `#${chapter}`} • {verse}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            {open ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
          </div>
        </button>

        {open && (
          <div className="mt-3 space-y-3">
            <div className="max-h-52 overflow-auto rounded-xl2 border border-zinc-100">
              {chapters.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setChapter(c.id); }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 ${
                    c.id === chapter ? 'bg-zinc-50' : ''
                  }`}
                >
                  <span className="font-medium">{c.id}. {c.name_simple}</span>
                  <span className="text-xs text-zinc-500">{c.verses_count} ayat</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={verse}
                onChange={(e) => setVerse(Math.max(1, Number(e.target.value || 1)))}
                type="number"
                min={1}
                className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                placeholder="Ayat"
              />
              <div className="w-40">
                <Button variant="secondary" onClick={jumpToSurahAyah} disabled={loading}>
                  Go
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <motion.div
        key={`page:${pageNumber}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <MushafPage pageNumber={pageNumber} verses={verses} header={header} />
      </motion.div>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={prevPage} disabled={loading || pageNumber <= 1}>Prev Page</Button>
          <Button onClick={nextPage} disabled={loading || pageNumber >= 604}>Next Page</Button>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Terakhir tersimpan: <span className="font-medium text-zinc-900">{state?.lastVerseKey ?? '-'}</span> • Page {state?.lastPageNumber ?? '-'}
        </div>
      </Card>

    </div>
  );
}


