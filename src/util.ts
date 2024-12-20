import { Comic } from "./models/comic.interface";

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`NODEJS running: env = '${env}'`);

if (env === 'development') {
  process.env['DEBUG'] = 'comic-app-server:server';
}

import debug from 'debug';
import request, { Response } from 'request';
import cheerio from "cheerio";

const log = debug('comic-app-server:server');

/**
 *
 */

function isValidURL(str: string): boolean {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

function escapeHTML(s: string) {
  return s.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '');
}

/**
 *
 */

const escapeRegExp = (str: string) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
const chars = '.$[]#/%'.split('');
const charCodes = chars.map((c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const charToCode: { [key: string]: string } = {};
const codeToChar: { [key: string]: string } = {};
chars.forEach((c, i) => {
  charToCode[c] = charCodes[i];
  codeToChar[charCodes[i]] = c;
});
const charsRegex = new RegExp(`[${escapeRegExp(chars.join(''))}]`, 'g');
const charCodesRegex = new RegExp(charCodes.join('|'), 'g');

const encode = (str: string) => str.replace(charsRegex, (match) => charToCode[match]);
const decode = (str: string) => str.replace(charCodesRegex, (match) => codeToChar[match]);

/**
 * GET body from url
 * @param url string
 * @returns a Promise resolve body response
 */
function GET(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    request.get(
      url,
      { timeout: 15_000 },
      (error: any, _response: Response, body: any): void => {
        if (error) {
          reject(error);
          return;
        }
        resolve(body);
      },
    );
  });
}

/**
 * Parse body to list of comics
 * @param body string
 * @return a list of comics
 * @deprecated
 */
function bodyToComicList(body: string): Comic[] {
  const $ = cheerio.load(body);

  return $('div.content_left div.content_grid > ul > li.content_grid_item')
    .toArray()
    .map((liComic): Comic => {
      const $liComic = $(liComic);
      const title = $liComic.find('div.content_grid_item_name > a').text();

      const contentGridItemImg = $liComic.find('div.content_grid_item_img');
      const view = contentGridItemImg.find('div.view').text().trim();
      const link = contentGridItemImg.find('a').attr('href');
      const thumbnail = contentGridItemImg.find('a > img').first().attr('src');

      const last_chapters = $liComic.find('div.content_grid_item_chapter > ul > li')
        .toArray()
        .map(liChapter => {
          const $liChapter = $(liChapter);

          const chapter_name = $liChapter.find('a').text();
          const chapter_link = $liChapter.find('a').attr('href');
          const time = $liChapter.find('i').text();

          return {
            chapter_name,
            chapter_link,
            time,
          };
        });

      return {
        title,
        view,
        link,
        thumbnail,
        last_chapters,
      };
    });
}

function bodyToComicListNew(body: string): Comic[] {
  const $: CheerioStatic = cheerio.load(body);

  return $('div.container > div.main-wrapper > div.leftCol.listCol > div.truyen-list > div.list-truyen-item-wrap')
    .toArray()
    .map((divComic: CheerioElement): Comic | null => {
      const $divComic: Cheerio = $(divComic);

      const $genres_item_chap = $divComic.find('a.list-story-item-wrap-chapter');
      const chapter_link = $genres_item_chap.attr('href');
      const chapter_name = $genres_item_chap.text();

      const thumbnail = $divComic.find('a > img.img-loading').attr('data-src');

      const a = $divComic.find('h3 > a');
      const link = a.attr('href');
      const title = a.text();

      return link && thumbnail && title
        ? ({
          last_chapters: chapter_link && chapter_name
            ? [
              {
                chapter_name,
                chapter_link: BASE_URL + chapter_link,
                time: '',
              },
            ]
            : [],
          link: BASE_URL + link,
          thumbnail: BASE_URL + thumbnail,
          title,
          view: $divComic.find('span.aye_icon').text(),
        })
        : null;
    })
    .filter((c: Comic | null): c is Comic => c !== null);
}


function bodyToComicListSearch(body: string): Comic[] {
  const $: CheerioStatic = cheerio.load(body);

  return $('div.container > div.main-wrapper > div.leftCol > div.daily-update > div.panel_story_list > div.story_item')
    .toArray()
    .map((divComic: CheerioElement): Comic | null => {
      const $divComic: Cheerio = $(divComic);

      const $item_rigth = $divComic.find('div.story_item_right');

      // Seleccionar todos los capítulos (story_chapter)
      const last_chapters = $item_rigth
        .find("em.story_chapter > a")
        .toArray()
        .map((chapter: CheerioElement) => {
          const $chapter = $(chapter);
          const chapter_link = $chapter.attr('href');
          const chapter_name = $chapter.text();
          return chapter_link && chapter_name
            ? {
                chapter_name,
                chapter_link: BASE_URL + chapter_link,
                time: ' ', // Puedes agregar lógica para extraer el tiempo si está disponible.
              }
            : null;
        })
        .filter((chapter): chapter is { chapter_name: string; chapter_link: string; time: string } => chapter !== null);

      const thumbnail = $divComic.find('a > img').attr('src');

      const a = $divComic.find('h3 > a');
      const link = a.attr('href');
      const title = a.text();
      const view = $item_rigth.find('span:contains("View")').text().replace('View : ', '').trim();

      return link && thumbnail && title
        ? ({
          last_chapters,
          link: BASE_URL + link,
          thumbnail:  thumbnail,
          title,
          view
,
        })
        : null;
    })
    .filter((c: Comic | null): c is Comic => c !== null);
}

export const BASE_URL = 'https://ww8.mangakakalot.tv';

export { isValidURL, log, escapeHTML, encode, decode, GET, bodyToComicList, bodyToComicListNew, bodyToComicListSearch};