import { useEffect, useMemo, useRef, useState } from 'react';
import type { Verse } from '../lib/api';

type MushafWord = {
  line: number;
  pos: number;
  html: string; // code_v2 (HTML entity string)
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MushafPage({
  pageNumber,
  verses,
  header,
  onBookmarksChange,
  onSaveProgress,
  lastSavedKey,
}: {
  pageNumber: number;
  verses: Verse[];
  header: { juz?: number; surahName?: string };
  onBookmarksChange?: () => void;
  onSaveProgress?: (verseKey: string, pageNumber: number) => void;
  lastSavedKey?: string;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);
  const [bookmarkSet, setBookmarkSet] = useState<Set<string>>(new Set());

  // Option A: auto-scale to container width so 15 lines always fit nicely on mobile
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const s = clamp(w / 420, 0.82, 1.0);
      setScale(s);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep layout height in sync with scaled content so next sections don't overlap
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const update = () => {
      const base = el.scrollHeight || el.getBoundingClientRect().height || 0;
      if (base > 0) {
        const extra = 12; // add a little breathing room to avoid clipping
        setScaledHeight(base * scale + extra);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, verses]);

  const { lines, hasGlyphs } = useMemo(() => {
    const words: MushafWord[] = [];

    for (const v of verses) {
      const ws = v.words || [];
      for (const w of ws as any[]) {
        const line = Number(w.line_number || 0);
        const pos = Number(w.position || 0);
        const html = String(w.code_v2 || '').trim();
        if (!line || !html) continue;
        words.push({ line, pos, html });
      }
    }

    const grouped: Record<number, MushafWord[]> = {};
    for (const it of words) {
      grouped[it.line] ||= [];
      grouped[it.line].push(it);
    }
    for (const k of Object.keys(grouped)) {
      grouped[Number(k)].sort((a, b) => a.pos - b.pos);
    }

    const out: MushafWord[][] = [];
    let any = false;
    for (let i = 1; i <= 15; i++) {
      const arr = grouped[i] || [];
      if (arr.length) any = true;
      out.push(arr);
    }

    return { lines: out, hasGlyphs: any };
  }, [verses]);

  const fallbackVerses = useMemo(() => {
    const toArabicIndic = (n: number) =>
      String(n).replace(/\d/g, (d) => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[Number(d)]);
    return verses.map((v) => {
      const ayah = Number(v.verse_key.split(':')[1] || 0);
      return {
        key: v.verse_key,
        text: v.text_uthmani,
        ayah: isNaN(ayah) ? 0 : ayah,
        ayahAr: toArabicIndic(ayah),
      };
    });
  }, [verses]);

  useEffect(() => {
    const raw = localStorage.getItem('ngaji_bookmarks_v1');
    const list = raw ? (JSON.parse(raw) as Array<{ key: string }>) : [];
    setBookmarkSet(new Set(list.map((b) => b.key)));
  }, [verses]);

  function toggleBookmark(key: string) {
    const raw = localStorage.getItem('ngaji_bookmarks_v1');
    const list = raw ? (JSON.parse(raw) as Array<{ key: string; note: string; createdAt: string }>) : [];
    const exists = list.find((b) => b.key === key);
    let next = list;
    if (exists) {
      next = list.filter((b) => b.key !== key);
    } else {
      const note = window.prompt('Catatan singkat (opsional):', '') || '';
      next = [{ key, note, createdAt: new Date().toISOString() }, ...list];
    }
    localStorage.setItem('ngaji_bookmarks_v1', JSON.stringify(next));
    setBookmarkSet(new Set(next.map((b) => b.key)));
    onBookmarksChange?.();
  }

  return (
    <div ref={outerRef} className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-600">
        <div className="font-semibold">Juz {header.juz ?? '-'}</div>
        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-900">
          {pageNumber}
        </div>
        <div className="font-semibold">{header.surahName ?? ''}</div>
      </div>

      <div className="rounded-xl2 border border-zinc-100 bg-white py-2 px-0 sm:p-4 shadow-soft overflow-hidden">
        <div className="relative" style={{ height: scaledHeight }}>
          <div
            className="absolute left-0 right-0 top-0"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            <div ref={innerRef}>
              <div className="arabic leading-relaxed px-0 sm:px-8">
                {fallbackVerses.map((v) => (
                  <div key={v.key} className="verse-block">
                    <div className="verse-text">
                      {v.text}{' '}
                      <span className="ayah-paren" aria-label={`Ayah ${v.ayah}`}>
                        {v.ayahAr}
                      </span>
                      <button
                        type="button"
                        className={`bookmark-btn ${bookmarkSet.has(v.key) ? 'is-active' : ''}`}
                        aria-label={bookmarkSet.has(v.key) ? 'Hapus bookmark' : 'Simpan bookmark'}
                        onClick={() => toggleBookmark(v.key)}
                      >
                        {bookmarkSet.has(v.key) ? (
                          <i className="fa-solid fa-star" aria-hidden="true" />
                        ) : (
                          <i className="fa-regular fa-star" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        className={`save-progress-btn ${lastSavedKey === v.key ? 'is-active' : ''}`}
                        aria-label="Simpan progress terakhir"
                        onClick={() => onSaveProgress?.(v.key, pageNumber)}
                      >
                        {lastSavedKey === v.key ? (
                          <i className="fa-solid fa-bookmark" aria-hidden="true" />
                        ) : (
                          <i className="fa-regular fa-bookmark" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


