import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { Db } from '../../database/connection.js';
import { signToken } from '../../middlewares/auth.js';
import { userService } from '../user/user.service.js';
import { authRepository } from './auth.repository.js';

export const authService = {
  async register(db: Db, data: { email: string; password: string; name?: string | null }) {
    const email = data.email.trim().toLowerCase();
    const existing = await authRepository.getByEmail(db, email);
    if (existing) throw new Error('Email sudah terdaftar');

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();
    await authRepository.create(db, { id, email, passwordHash, createdAt: now, updatedAt: now });

    await userService.ensure(db, id);
    if (data.name) {
      await userService.setProfile(db, id, { name: data.name });
    }

    const token = signToken({ sub: id, email });
    return { token, user: { id, email } };
  },

  async login(db: Db, data: { email: string; password: string }) {
    const email = data.email.trim().toLowerCase();
    const user = await authRepository.getByEmail(db, email);
    if (!user) throw new Error('Email atau password salah');

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new Error('Email atau password salah');

    const token = signToken({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  },
};
