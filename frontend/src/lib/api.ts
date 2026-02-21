const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type Chapter = {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
};

export type VersePayload = {
  verse: {
    verse_key: string;
    text_uthmani: string;
    page_number: number;
    juz_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
  }
};

export type ByChapterPayload = {
  verses: Array<{
    verse_key: string;
    text_uthmani: string;
    page_number: number;
    juz_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
  }>;
  pagination?: any;
};

export type UserState = {
  id: string;
  lastVerseKey: string;
  lastPageNumber: number;
  totalPages: number;
  targetDays: number;
  startDate: string;
  streak: number;
  lastCheckInDate?: string | null;
  xp: number;
};

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  health: () => j<{ok:boolean}>(`/api/health`),
  chapters: () => j<{chapters: Chapter[]}>(`/api/quran/chapters`),
  verse: (key: string) => j<VersePayload>(`/api/quran/verse?key=${encodeURIComponent(key)}&words=false`),
  byChapter: (chapterNumber: number) => j<ByChapterPayload>(`/api/quran/chapter?chapterNumber=${chapterNumber}`),

  getState: () => j<{state:UserState}>(`/api/user/state`),
  setProgress: (data: {lastVerseKey:string; lastPageNumber:number}) =>
    j<{state:UserState}>(`/api/user/progress`, { method:'POST', body: JSON.stringify(data) }),
  setGoals: (data: {targetDays:number; startDate?:string}) =>
    j<{state:UserState}>(`/api/user/goals`, { method:'POST', body: JSON.stringify(data) }),
  checkIn: () => j<{state:UserState}>(`/api/user/checkin`, { method:'POST', body: '{}' }),
};
