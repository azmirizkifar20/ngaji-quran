export function asBool(v: unknown, fallback = false) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return fallback;
}
