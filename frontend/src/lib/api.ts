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

export type VersesListPayload = {
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
  name?: string | null;
  lastVerseKey: string;
  lastPageNumber: number;
  totalPages: number;
  targetDays: number;
  startDate: string;
  streak: number;
  lastCheckInDate?: string | null;
  xp: number;
};

export type LeaderboardRow = {
  id: string;
  name: string | null;
  streak: number;
  xp: number;
  lastPageNumber: number;
  updatedAt: string;
};

function getUserId(): string {
  const key = 'ngaji_user_id';
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem(key, v);
  }
  return v;
}

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = getUserId();
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { 'content-type': 'application/json', 'x-user-id': userId, ...(init?.headers || {}) },
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
  byChapter: (chapterNumber: number) => j<VersesListPayload>(`/api/quran/chapter?chapterNumber=${chapterNumber}`),
  byPage: (pageNumber: number) => j<VersesListPayload>(`/api/quran/page?pageNumber=${pageNumber}`),

  getState: () => j<{state:UserState}>(`/api/user/state`),
  setProfile: (data: {name: string | null}) =>
    j<{state:UserState}>(`/api/user/profile`, { method:'POST', body: JSON.stringify(data) }),
  setProgress: (data: {lastVerseKey:string; lastPageNumber:number}) =>
    j<{state:UserState}>(`/api/user/progress`, { method:'POST', body: JSON.stringify(data) }),
  setGoals: (data: {targetDays:number; startDate?:string}) =>
    j<{state:UserState}>(`/api/user/goals`, { method:'POST', body: JSON.stringify(data) }),
  checkIn: () => j<{state:UserState}>(`/api/user/checkin`, { method:'POST', body: '{}' }),

  leaderboard: (limit = 20) => j<{leaderboard: LeaderboardRow[]}>(`/api/leaderboard?limit=${limit}`),
};
