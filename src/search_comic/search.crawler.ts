import { bodyToComicList, GET, BASE_URL, bodyToComicListNew, bodyToComicListSearch,log } from "../util";
import { Comic } from "../models/comic.interface";
import { response } from "express";

export class Crawler {

  static async searchComic(query: string, page: number): Promise<Comic[]> {
    const link= `${BASE_URL}/search/${query}`
    log(link)
    const body = await GET(link);
    log(body)
    const response = bodyToComicListSearch(body);
    log(response)
    return response;
  }
}