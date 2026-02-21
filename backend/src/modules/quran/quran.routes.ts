import { Router } from 'express';
import { getChapter, getChapters, getVerse } from './quran.controller';

export const quranRouter = Router();

quranRouter.get('/chapters', getChapters);
quranRouter.get('/verse', getVerse);
quranRouter.get('/chapter', getChapter);
