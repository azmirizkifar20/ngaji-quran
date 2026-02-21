import { useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import { useAppStore } from '../store/useAppStore';
import { pagesLeft, pagesPerDay, prettyDate } from '../lib/format';
import { Flame, Sparkles } from 'lucide-react';

export default function Home() {
  const { bootstrap, state, loading, error, checkIn } = useAppStore();

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const total = state?.totalPages ?? 604;
  const current = state?.lastPageNumber ?? 1;
  const left = pagesLeft(total, current);
  const perDay = pagesPerDay(total, current, state?.targetDays ?? 30);
  const pct = (current / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight">Ngaji Quran</div>
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

        <div className="mt-4 text-xs text-zinc-500">
          Mulai: {state?.startDate ? prettyDate(state.startDate) : '-'} • Target: {state?.targetDays ?? 30} hari
        </div>

        <div className="mt-4">
          <Button variant="secondary" onClick={() => checkIn()} disabled={loading}>
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
      </Card>
    </div>
  );
}
