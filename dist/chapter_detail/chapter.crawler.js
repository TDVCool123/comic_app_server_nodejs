"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const util_1 = require("../util");
class Crawler {
    async chapterDetailNew(chapter_link) {
        const body = await util_1.GET(chapter_link);
        const $ = cheerio_1.default.load(body);
        const body_site = $('body.trang-doc');
        // Extraer cómic y enlace desde el breadcrumb
        const breadcrumb = body_site.find('div.breadcrumb.breadcrumbs.bred_doc > div.rdfa-breadcrumb > div > p');
        const comicAnchor = breadcrumb.find('span[itemtype="http://data-vocabulary.org/Breadcrumb"]').eq(1); // Segundo enlace contiene el cómic
        const comic_name = $(comicAnchor).find('a > span[itemprop="title"]').text().trim();
        const comic_link = util_1.BASE_URL + $(comicAnchor).find('a').attr('href');
        // Obtener el contenedor de capítulos
        const optionWrap = body_site.find('div.option_wrap').first();
        // Extraer capítulos
        const chapters = optionWrap.find('select#c_chapter > option').toArray().map(option => {
            const $option = $(option);
            return {
                chapter_name: $option.text().trim(),
                chapter_link: $option.attr('value')
            };
        });
        // Extraer enlaces de navegación
        let prev_chapter_link = 'lol';
        let next_chapter_link = 'lo';
        optionWrap.find('div.btn-navigation-chap > a').toArray().map((a) => {
            const $a = $(a);
            const label = $a.text().replace(/\s+/g, ' ').trim();
            //log(label)
            if (label.startsWith('PREV CHAPTER')) {
                prev_chapter_link = util_1.BASE_URL + $a.attr('href').trim();
                //log(prev_chapter_link)
            }
            else if (label.startsWith('NEXT CHAPTER')) {
                next_chapter_link = util_1.BASE_URL + $a.attr('href').trim();
                //log(next_chapter_link)
            }
        });
        // Extraer el nombre del comic y del capítulo actual
        const comic_chapter_name = optionWrap.find('h1.current-chapter').text();
        //const comic_name= comic_chapter_name.replace(': Chapter 17', '').trim();
        const chapter_name = comic_chapter_name.replace('Contender: ', '').trim();
        // Extraer imágenes
        const imageContainer = body_site.find('div.vung-doc');
        const images = imageContainer.find('img.img-loading').toArray().map(img => $(img).attr('data-src'));
        return {
            chapter_link,
            chapter_name,
            chapters,
            comic_link,
            comic_name,
            images,
            next_chapter_link,
            prev_chapter_link
        };
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=chapter.crawler.js.map