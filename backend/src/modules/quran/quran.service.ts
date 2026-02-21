import NodeCache from 'node-cache';
import { getEnv } from '../../config/env';

const env = getEnv();
const cache = new NodeCache({ stdTTL: env.CACHE_TTL_SECONDS, checkperiod: 120 });

async function cachedFetchJson(url: string) {
  const hit = cache.get(url);
  if (hit) return hit;

  const resp = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'ngaji-quran/1.0',
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upstream error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  cache.set(url, data);
  return data;
}

export const quranService = {
  async chapters() {
    const url = `${env.QURAN_COM_BASE_URL}/chapters?language=id`;
    return cachedFetchJson(url);
  },

  async verseByKey(key: string, words: boolean) {
    const url = new URL(`${env.QURAN_COM_BASE_URL}/verses/by_key/${key}`);
    url.searchParams.set('language', 'id');
    url.searchParams.set('words', String(words));
    url.searchParams.set('word_fields', 'text_uthmani,code_v2');
    url.searchParams.set(
      'fields',
      'text_uthmani,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number'
    );
    return cachedFetchJson(url.toString());
  },

  async versesByChapter(chapterNumber: number) {
    const url = new URL(`${env.QURAN_COM_BASE_URL}/verses/by_chapter/${chapterNumber}`);
    url.searchParams.set('language', 'id');
    url.searchParams.set('per_page', '300');
    url.searchParams.set('page', '1');
    url.searchParams.set(
      'fields',
      'text_uthmani,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number'
    );
    return cachedFetchJson(url.toString());
  },


  async versesByPage(pageNumber: number) {
    const url = new URL(`${env.QURAN_COM_BASE_URL}/verses/by_page/${pageNumber}`);
    url.searchParams.set('language', 'id');
    url.searchParams.set('per_page', '300');
    url.searchParams.set('page', '1');
    url.searchParams.set('words', 'true');
    url.searchParams.set('word_fields', 'text_uthmani,code_v2,line_number,position');
    url.searchParams.set(
      'fields',
      'text_uthmani,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number'
    );
    return cachedFetchJson(url.toString());
  },
};
