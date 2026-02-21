import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { clamp, pagesLeft, pagesPerDay } from '../lib/format';

export default function Goals() {
  const { state, bootstrap, updateGoals } = useAppStore();
  const [days, setDays] = useState<number>(state?.targetDays ?? 30);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => { if (state?.targetDays) setDays(state.targetDays); }, [state?.targetDays]);

  const total = state?.totalPages ?? 604;
  const current = state?.lastPageNumber ?? 1;
  const left = pagesLeft(total, current);

  const perDay = useMemo(() => pagesPerDay(total, current, days), [total, current, days]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight">Goals</div>
        <div className="text-sm text-zinc-500">Set target khatam • auto hitung halaman per hari</div>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">Target hari sampai khatam</div>
        <div className="mt-2 flex items-center gap-3">
          <input
            value={days}
            onChange={(e) => setDays(clamp(Number(e.target.value || 0), 1, 3650))}
            type="number"
            min={1}
            max={3650}
            className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            placeholder="contoh: 30"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Sisa halaman</div>
            <div className="mt-1 text-lg font-semibold">{left}</div>
          </div>
          <div className="rounded-xl2 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Target per hari</div>
            <div className="mt-1 text-lg font-semibold">{perDay} halaman</div>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={() => updateGoals(days)}>Simpan goals</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Catatan</div>
        <div className="mt-1 text-sm text-zinc-600">
          Sistem menghitung target berdasarkan sisa halaman (total 604 halaman). Kamu bisa ubah total halaman di backend jika memakai mushaf/page mapping berbeda.
        </div>
      </Card>
    </div>
  );
}
