import { bodyToComicList, GET, BASE_URL, bodyToComicListNew, bodyToComicListSearch,log } from "../util";
import { Comic } from "../models/comic.interface";
import { response } from "express";

export class Crawler {

  static async searchComic(query: string, page: number): Promise<Comic[]> {
    const link= `${BASE_URL}/search/${query}`
    const body = await GET(link);
    const response = bodyToComicListSearch(body);
    return response;
  }
}