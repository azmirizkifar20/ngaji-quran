import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import { useAppStore } from '../store/useAppStore';
import { pagesLeft, pagesPerDay, prettyDate } from '../lib/format';
import { Flame, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { bootstrap, state, loading, error, checkIn } = useAppStore();
  const [dailyDone, setDailyDone] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => {
    if (!state?.lastPageNumber) return;
    const today = new Date().toISOString().slice(0, 10);
    const keyDate = 'ngaji_daily_date';
    const keyStart = 'ngaji_daily_start_page';
    const keyDone = 'ngaji_daily_done';

    const storedDate = localStorage.getItem(keyDate);
    let startPage = Number(localStorage.getItem(keyStart) || state.lastPageNumber);
    let done = Number(localStorage.getItem(keyDone) || 0);

    if (storedDate !== today) {
      startPage = state.lastPageNumber;
      done = 0;
      localStorage.setItem(keyDate, today);
      localStorage.setItem(keyStart, String(startPage));
      localStorage.setItem(keyDone, String(done));
    }

    const diff = Math.max(0, state.lastPageNumber - startPage);
    if (diff !== done) {
      done = diff;
      localStorage.setItem(keyDone, String(done));
    }

    setDailyDone(done);
  }, [state?.lastPageNumber]);

  const total = state?.totalPages ?? 604;
  const current = state?.lastPageNumber ?? 1;
  const left = pagesLeft(total, current);
  const perDay = pagesPerDay(total, current, state?.targetDays ?? 30);
  const remainingToday = Math.max(0, perDay - dailyDone);
  const dailyPct = perDay > 0 ? Math.min(100, Math.round((dailyDone / perDay) * 100)) : 0;
  const pct = (current / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight">{state?.name ? `Ngaji Quran • ${state.name}` : 'Ngaji Quran'}</div>
          <div className="text-sm text-zinc-500">Premium light • fokus & konsisten</div>
        </div>
        <div className="rounded-xl2 border border-zinc-100 bg-white px-3 py-2 shadow-soft">
          <div className="text-xs text-zinc-500">XP</div>
          <div className="text-sm font-semibold">{state?.xp ?? 0}</div>
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
            <div className="text-lg font-semibold">{left} halaman</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Flame size={16} /> Streak
            </div>
            <div className="mt-1 text-lg font-semibold">{state?.streak ?? 0} hari</div>
          </div>
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles size={16} /> Target/hari
            </div>
            <div className="mt-1 text-lg font-semibold">{perDay} halaman</div>
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

        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() =>
              checkIn().then(() => {
                setToast('Check-in berhasil');
                setTimeout(() => setToast(null), 1800);
              })
            }
            disabled={loading}
          >
            Check-in hari ini
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Lanjut dari terakhir</div>
        <div className="mt-1 text-sm text-zinc-600">
          Ayat terakhir: <span className="font-medium text-zinc-900">{state?.lastVerseKey ?? '1:1'}</span>
        </div>
        <div className="mt-3">
          <a href="/read" className="block">
            <Button>Mulai baca</Button>
          </a>
        </div>
        <div className="mt-3">
          <a
            href="/read"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Lanjutkan ke halaman terakhir <ArrowRight size={14} />
          </a>
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
