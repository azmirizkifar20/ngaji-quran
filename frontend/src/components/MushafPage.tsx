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
}: {
  pageNumber: number;
  verses: Verse[];
  header: { juz?: number; surahName?: string };
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);

  // Option A: auto-scale to container width so 15 lines always fit nicely on mobile
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const s = clamp(w / 420, 0.82, 1.08);
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
      if (base > 0) setScaledHeight(base * scale);
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

  return (
    <div ref={outerRef} className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-600">
        <div className="font-semibold">Juz {header.juz ?? '-'}</div>
        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-900">
          {pageNumber}
        </div>
        <div className="font-semibold">{header.surahName ?? ''}</div>
      </div>

      <div className="rounded-xl2 border border-zinc-100 bg-white py-2 px-0 sm:p-4 shadow-soft">
        <div className="relative" style={{ height: scaledHeight }}>
          <div
            className="absolute left-0 right-0 top-0"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            <div ref={innerRef}>
              {hasGlyphs ? (
                <div className="mushaf-page">
                  {lines.map((lineWords, idx) => (
                    <div key={idx} className="mushaf-line" aria-label={`Line ${idx + 1}`}>
                      {lineWords.map((w, i) => (
                        <span
                          key={i}
                          className="mushaf-glyph"
                          // code_v2 is an HTML entity string; rendered as glyph if font supports it
                          dangerouslySetInnerHTML={{ __html: w.html }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="arabic leading-relaxed px-0 sm:px-8">
                    {fallbackVerses.map((v) => (
                      <span key={v.key} className="inline">
                        {v.text}{' '}
                        <span className="ayah-sep" aria-label={`Ayah ${v.ayah}`}>
                          {"\uFD3F"}{v.ayahAr}{"\uFD3E"}
                        </span>{' '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


