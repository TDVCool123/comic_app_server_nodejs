import cheerio from 'cheerio';
import { ComicDetail } from "./comic_detail.interface";
import { GET } from "../util";

export class Crawler {

  async comicDetailNew(link: string): Promise<ComicDetail> {
    const body = await GET(link);
    const $ = cheerio.load(body);

    const content_left = $('div.leftCol');
    const panel_story_info = content_left.find('div.manga-info-top');
    const manga_info_pic = panel_story_info.find('div.manga-info-pic');
    const manga_info_text = panel_story_info.find('div.manga-info-text');

    const thumbnail = manga_info_pic.find('img').attr('src');
    const title = manga_info_text.find('h1').first().text().trim();

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

    manga_info_text.find('table.variations-tableInfo > tbody > tr').toArray().forEach((tr: CheerioElement) => {
      const $tr = $(tr);
      const table_value = $tr.find('td.table-value');

      switch ($tr.find('td.table-label').text()) {
        case 'story-alternative :':
          alternative = table_value.find('h2').text();
          break;
        case 'Author(s) :':
          authors = table_value.find('a').toArray().map((a: CheerioElement) => {
            const $a = $(a);
            return {
              name: $a.text(),
              link: $a.attr('href'),
            };
          });
          break;
        case 'Status :':
          status = table_value.text();
          break;
        case 'Genres :':
          categories = table_value.find('a').toArray().map((a: CheerioElement) => {
            const $a = $(a);
            return {
              name: $a.text(),
              link: $a.attr('href'),
            };
          });
      }
    });

    let last_updated: string | null = null;
    let view: string | null = null;

    manga_info_text.find('div.story-info-right-extent > p').toArray().forEach((p: CheerioElement) => {
      const $p = $(p);
      const stre_value = $p.find('span.stre-value');

      switch ($p.find('span.stre-label').text()) {
        case 'Updated :':
          last_updated = stre_value.text();
          break;
        case 'View :':
          view = stre_value.text();
          break;
      }
    });

    const panel_story_info_description = panel_story_info.find('div.panel-story-info-description').text();
    const shortened_content = panel_story_info_description.substring(panel_story_info_description.indexOf(":") + 2);

    const chapters = content_left.find('div.panel-story-chapter-list > ul.row-content-chapter > li')
      .toArray()
      .map((li: CheerioElement) => {
        const $li = $(li);
        const a = $li.find('a');
        return {
          chapter_name: a.text().trim(),
          chapter_link: a.attr('href'),
          view: $li.find('span.chapter-view').text().trim(),
          time: $li.find('span.chapter-time').text().trim(),
        };
      });

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