import { useEffect, useState } from 'react';
import Button from './Button';
import { api, clearAuth, getAuthEmail, getAuthToken, setAuth } from '../lib/api';
import { applySyncPayload, getLocalSyncPayload, setLocalSyncUpdatedAt } from '../lib/sync';

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthed: (email: string) => void;
  onLoggedOut: () => void;
};

export default function AuthModal({ open, onClose, onAuthed, onLoggedOut }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setAuthedEmail(getAuthEmail());
  }, [open]);

  if (!open) return null;

  const authed = !!getAuthToken();

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await api.register({ email, password, name: name.trim() || undefined });
        setAuth(res.token, res.user.email);
      } else {
        const res = await api.login({ email, password });
        setAuth(res.token, res.user.email);
      }

      const localPayload = getLocalSyncPayload();
      const hasLocal =
        (localPayload.bookmarks?.length || 0) > 0 ||
        Object.keys(localPayload.savedPages || {}).length > 0 ||
        Object.keys(localPayload.pageMeta || {}).length > 0;

      const serverRes = await api.syncGet();
      const serverPayload = serverRes.data;
      const hasServer =
        !!serverPayload &&
        ((serverPayload.bookmarks?.length || 0) > 0 ||
          Object.keys(serverPayload.savedPages || {}).length > 0 ||
          Object.keys(serverPayload.pageMeta || {}).length > 0);

      if (hasLocal && hasServer) {
        const Swal = (window as any).Swal;
        const useLocal = Swal
          ? (await Swal.fire({
              title: 'Pilih data untuk disinkronkan',
              text: 'Kamu sudah punya data lokal dan data di server. Mau pakai yang mana?',
              icon: 'question',
              showDenyButton: true,
              confirmButtonText: 'Pakai data lokal',
              denyButtonText: 'Pakai data server',
            })).isConfirmed
          : window.confirm('Pakai data lokal? Klik Cancel untuk pakai data server.');

        if (useLocal) {
          const res = await api.syncSet(localPayload);
          setLocalSyncUpdatedAt(res.updatedAt);
        } else if (serverPayload) {
          applySyncPayload(serverPayload);
          if (serverRes.updatedAt) setLocalSyncUpdatedAt(serverRes.updatedAt);
        }
      } else if (hasLocal && !hasServer) {
        const res = await api.syncSet(localPayload);
        setLocalSyncUpdatedAt(res.updatedAt);
      } else if (!hasLocal && hasServer && serverPayload) {
        applySyncPayload(serverPayload);
        if (serverRes.updatedAt) setLocalSyncUpdatedAt(serverRes.updatedAt);
      }

      const currentEmail = getAuthEmail() || email;
      setAuthedEmail(currentEmail);
      onAuthed(currentEmail);
    } catch (e: any) {
      setError(e?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    setAuthedEmail(null);
    onLoggedOut();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Sinkronisasi</div>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-700">Tutup</button>
        </div>

        {authed ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl2 bg-zinc-50 p-3 text-sm text-zinc-700">
              Terhubung sebagai <span className="font-semibold">{authedEmail ?? '-'}</span>
            </div>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  mode === 'login' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
                onClick={() => setMode('login')}
              >
                Masuk
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  mode === 'register' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
                onClick={() => setMode('register')}
              >
                Daftar
              </button>
            </div>

            {mode === 'register' && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama (opsional)"
                className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl2 border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            />

            {error && <div className="text-xs text-red-600">{error}</div>}

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Memproses...' : mode === 'register' ? 'Daftar & Sinkron' : 'Masuk & Sinkron'}
            </Button>

            <div className="text-xs text-zinc-500">
              Data progress, bookmark, dan pengaturan akan disinkronkan ke akun ini.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
