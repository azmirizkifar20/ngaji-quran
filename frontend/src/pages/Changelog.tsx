import Card from '../components/Card';
import { Link } from 'react-router-dom';

type Entry = {
  version: string;
  date: string;
  type: 'Bug Fixes' | 'New Features';
  title: string;
  detail: string;
};

const entries: Entry[] = [
  {
    version: 'v1.0.0',
    date: 'Feb 27, 2026',
    type: 'Bug Fixes',
    title: 'Hitungan halaman harian kini akurat saat hari berganti.',
    detail: 'Sebelumnya, hari baru hanya tercatat 1 halaman meski membaca lebih dari 1 halaman. Sekarang progres harian dihitung sesuai rentang halaman yang dibaca di hari tersebut.',
  },
];

const typeStyles: Record<Entry['type'], { dot: string; label: string; link: string }> = {
  'Bug Fixes': {
    dot: 'bg-red-500',
    label: 'text-red-600',
    link: 'text-red-600',
  },
  'New Features': {
    dot: 'bg-emerald-500',
    label: 'text-emerald-600',
    link: 'text-emerald-600',
  },
};

export default function Changelog() {
  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Changelog</div>
          <div className="mt-2 max-w-xl text-sm text-zinc-500">
            Catatan rilis untuk Apps Ngaji Quran
          </div>
        </div>
        <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Kembali
        </Link>
      </div>

      <div className="space-y-5">
        {entries.map((entry) => {
          const styles = typeStyles[entry.type];
          return (
            <div key={entry.version} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">{entry.date}</span>
                  <span className="mx-2">•</span>
                  <span className={`font-semibold ${styles.label}`}>{entry.type}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-400">{entry.version}</div>
              </div>

              <div className="mt-2 text-base font-semibold text-zinc-900">{entry.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-600">{entry.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
