import cheerio from 'cheerio';
import { ComicDetail } from "./comic_detail.interface";
import { GET, log } from "../util";

export class Crawler {

  async comicDetailNew(link: string): Promise<ComicDetail> {
    const body = await GET(link);
    const $ = cheerio.load(body);

    const content_left = $('div.leftCol');
    const panel_story_info = content_left.find('div.manga-info-top');
    const manga_info_pic = panel_story_info.find('div.asd-info-pic');
    const manga_info_text = panel_story_info.find('ul.manga-info-text');

    const thumbnail = manga_info_pic.find('img').attr('src');
    log(thumbnail)
    const title = manga_info_text.children('li').first().find('h1').text().trim();
    log(title)

    let authors: {
      readonly name: string;
      readonly link: string
    }[] | null = null;

    let categories: {
      readonly name: string;
      readonly link: string
    }[] | null = null;

    let status: string | null = null;
    let alternative: string | null = null;
    let last_updated: string | null = null;
    let view: string | null = null;

    manga_info_text.find('li').each((_, li) => {
      const $li = $(li);
      const label = $li.text().trim();

      if (label.startsWith('Author(s) :')) {
          authors = $li.find('a').toArray().map((a) => ({
              name: $(a).text().trim(),
              link: $(a).attr('href')!,
          }));
      } else if (label.startsWith('Status :')) {
          status = $li.text().replace('Status :', '').trim();
      }else if (label.startsWith('View :')) {
        view = $li.text().replace('View :', '').trim();
      }else if (label.startsWith('Last updated :')) {
        last_updated = $li.text().replace('Last updated :', '').trim();
      }else if (label.startsWith('Genres :')) {
          categories = $li.find('a').toArray().map((a) => ({
              name: $(a).text().trim(),
              link: $(a).attr('href')!,
          }));
      } else if ($li.find('h2.story-alternative').length) {
          alternative = $li.find('h2.story-alternative').text().trim();
      }
    });



    const shortened_content =content_left.find('div#noidungm').text().trim()/*.replace()*/;
    log(shortened_content)

    //const  = panel_story_info_description.substring(panel_story_info_description.indexOf(":") + 2);

    const chapters = $('div#chapter > div.manga-info-chapter > div.chapter-list > div.row')
      .toArray()
      .map((div) => {
        const $div = $(div);
        const chapter_title = $div.find('span > a').text().trim();
        const chapter_link = $div.find('span > a').attr('href') ?? null;
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
      authors: authors ?? [],
      categories: categories ?? [],
      last_updated: last_updated ?? '',
      chapters,
      related_comics: [],
      link,
      shortened_content,
      thumbnail,
      title,
      view: view ?? '',
      status,
      alternative,
    };
  }
}