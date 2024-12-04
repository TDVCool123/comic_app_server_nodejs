"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const util_1 = require("../util");
class Crawler {
    static async searchComic(query, page) {
        const body = await (0, util_1.GET)(`${util_1.BASE_URL}/search/${query}/page/${page}`);
        return (0, util_1.bodyToComicList)(body);
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=search.crawler.js.map