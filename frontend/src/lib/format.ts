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
