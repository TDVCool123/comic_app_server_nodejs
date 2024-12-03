import cheerio from 'cheerio';
import { ChapterDetail } from "./chapter_detail.interface";
import { GET,log , BASE_URL } from "../util";

export class Crawler {
  async chapterDetailNew(chapter_link: string): Promise<ChapterDetail> {
    const body = await GET(chapter_link);
    const $ = cheerio.load(body);

    const body_site = $('body.trang-doc');
    
    // Extraer cómic y enlace desde el breadcrumb
    const breadcrumb = body_site.find('div.breadcrumb.breadcrumbs.bred_doc > div.rdfa-breadcrumb > div > p');
    const comicAnchor = breadcrumb.find('span[itemtype="http://data-vocabulary.org/Breadcrumb"]').eq(1); // Segundo enlace contiene el cómic
    const comic_name = $(comicAnchor).find('a > span[itemprop="title"]').text().trim();
    const comic_link = BASE_URL+$(comicAnchor).find('a').attr('href');
    
    // Obtener el contenedor de capítulos
    const optionWrap = body_site.find('div.option_wrap').first();

    // Extraer capítulos
    const chapters = optionWrap.find('select#c_chapter > option').toArray().map(option => {
      const $option = $(option);
      return {
        chapter_name: $option.text().trim(),
        chapter_link: BASE_URL+"/chapter/manga-oj991744/"+$option.attr('value')
      };
    });


    // Extraer enlaces de navegación
    let prev_chapter_link: string = 'lol';
    let next_chapter_link: string = 'lo';

    optionWrap.find('div.btn-navigation-chap > a').toArray().map((a) => {
      const $a = $(a);
      const label = $a.text().replace(/\s+/g, ' ').trim();
      //log(label)
      if (label.startsWith('PREV CHAPTER')){
        prev_chapter_link = BASE_URL+$a.attr('href').trim();
        //log(prev_chapter_link)
      } else if (label.startsWith('NEXT CHAPTER')){
        next_chapter_link = BASE_URL+$a.attr('href').trim();
        //log(next_chapter_link)
      }
    });
    

    // Extraer el nombre del comic y del capítulo actual
    const comic_chapter_name = optionWrap.find('h1.current-chapter').text();

    //const comic_name= comic_chapter_name.replace(': Chapter 17', '').trim();
    const chapter_name= comic_chapter_name.replace('Contender: ', '').trim();

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
