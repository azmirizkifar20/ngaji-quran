import type { RequestHandler } from 'express';
import { z } from 'zod';
import { quranService } from './quran.service';

export const getChapters: RequestHandler = async (_req, res, next) => {
  try {
    const data = await quranService.chapters();
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const getVerse: RequestHandler = async (req, res, next) => {
  try {
    const key = z.string().regex(/^\d+:\d+$/).parse(req.query.key);
    const words = z.coerce.boolean().default(false).parse(req.query.words);
    const data = await quranService.verseByKey(key, words);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const getChapter: RequestHandler = async (req, res, next) => {
  try {
    const chapterNumber = z.coerce.number().int().min(1).max(114).parse(req.query.chapterNumber);
    const data = await quranService.versesByChapter(chapterNumber);
    res.json(data);
  } catch (e) {
    next(e);
  }
};


export const getPage: RequestHandler = async (req, res, next) => {
  try {
    const pageNumber = z.coerce.number().int().min(1).max(604).parse(req.query.pageNumber);
    const data = await quranService.versesByPage(pageNumber);
    res.json(data);
  } catch (e) {
    next(e);
  }
};
