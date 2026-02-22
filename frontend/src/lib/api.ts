const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type Chapter = {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
};

export type Word = {
  code_v2?: string;          // mushaf glyph (HTML entity string)
  line_number?: number;      // 1..15
  position?: number;         // order inside verse
  char_type_name?: string;   // "word" | "end" etc
};

export type Verse = {
  verse_key: string;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  words?: Word[];
};

export type VersePayload = { verse: Verse };

export type VersesListPayload = {
  verses: Verse[];
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
};

export type LeaderboardRow = {
  id: string;
  name: string | null;
  streak: number;
  lastPageNumber: number;
  updatedAt: string;
};

function getUserId(): string {
  const key = 'ngaji_user_id';
  const v = localStorage.getItem(key);
  if (v) return v;

  const newId = (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
  localStorage.setItem(key, newId);
  return newId;
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
  health: () => j<{ ok: boolean }>(`/api/health`),
  chapters: () => j<{ chapters: Chapter[] }>(`/api/quran/chapters`),

  // used for jump surah:ayah -> page mapping
  verse: (key: string) => j<VersePayload>(`/api/quran/verse?key=${encodeURIComponent(key)}&words=false`),

  // true mushaf page mode (words=true by default)
  byPage: (pageNumber: number) => j<VersesListPayload>(`/api/quran/page?pageNumber=${pageNumber}&words=true`),

  getState: () => j<{ state: UserState }>(`/api/user/state`),
  setProfile: (data: { name: string | null }) =>
    j<{ state: UserState }>(`/api/user/profile`, { method: 'POST', body: JSON.stringify(data) }),
  setProgress: (data: { lastVerseKey: string; lastPageNumber: number }) =>
    j<{ state: UserState }>(`/api/user/progress`, { method: 'POST', body: JSON.stringify(data) }),
  setGoals: (data: { targetDays: number; startDate?: string }) =>
    j<{ state: UserState }>(`/api/user/goals`, { method: 'POST', body: JSON.stringify(data) }),
  reset: () => j<{ state: UserState }>(`/api/user/reset`, { method: 'POST', body: '{}' }),

  leaderboard: (limit = 20) => j<{ leaderboard: LeaderboardRow[] }>(`/api/leaderboard?limit=${limit}`),
};
