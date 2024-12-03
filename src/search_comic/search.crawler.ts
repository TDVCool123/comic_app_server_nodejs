import { bodyToComicList, GET, BASE_URL } from "../util";
import { Comic } from "../models/comic.interface";

export class Crawler {

  static async searchComic(query: string, page: number): Promise<Comic[]> {
    const body = await GET(`${BASE_URL}/search/${query}/page/${page}`);
    return bodyToComicList(body);
  }
}