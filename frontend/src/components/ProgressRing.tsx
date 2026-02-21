export default function ProgressRing({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-12 w-12 place-items-center rounded-full border border-zinc-200"
        style={{
          background: `conic-gradient(#111827 ${pct}%, #f4f4f5 0)`
        }}
        aria-label={label}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-semibold">
          {Math.round(pct)}%
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-zinc-500">Progress khatam</div>
      </div>
    </div>
  );
}
