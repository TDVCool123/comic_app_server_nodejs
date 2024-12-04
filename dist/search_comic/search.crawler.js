"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const util_1 = require("../util");
class Crawler {
    static async searchComic(query, page) {
        const link = `${util_1.BASE_URL}/search/${query}`;
        util_1.log(link);
        const body = await util_1.GET(link);
        util_1.log(body);
        const response = util_1.bodyToComicListSearch(body);
        util_1.log(response);
        return response;
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=search.crawler.js.map