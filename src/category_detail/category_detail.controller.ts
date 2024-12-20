import { RequestHandler } from "express";
import { Crawler } from "./category_detail.crawler";
import { Error } from "../models/error";
import { log, isValidURL } from "../util";


export class Controller {
  getCategoryDetail: RequestHandler = async (req, res) => {
    try {
      const { link, type = 'latest', category = 'All', state = 'all'} = req.query;
      link
    log({ link });

      // check link is valid?
      if (!link) {
        return res
          .status(422)
          .json({
            message: "Require 'category link' to get category detail",
            status_code: 422
          } as Error);
      }
      if (typeof link !== 'string' || !isValidURL(link)) {
        return res
          .status(422)
          .json({
            message: "Invalid 'category link' to get category detail",
            status_code: 422
          } as Error);
      }

       // Build the updated URL if parameters are provided
    const categoryLink = `${link}/?type=${type}&category=${category}&state=${state}`;
    log({ categoryLink });

    const comics = await Crawler.getComics(categoryLink, parseInt(req.query.page));
      res.status(200).json(comics);
    } catch (e) {
      log(e);
      const error: Error = {
        message: 'Internal server error',
        status_code: 500
      };
      res.status(500).json(error);
    }
  }

  getPopulars: RequestHandler = async (req, res) => {
    try {
      const { link } = req.query;
      log({ link });

      // check link is valid?
      if (!link) {
        return res
          .status(422)
          .json({
            message: "Require 'category link' to get category detail",
            status_code: 422
          } as Error);
      }
      if (typeof link !== 'string' || !isValidURL(link)) {
        return res
          .status(422)
          .json({
            message: "Invalid 'category link' to get category detail",
            status_code: 422
          } as Error);
      }

      const comics = await Crawler.getPopularComics(link);
      res.status(200).json(comics);
    } catch (e) {
      log(e);
      const error: Error = {
        message: 'Internal server error',
        status_code: 500
      };
      res.status(500).json(error);
    }
  }
}