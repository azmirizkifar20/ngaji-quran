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

  const [pageNumber, setPageNumber] = useState<number>(state?.lastPageNumber ?? 1);
  const [verses, setVerses] = useState<Array<{ verse_key: string; text_uthmani: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // jump controls (surah+ayah -> page)
  const initial = parseVerseKey(state?.lastVerseKey ?? '1:1');
  const [chapter, setChapter] = useState<number>(initial.chapter);
  const [verse, setVerse] = useState<number>(initial.verse);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => { if (state?.lastPageNumber) setPageNumber(state.lastPageNumber); }, [state?.lastPageNumber]);

  const currentChapter = useMemo(() => chapters.find(c => c.id === chapter), [chapters, chapter]);

  async function loadPage(p: number) {
    setLoading(true);
    try {
      const res = await api.byPage(p);
      const list = (res.verses || []).map(v => ({ verse_key: v.verse_key, text_uthmani: v.text_uthmani }));
      setVerses(list);

      const lastKey = list.length ? list[list.length - 1].verse_key : `${chapter}:${verse}`;
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
      // progress will be saved by loadPage()
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  function nextPage() {
    setPageNumber(p => Math.min(604, p + 1));
  }
  function prevPage() {
    setPageNumber(p => Math.max(1, p - 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight">Baca (Per Halaman)</div>
          <div className="text-sm text-zinc-500">Mode mushaf • 1 page = banyak ayat</div>
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

      <Card className="p-4">
        <motion.div
          key={`page:${pageNumber}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-4"
        >
          {loading && verses.length === 0 ? (
            <div className="text-sm text-zinc-500">Loading...</div>
          ) : (
            <div className="space-y-5">
              {verses.map((v) => (
                <div key={v.verse_key} className="rounded-xl2 bg-white">
                  <div className="mb-2 text-xs text-zinc-500">{v.verse_key}</div>
                  <div className="arabic select-text">{v.text_uthmani}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={prevPage} disabled={loading || pageNumber <= 1}>Prev Page</Button>
          <Button onClick={nextPage} disabled={loading || pageNumber >= 604}>Next Page</Button>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Terakhir tersimpan: <span className="font-medium text-zinc-900">{state?.lastVerseKey ?? '-'}</span> • Page {state?.lastPageNumber ?? '-'}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Typography premium</div>
        <div className="mt-1 text-sm text-zinc-600">
          Default font: <span className="font-medium">Amiri Quran</span>. Untuk tampilan paling mirip mushaf Madinah, taruh font QCF/Uthmanic Hafs di <code className="rounded bg-zinc-50 px-1">frontend/public/fonts</code> lalu aktifkan di <code className="rounded bg-zinc-50 px-1">src/styles/arabic-fonts.css</code>.
        </div>
      </Card>
    </div>
  );
}
