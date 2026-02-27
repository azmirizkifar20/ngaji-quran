import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import { useAppStore } from '../store/useAppStore';
import { pagesLeft, pagesPerDay, remainingDaysFromStart, prettyDate } from '../lib/format';
import { Flame, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, getAuthEmail } from '../lib/api';
import { getLocalSyncUpdatedAt, pullSyncOnlyIfAuthed, pushSyncIfAuthed } from '../lib/sync';


export default function Home() {
  const navigate = useNavigate();
  const { bootstrap, state, error, chapters } = useAppStore();
  const [dailyDone, setDailyDone] = useState(0);
  const [todayStr, setTodayStr] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [history7, setHistory7] = useState<number[]>([]);
  const [history30, setHistory30] = useState<number[]>([]);
  const [surahStat, setSurahStat] = useState<{ name: string; current: number; total: number } | null>(null);
  const [juzStat, setJuzStat] = useState<{ juz: number; index: number; total: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(getAuthEmail());
  const [syncAt, setSyncAt] = useState<string | null>(getLocalSyncUpdatedAt());
  const [syncing, setSyncing] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => {
    const onAuth = () => setAuthEmail(getAuthEmail());
    window.addEventListener('ngaji-auth', onAuth);
    return () => window.removeEventListener('ngaji-auth', onAuth);
  }, []);
  useEffect(() => {
    const updateToday = () => setTodayStr(new Date().toLocaleDateString('en-CA'));
    const id = setInterval(updateToday, 60 * 1000);
    const onFocus = () => updateToday();
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    // cleanup legacy keys (no longer used)
    localStorage.removeItem('ngaji_history_v1');
    localStorage.removeItem('ngaji_daily_date');
    localStorage.removeItem('ngaji_daily_start_page');
    localStorage.removeItem('ngaji_daily_done');
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
  useEffect(() => {
    if (!state?.lastPageNumber) return;
    const today = new Date();
    const todayKey = todayStr;

    const raw = localStorage.getItem('ngaji_saved_pages_v1');
    const history = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    const todayList = history[todayKey] || [];
    const todayCount = todayList.length ? (Math.max(...todayList) - Math.min(...todayList) + 1) : 0;
    setDailyDone(todayCount);

    function getCounts(days: number) {
      const out: number[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-CA');
        const list = history[key] || [];
        out.push(list.length ? (Math.max(...list) - Math.min(...list) + 1) : 0);
      }
      return out;
    }

    const h7 = getCounts(7);
    const h30 = getCounts(30);
    setHistory7(h7);
    setHistory30(h30);


    const [cStr, vStr] = (state.lastVerseKey || '1:1').split(':');
    const cId = Number(cStr);
    const vId = Number(vStr);
    const ch = chapters.find(x => x.id === cId);
    if (ch) {
      setSurahStat({ name: ch.name_simple, current: vId, total: ch.verses_count });
    } else {
      setSurahStat(null);
    }

    const metaRaw = localStorage.getItem('ngaji_page_meta_v1');
    const meta = metaRaw ? (JSON.parse(metaRaw) as Record<string, { juz: number; surah: number }>) : {};
    const currentMeta = meta[String(state.lastPageNumber)];
    if (currentMeta?.juz) {
      const pages = Object.keys(meta)
        .map(k => Number(k))
        .filter(p => meta[String(p)]?.juz === currentMeta.juz)
        .sort((a, b) => a - b);
      const index = pages.filter(p => p <= state.lastPageNumber).length;
      setJuzStat({ juz: currentMeta.juz, index, total: pages.length });
    } else {
      setJuzStat(null);
    }
  }, [state?.lastPageNumber, state?.lastVerseKey, chapters, state?.totalPages, todayStr, syncTick]);

  const total = state?.totalPages ?? 604;
  const current = state?.lastPageNumber ?? 1;
  const left = pagesLeft(total, current);
  const remainingDays = useMemo(
    () => remainingDaysFromStart(state?.startDate ?? new Date().toISOString(), state?.targetDays ?? 30),
    [state?.startDate, state?.targetDays]
  );
  const perDay = pagesPerDay(total, current, remainingDays);
  const remainingToday = Math.max(0, perDay - dailyDone);
  const dailyPct = perDay > 0 ? Math.min(100, Math.round((dailyDone / perDay) * 100)) : 0;
  const pct = (current / total) * 100;
  const lastVerseLabel = useMemo(() => {
    const key = state?.lastVerseKey ?? '1:1';
    const [cStr, vStr] = key.split(':');
    const cId = Number(cStr);
    const vId = Number(vStr);
    const ch = chapters.find((x) => x.id === cId);
    if (!ch || !vId) return key;
    return `${ch.name_simple} ${vId}`;
  }, [state?.lastVerseKey, chapters]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg sm:text-xl font-semibold tracking-tight">{state?.name ? `Ngaji Quran • ${state.name}` : 'Ngaji Quran'}</div>
          <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-zinc-500">
            <span>v1.0.0</span>
            <span className="text-zinc-400">•</span>
            <a href="/changelog" className="underline underline-offset-4 hover:text-zinc-700">
              changelog
            </a>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
              onClick={async () => {
                if (!authEmail) {
                  navigate(`/auth?mode=login&redirect=${encodeURIComponent('/')}`);
                  return;
                }
                setSyncing(true);
                await pullSyncOnlyIfAuthed();
                await bootstrap();
                setSyncAt(getLocalSyncUpdatedAt());
                setSyncing(false);
                setSyncTick((v) => v + 1);
                window.dispatchEvent(new CustomEvent('ngaji-sync'));
                setToast('Sync selesai');
                setTimeout(() => setToast(null), 1800);
              }}
              disabled={syncing}
              aria-label="Sync"
              title="Sync"
            >
              <i className={`fa-solid fa-rotate ${syncing ? 'fa-spin' : ''}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              onClick={() => navigate(`/auth?mode=login&redirect=${encodeURIComponent('/')}`)}
              aria-label="Profile"
              title="Profile"
            >
              <i className="fa-regular fa-user" aria-hidden="true" />
            </button>
          </div>
          {syncAt && (
            <div className="mt-1 text-[10px] text-zinc-500">
              Last sync: {new Date(syncAt).toLocaleString('id-ID')}
            </div>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-red-600">Error</div>
          <div className="text-sm text-zinc-600">{error}</div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <ProgressRing value={pct} label={`Halaman ${current} / ${total}`} />
          <div className="text-right">
            <div className="text-xs text-zinc-500">Sisa</div>
            <div className="text-base sm:text-lg font-semibold">{left} halaman</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Flame size={16} /> Streak
            </div>
            <div className="mt-1 text-base sm:text-lg font-semibold">{state?.streak ?? 0} hari</div>
          </div>
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles size={16} /> Target/hari
            </div>
            <div className="mt-1 text-base sm:text-lg font-semibold">{perDay} halaman</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl2 border border-zinc-100 bg-white p-3 text-xs text-zinc-600">
          <div className="flex items-center justify-between">
            <div>
              Target harian: <span className="font-medium text-zinc-900">{perDay} halaman</span> •
              Hari ini: <span className="font-medium text-zinc-900">{dailyDone} halaman</span> •
              Sisa: <span className="font-medium text-zinc-900">{remainingToday} halaman</span>
            </div>
            <div className="ml-3 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              {dailyPct}%
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${dailyPct}%` }} />
          </div>
          {dailyDone === 0 && (
            <div className="mt-2 text-[11px] text-zinc-500">
              Mulai baca sekarang untuk mengejar target hari ini.
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Mulai: {state?.startDate ? prettyDate(state.startDate) : '-'} • Target: {state?.targetDays ?? 30} hari
        </div>

        {(surahStat || juzStat) && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl2 bg-zinc-50 p-3">
              <div className="text-xs text-zinc-500">Surat saat ini</div>
              <div className="mt-1 text-sm font-semibold">
                {surahStat ? `${surahStat.name} ${surahStat.current}/${surahStat.total}` : '-'}
              </div>
            </div>
            <div className="rounded-xl2 bg-zinc-50 p-3">
              <div className="text-xs text-zinc-500">Juz saat ini</div>
              <div className="mt-1 text-sm font-semibold">
                {juzStat ? `Juz ${juzStat.juz}` : '-'}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            className="w-full rounded-xl2 px-4 py-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
            onClick={async () => {
              const Swal = (window as any).Swal;
              const result = Swal
                ? await Swal.fire({
                    title: 'Reset progress?',
                    text: 'Progress ngaji kamu akan direset kecuali bookmark ayat.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Reset',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#ef4444',
                  })
                : { isConfirmed: window.confirm('Reset semua progress (kecuali bookmark)?') };
              if (!result.isConfirmed) return;

              localStorage.removeItem('ngaji_saved_pages_v1');
              localStorage.removeItem('ngaji_history_v1');
              localStorage.removeItem('ngaji_page_meta_v1');
              localStorage.removeItem('ngaji_last_saved_v1');
              localStorage.removeItem('ngaji_daily_date');
              localStorage.removeItem('ngaji_daily_start_page');
              localStorage.removeItem('ngaji_daily_done');

              await api.reset();
              await bootstrap();
              await pushSyncIfAuthed();
              setSyncAt(getLocalSyncUpdatedAt());
              setToast('Progress direset');
              setTimeout(() => setToast(null), 1800);
            }}
          >
            Reset data
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Lanjut dari terakhir</div>
        <div className="mt-1 text-sm text-zinc-600">
          Ayat terakhir: <span className="font-medium text-zinc-900">{lastVerseLabel}</span>
        </div>
        <div className="mt-3">
          <a href="/read?pick=1" className="block">
            <Button>Mulai baca</Button>
          </a>
        </div>
        <div className="mt-3">
          <a
            href={`/read?key=${encodeURIComponent(state?.lastVerseKey ?? '1:1')}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Lanjutkan ke halaman terakhir <ArrowRight size={14} />
          </a>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Riwayat harian</div>
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-xs text-zinc-500">7 hari terakhir</div>
            <div className="mt-2 mini-bar-row">
              {history7.map((v, i) => (
                <div key={i} className="mini-bar">
                  <div className="mini-bar-fill" style={{ height: `${Math.min(100, v * 12)}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">30 hari terakhir</div>
            <div className="mt-2 mini-bar-row">
              {history30.map((v, i) => (
                <div key={i} className="mini-bar">
                  <div className="mini-bar-fill" style={{ height: `${Math.min(100, v * 6)}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={14} /> {toast}
          </span>
        </div>
      )}

    </div>
  );
}
