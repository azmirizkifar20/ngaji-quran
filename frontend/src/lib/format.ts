export function clamp(n:number, min:number, max:number){ return Math.max(min, Math.min(max, n)); }

export function pagesLeft(total:number, current:number){
  return Math.max(0, total - current);
}

export function pagesPerDay(total:number, current:number, targetDays:number){
  const left = pagesLeft(total, current);
  if (targetDays <= 0) return left;
  return Math.max(1, Math.ceil(left / targetDays));
}

export function prettyDate(d: string | Date){
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('id-ID', { dateStyle:'medium' }).format(date);
}

export function remainingDaysFromStart(startDate: string, targetDays: number) {
  if (!startDate || targetDays <= 0) return targetDays;
  const start = new Date(startDate);
  const today = new Date();
  const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const elapsed = Math.floor((todayUTC - startUTC) / (24 * 3600 * 1000));
  const remaining = Math.max(1, targetDays - elapsed);
  return remaining;
}

export function pagesPerDayRemaining(total: number, current: number, startDate: string, targetDays: number) {
  const remainingDays = remainingDaysFromStart(startDate, targetDays);
  return pagesPerDay(total, current, remainingDays);
}
