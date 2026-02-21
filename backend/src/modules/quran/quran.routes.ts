import { Router } from 'express';
import { getChapter, getChapters, getVerse, getPage } from './quran.controller.js';

export const quranRouter = Router();

quranRouter.get('/chapters', getChapters);
quranRouter.get('/verse', getVerse);
quranRouter.get('/chapter', getChapter);

quranRouter.get('/page', getPage);
