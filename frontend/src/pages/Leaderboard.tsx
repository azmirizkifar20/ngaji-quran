import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';

export default function Leaderboard() {
  const { state, leaderboard, refreshLeaderboard, setName } = useAppStore();
  const [name, setNameInput] = useState(state?.name ?? '');

  useEffect(() => {
    refreshLeaderboard().catch(console.error);
  }, [refreshLeaderboard]);

  useEffect(() => {
    setNameInput(state?.name ?? '');
  }, [state?.name]);

  const meId = state?.id;

  const sorted = useMemo(() => leaderboard, [leaderboard]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight">Leaderboard</div>
        <div className="text-sm text-zinc-500">Ranking berdasarkan streak & XP</div>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">Nama kamu</div>
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="contoh: Ahmad"
            className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            maxLength={40}
          />
          <div className="w-32">
            <Button variant="secondary" onClick={() => setName(name).then(() => refreshLeaderboard())}>
              Simpan
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Nama dipakai untuk tampilan leaderboard (tanpa login).
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Top 20</div>
          <button
            onClick={() => refreshLeaderboard()}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {sorted.length === 0 && (
            <div className="text-sm text-zinc-600">Belum ada data. Coba check-in dulu.</div>
          )}

          {sorted.map((row, idx) => {
            const isMe = meId && row.id === meId;
            return (
              <div
                key={row.id}
                className={`flex items-center justify-between rounded-xl2 border border-zinc-100 px-3 py-3 ${
                  isMe ? 'bg-zinc-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center text-sm font-semibold text-zinc-900">{idx + 1}</div>
                  <div>
                    <div className="text-sm font-semibold">
                      {row.name?.trim() ? row.name : `Anon-${row.id.slice(0, 4)}`}
                      {isMe ? <span className="ml-2 rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">You</span> : null}
                    </div>
                    <div className="text-xs text-zinc-500">Page {row.lastPageNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{row.streak} 🔥</div>
                  <div className="text-xs text-zinc-500">{row.xp} XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
