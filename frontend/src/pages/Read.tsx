import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { api, Verse } from '../lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MushafPage from '../components/MushafPage';
import { useSearchParams } from 'react-router-dom';

function parseVerseKey(key: string) {
  const [c, v] = key.split(':').map(Number);
  return { chapter: c, verse: v };
}

export default function Read() {
  const { chapters, state, bootstrap, updateProgress } = useAppStore();
  const [searchParams] = useSearchParams();

  const [pageNumber, setPageNumber] = useState<number>(state?.lastPageNumber ?? 1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const lastLoadedRef = useRef<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Array<{ key: string; note: string; createdAt: string }>>([]);

  // jump controls (surah+ayah -> page)
  const initial = parseVerseKey(state?.lastVerseKey ?? '1:1');
  const [chapter, setChapter] = useState<number>(initial.chapter);
  const [verseInput, setVerseInput] = useState<string>(String(initial.verse));
  const [open, setOpen] = useState<boolean>(false);
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  useEffect(() => { bootstrap(); }, [bootstrap]);
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    if (state?.lastPageNumber) {
      setPageNumber(state.lastPageNumber);
      didInitRef.current = true;
    }
  }, [state?.lastPageNumber]);
  useEffect(() => { loadBookmarks(); }, []);

  useEffect(() => {
    const key = searchParams.get('key');
    if (!key) return;
    const [c, v] = key.split(':').map(Number);
    if (!c || !v) return;
    setChapter(c);
    setVerseInput(String(v));
    setLoading(true);
    api.verse(key)
      .then((res) => setPageNumber(res.verse.page_number))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const pick = searchParams.get('pick');
    const key = searchParams.get('key');
    if (key) return;
    if (pick === '1') setOpen(true);
  }, [searchParams]);

  const currentChapter = useMemo(() => chapters.find(c => c.id === chapter), [chapters, chapter]);
  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter((c) => {
      const name = (c.name_simple || '').toLowerCase();
      const nameAr = (c.name_arabic || '').toLowerCase();
      return name.includes(q) || nameAr.includes(q) || String(c.id).startsWith(q);
    });
  }, [chapters, query]);
  const maxAyah = currentChapter?.verses_count ?? 0;
  const verseNum = Math.max(1, Number(verseInput || 1));

  const header = useMemo(() => {
    const first = verses[0];
    const juz = first?.juz_number;
    // derive surah from first verse_key
    const surahId = first?.verse_key ? Number(first.verse_key.split(':')[0]) : undefined;
    const surahName = surahId ? chapters.find(c => c.id === surahId)?.name_simple : undefined;
    return { juz, surahName };
  }, [verses, chapters]);

  async function loadPage(p: number) {
    if (lastLoadedRef.current === p && verses.length > 0) return;
    lastLoadedRef.current = p;
    setLoading(true);
    try {
      const res = await api.byPage(p);
      setVerses(res.verses || []);

      // Store page metadata for stats (juz & surah id)
      const first = res.verses?.[0];
      if (first?.juz_number && first?.verse_key) {
        const surahId = Number(first.verse_key.split(':')[0]);
        const key = 'ngaji_page_meta_v1';
        const raw = localStorage.getItem(key);
        const map = raw ? (JSON.parse(raw) as Record<string, { juz: number; surah: number }>) : {};
        map[String(p)] = { juz: first.juz_number, surah: surahId };
        localStorage.setItem(key, JSON.stringify(map));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(pageNumber).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  async function jumpToSurahAyah() {
    if (maxAyah > 0 && verseNum > maxAyah) {
      setJumpError(`Ayat tidak ada di surat ${currentChapter?.name_simple ?? '#' + chapter}. Maksimal ayat ${maxAyah}.`);
      return;
    }
    setJumpError(null);
    const key = `${chapter}:${verseNum}`;
    setLoading(true);
    try {
      const res = await api.verse(key);
      setPageNumber(res.verse.page_number);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  function loadBookmarks() {
    const raw = localStorage.getItem('ngaji_bookmarks_v1');
    const list = raw ? (JSON.parse(raw) as Array<{ key: string; note: string; createdAt: string }>) : [];
    setBookmarks(list);
  }

  function recordSavedPage(page: number) {
    const today = new Date().toISOString().slice(0, 10);
    const hKey = 'ngaji_saved_pages_v1';
    const hRaw = localStorage.getItem(hKey);
    const history = hRaw ? (JSON.parse(hRaw) as Record<string, number[]>) : {};
    const list = new Set<number>(history[today] || []);
    list.add(page);
    history[today] = Array.from(list.values()).sort((a, b) => a - b);
    localStorage.setItem(hKey, JSON.stringify(history));
  }

  async function jumpToKey(key: string) {
    const [c, v] = key.split(':').map(Number);
    if (!c || !v) return;
    setChapter(c);
    setVerseInput(String(v));
    setLoading(true);
    try {
      const res = await api.verse(key);
      setPageNumber(res.verse.page_number);
      setOpen(false);
    } finally {
      setLoading(false);
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
              {currentChapter ? `${currentChapter.id}. ${currentChapter.name_simple}` : `#${chapter}`} • {verseNum}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            {open ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
          </div>
        </button>

        {open && (
          <div className="mt-3 space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari surat (nama / nomor)"
              className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            />

            <div className="max-h-52 overflow-auto rounded-xl2 border border-zinc-100">
              {filteredChapters.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setChapter(c.id); setJumpError(null); }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 ${
                    c.id === chapter ? 'bg-zinc-50' : ''
                  }`}
                >
                  <span className="font-medium">{c.id}. {c.name_simple}</span>
                  <span className="text-xs text-zinc-500">{c.verses_count} ayat</span>
                </button>
              ))}
              {filteredChapters.length === 0 && (
                <div className="px-4 py-3 text-sm text-zinc-500">Surat tidak ditemukan.</div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={verseInput}
                onChange={(e) => { setVerseInput(e.target.value.replace(/[^\d]/g, '')); setJumpError(null); }}
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
            {loading && <div className="shimmer-bar" />}
            {jumpError && <div className="text-xs text-red-600">{jumpError}</div>}
          </div>
        )}
      </Card>

      <motion.div
        key={`page:${pageNumber}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {loading ? (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="shimmer-line h-4 w-3/4" />
              <div className="shimmer-line h-4 w-full" />
              <div className="shimmer-line h-4 w-5/6" />
              <div className="shimmer-line h-4 w-2/3" />
              <div className="shimmer-line h-4 w-4/5" />
            </div>
          </Card>
        ) : (
          <MushafPage
            pageNumber={pageNumber}
            verses={verses}
            header={header}
            onBookmarksChange={loadBookmarks}
            onSaveProgress={(verseKey, page) => {
              updateProgress(verseKey, page).then(() => {
                recordSavedPage(page);
                setSaveToast('Progress disimpan');
                setTimeout(() => setSaveToast(null), 1800);
              });
            }}
            lastSavedKey={state?.lastVerseKey}
          />
        )}
      </motion.div>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={nextPage} disabled={loading || pageNumber >= 604}>Next Page</Button>
          <Button variant="secondary" onClick={prevPage} disabled={loading || pageNumber <= 1}>Prev Page</Button>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Terakhir tersimpan: <span className="font-medium text-zinc-900">{state?.lastVerseKey ?? '-'}</span> • Page {state?.lastPageNumber ?? '-'}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Bookmarks</div>
          <button
            onClick={loadBookmarks}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Refresh
          </button>
        </div>

        {bookmarks.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">Belum ada bookmark.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {bookmarks.map((b) => (
              <div
                key={b.key}
                className="flex items-center justify-between rounded-xl2 border border-zinc-100 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold">{b.key}</div>
                  {b.note ? <div className="text-xs text-zinc-500">{b.note}</div> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => jumpToKey(b.key)}
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => {
                      const raw = localStorage.getItem('ngaji_bookmarks_v1');
                      const list = raw ? (JSON.parse(raw) as Array<{ key: string; note: string; createdAt: string }>) : [];
                      const next = list.filter(x => x.key !== b.key);
                      localStorage.setItem('ngaji_bookmarks_v1', JSON.stringify(next));
                      setBookmarks(next);
                    }}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {saveToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {saveToast}
        </div>
      )}
    </div>
  );
}



















