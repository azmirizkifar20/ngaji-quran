import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { api, clearAuth, getAuthEmail, getAuthToken, setAuth } from '../lib/api';
import { applySyncPayload, getLocalSyncPayload, setLocalSyncUpdatedAt } from '../lib/sync';

type Mode = 'login' | 'register';

function emailLooksValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const redirectTo = sp.get('redirect') || '/';
  const initialMode = (sp.get('mode') as Mode) || 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(sp.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(getAuthEmail());

  const emailRef = useRef<HTMLInputElement | null>(null);
  const pwRef = useRef<HTMLInputElement | null>(null);

  const authed = !!getAuthToken();

  const canSubmit = useMemo(() => {
    if (!emailLooksValid(email)) return false;
    if (password.length < 6) return false;
    if (mode === 'register' && confirm !== password) return false;
    return true;
  }, [email, password, confirm, mode]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    setError(null);
  }, [mode]);

  async function runSyncAfterAuth() {
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
        ? (
            await Swal.fire({
              title: 'Pilih data untuk disinkronkan',
              text: 'Kamu sudah punya data lokal dan data di server. Mau pakai yang mana?',
              icon: 'question',
              showDenyButton: true,
              confirmButtonText: 'Pakai data lokal',
              denyButtonText: 'Pakai data server',
            })
          ).isConfirmed
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.register({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        });
        setAuth(res.token, res.user.email);
      } else {
        const res = await api.login({ email: email.trim(), password });
        setAuth(res.token, res.user.email);
      }

      await runSyncAfterAuth();

      const currentEmail = getAuthEmail() || email.trim();
      setAuthedEmail(currentEmail);
      window.dispatchEvent(new Event('ngaji-auth'));
      window.dispatchEvent(new Event('ngaji-sync'));
      navigate(redirectTo, { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Gagal memproses. Coba lagi.');
      setTimeout(() => pwRef.current?.focus(), 50);
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    clearAuth();
    setAuthedEmail(null);
    window.dispatchEvent(new Event('ngaji-auth'));
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(redirectTo)}
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 active:scale-[0.99] transition"
          >
            <span className="inline-block translate-x-0 group-hover:-translate-x-[1px] transition">&lt;-</span>
            <span>Kembali</span>
          </button>

          <div />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-start justify-center px-4 pb-10 pt-2">
        <div className="relative mx-auto w-full max-w-md">
          <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-b from-black/5 to-transparent blur-2xl" />

          <div className="relative rounded-2xl border border-zinc-100 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-7">
            {authed ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-zinc-500">Terhubung sebagai</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900">
                    {authedEmail || '-'}
                  </div>
                </div>

                <div className="rounded-xl2 bg-zinc-50 p-3 text-sm text-zinc-700">
                  Kamu bisa logout kapan saja. Data lokal kamu tidak akan dihapus.
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await runSyncAfterAuth();
                        window.dispatchEvent(new Event('ngaji-sync'));
                        navigate(redirectTo, { replace: true });
                      } catch (e: any) {
                        setError(e?.message || 'Gagal sinkron.');
                      } finally {
                        setBusy(false);
                      }
                    }}
                    disabled={busy}
                  >
                    {busy ? 'Menyinkron...' : 'Sinkron sekarang'}
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} disabled={busy}>
                    Logout
                  </Button>
                </div>

                {error && (
                  <div className="rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-zinc-500">
                      {mode === 'login' ? 'Selamat datang kembali' : 'Mulai perjalananmu'}
                    </div>
                    <div className="mt-1 text-xl font-semibold text-zinc-900">
                      {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
                    </div>
                  </div>

                  <div className="flex rounded-full border border-zinc-100 bg-white p-1 text-xs">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setMode('login')}
                      className={cx(
                        'rounded-full px-3 py-1.5 font-semibold transition',
                        mode === 'login' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                      )}
                    >
                      Masuk
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setMode('register')}
                      className={cx(
                        'rounded-full px-3 py-1.5 font-semibold transition',
                        mode === 'register' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                      )}
                    >
                      Daftar
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-800">Nama (opsional)</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama"
                        disabled={busy}
                        className="w-full rounded-xl2 border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-800">Email</label>
                    <input
                      ref={emailRef}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      type="email"
                      disabled={busy}
                      className={cx(
                        'w-full rounded-xl2 border bg-white px-4 py-3 text-sm outline-none transition',
                        'focus:border-zinc-400',
                        email.length > 0 && !emailLooksValid(email) ? 'border-red-200 bg-red-50/40' : 'border-zinc-200'
                      )}
                    />
                    {email.length > 0 && !emailLooksValid(email) ? (
                      <div className="text-xs text-red-700">Format email kurang tepat.</div>
                    ) : (
                      <div className="text-xs text-zinc-500">&nbsp;</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-800">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-xs text-zinc-600 hover:text-zinc-900"
                        disabled={busy}
                      >
                        {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>

                    <input
                      ref={pwRef}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) =>
                        setCapsLock(
                          // @ts-ignore
                          e.getModifierState ? e.getModifierState('CapsLock') : false
                        )
                      }
                      placeholder={mode === 'login' ? 'Password kamu' : 'Buat password (min 6)'}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      disabled={busy}
                      className={cx(
                        'w-full rounded-xl2 border bg-white px-4 py-3 text-sm outline-none transition',
                        'focus:border-zinc-400',
                        capsLock ? 'border-amber-200' : 'border-zinc-200'
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-zinc-500">
                        {password.length > 0 && password.length < 6 ? 'Minimal 6 karakter.' : ' '}
                      </div>
                      {capsLock && <div className="text-xs text-amber-700">Caps Lock aktif</div>}
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-800">Konfirmasi Password</label>
                      <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Ulangi password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={busy}
                        className={cx(
                          'w-full rounded-xl2 border bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400',
                          confirm.length > 0 && confirm !== password ? 'border-red-200 bg-red-50/40' : 'border-zinc-200'
                        )}
                      />
                      {confirm.length > 0 && confirm !== password ? (
                        <div className="text-xs text-red-700">Belum sama dengan password.</div>
                      ) : (
                        <div className="text-xs text-zinc-500">&nbsp;</div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || busy}
                    className={cx(
                      'relative w-full overflow-hidden rounded-xl2 px-4 py-3 text-sm font-semibold transition active:scale-[0.99]',
                      'bg-zinc-900 text-white hover:bg-zinc-800',
                      'disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {busy && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      )}
                      <span>
                        {mode === 'login'
                          ? busy
                            ? 'Masuk...'
                            : 'Masuk & Sinkron'
                          : busy
                            ? 'Membuat akun...'
                            : 'Daftar & Sinkron'}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition">
                      <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </span>
                  </button>

                  <div className="pt-1 text-center text-xs leading-relaxed text-zinc-500">
                    Data progress, bookmark, dan pengaturan akan disinkronkan ke akun ini.
                  </div>

                  <div className="flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(redirectTo)}
                      className="rounded-full px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition"
                      disabled={busy}
                    >
                      Nanti saja
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
