"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const util_1 = require("../util");
class Crawler {
    async comicDetailNew(link) {
        const body = await (0, util_1.GET)(link);
        const $ = cheerio_1.default.load(body);
        const content_left = $('div.leftCol');
        const panel_story_info = content_left.find('div.manga-info-top');
        const manga_info_pic = panel_story_info.find('div.manga-info-pic');
        const manga_info_text = panel_story_info.find('ul.manga-info-text');
        const thumbnail = util_1.BASE_URL + manga_info_pic.find('img').attr('src');
        (0, util_1.log)(thumbnail);
        const title = manga_info_text.children('li').first().find('h1').text().trim();
        (0, util_1.log)(title);
        let authors = null;
        let categories = null;
        let status = null;
        let alternative = null;
        let last_updated = null;
        let view = null;
        manga_info_text.find('li').each((_, li) => {
            const $li = $(li);
            const label = $li.text().trim();
            if (label.startsWith('Author(s) :')) {
                authors = $li.find('a').toArray().map((a) => ({
                    name: $(a).text().trim(),
                    link: util_1.BASE_URL + $(a).attr('href'),
                }));
            }
            else if (label.startsWith('Status :')) {
                status = $li.text().replace('Status :', '').trim();
            }
            else if (label.startsWith('View :')) {
                view = $li.text().replace('View :', '').trim();
            }
            else if (label.startsWith('Last updated :')) {
                last_updated = $li.text().replace('Last updated :', '').trim();
            }
            else if (label.startsWith('Genres :')) {
                categories = $li.find('a').toArray().map((a) => ({
                    name: $(a).text().trim(),
                    link: util_1.BASE_URL + $(a).attr('href'),
                }));
            }
            else if ($li.find('h2.story-alternative').length) {
                alternative = $li.find('h2.story-alternative').text().trim();
            }
        });
        const shortened_content = content_left.find('div#noidungm').text().trim() /*.replace()*/;
        (0, util_1.log)(shortened_content);
        //const  = panel_story_info_description.substring(panel_story_info_description.indexOf(":") + 2);
        const chapters = $('div#chapter > div.manga-info-chapter > div.chapter-list > div.row')
            .toArray()
            .map((div) => {
            const $div = $(div);
            const chapter_title = $div.find('span > a').text().trim();
            const chapter_link = util_1.BASE_URL + $div.find('span > a').attr('href');
            const chapter_view = $div.find('span:nth-child(2)').text().trim();
            const chapter_time = $div.find('span:nth-child(3)').text().trim();
            return {
                chapter_name: chapter_title,
                chapter_link: chapter_link,
                view: chapter_view,
                time: chapter_time,
            };
        });
        console.log(chapters);
        return {
            authors: authors !== null && authors !== void 0 ? authors : [],
            categories: categories !== null && categories !== void 0 ? categories : [],
            last_updated: last_updated !== null && last_updated !== void 0 ? last_updated : '',
            chapters,
            related_comics: [],
            link,
            shortened_content,
            thumbnail,
            title,
            view: view !== null && view !== void 0 ? view : '',
            status,
            alternative,
        };
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=detail.crawler.js.map