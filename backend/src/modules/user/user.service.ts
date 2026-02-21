import type { Db } from '../../database/connection';
import { userRepository } from './user.repository';

function toISODateUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const userService = {
  async getState(db: Db) {
    return userRepository.get(db);
  },

  async setProgress(db: Db, data: { lastVerseKey: string; lastPageNumber: number }) {
    const now = new Date().toISOString();
    return userRepository.update(db, { ...data, updatedAt: now });
  },

  async setGoals(db: Db, data: { targetDays: number; startDate?: string }) {
    const now = new Date().toISOString();
    const startDate = data.startDate ?? now;
    return userRepository.update(db, { targetDays: data.targetDays, startDate, updatedAt: now });
  },

  async checkIn(db: Db) {
    const state = await userRepository.get(db);
    const today = toISODateUTC(new Date());
    const last = state.lastCheckInDate;

    let streak = state.streak;
    let xp = state.xp;

    if (!last) {
      streak = 1;
      xp += 10;
    } else if (last === today) {
      // already checked in
    } else {
      const lastDate = new Date(last + 'T00:00:00Z');
      const todayDate = new Date(today + 'T00:00:00Z');
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (24 * 3600 * 1000));

      if (diffDays === 1) {
        streak += 1;
        xp += 10 + Math.min(50, streak);
      } else {
        streak = 1;
        xp += 10;
      }
    }

    const now = new Date().toISOString();
    return userRepository.update(db, { streak, xp, lastCheckInDate: today, updatedAt: now });
  },
};
