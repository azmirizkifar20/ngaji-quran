import { api, getAuthToken, SyncPayload } from './api';

const SYNC_UPDATED_KEY = 'ngaji_sync_updated_at';

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getLocalSyncPayload(): SyncPayload {
  return {
    bookmarks: readJson('ngaji_bookmarks_v1', []),
    savedPages: readJson('ngaji_saved_pages_v1', {}),
    pageMeta: readJson('ngaji_page_meta_v1', {}),
  };
}

export function applySyncPayload(data: SyncPayload) {
  localStorage.setItem('ngaji_bookmarks_v1', JSON.stringify(data.bookmarks || []));
  localStorage.setItem('ngaji_saved_pages_v1', JSON.stringify(data.savedPages || {}));
  localStorage.setItem('ngaji_page_meta_v1', JSON.stringify(data.pageMeta || {}));
}

export function getLocalSyncUpdatedAt(): string | null {
  return localStorage.getItem(SYNC_UPDATED_KEY);
}

export function setLocalSyncUpdatedAt(value: string) {
  localStorage.setItem(SYNC_UPDATED_KEY, value);
}

export async function pushSyncIfAuthed() {
  if (!api || !api.syncSet) return;
  if (!getAuthToken()) return;
  const payload = getLocalSyncPayload();
  const res = await api.syncSet(payload);
  setLocalSyncUpdatedAt(res.updatedAt);
}

export async function pullSyncIfAuthed() {
  if (!api || !api.syncGet) return;
  if (!getAuthToken()) return;
  const res = await api.syncGet();
  const localUpdated = getLocalSyncUpdatedAt();
  if (!res.data) {
    await pushSyncIfAuthed();
    return;
  }

  if (localUpdated && res.updatedAt) {
    const localTime = new Date(localUpdated).getTime();
    const serverTime = new Date(res.updatedAt).getTime();
    if (localTime > serverTime) {
      await pushSyncIfAuthed();
      return;
    }
  }

  applySyncPayload(res.data);
  if (res.updatedAt) setLocalSyncUpdatedAt(res.updatedAt);
}

export async function pullSyncOnlyIfAuthed() {
  if (!api || !api.syncGet) return;
  if (!getAuthToken()) return;
  const res = await api.syncGet();
  if (!res.data) return;
  applySyncPayload(res.data);
  if (res.updatedAt) setLocalSyncUpdatedAt(res.updatedAt);
}
