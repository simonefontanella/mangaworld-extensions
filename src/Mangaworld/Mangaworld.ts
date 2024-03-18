import {
    TagSection,
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SearchRequest,
    PagedResults,
    Request,
    Response,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    HomePageSectionsProviding,
    SourceInfo,
    ContentRating,
    SourceIntents,
    SearchField,
} from '@paperback/types';

import { Parser } from './MangaworldParser';

const DOMAIN = 'https://www.mangaworld.ac';

export const isLastPage = ($: CheerioStatic): boolean => {
    const lastPage = Number($('ul.pagination > li:last-child > a').attr('href')?.split('-').pop());
    const currentPage = Number($('ul.pagination > li > select > option').find(':selected').text().split(' ')[1]);

    return currentPage >= lastPage;
}
console.log('Run')

export const MangaworldInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Mangaworld',
    icon: 'icon.png',
    author: 'Fonta',
    authorWebsite: 'https://github.com/simonefontanella',
    description: 'Extension that pulls manga from Mangaworld',
    websiteBaseURL: DOMAIN,
    contentRating: ContentRating.MATURE,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

export class Mangaworld implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    constructor(private cheerio: cheerio.CheerioAPI) { }

    manga_name?: String

    // TODO
    getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        throw new Error('Method not implemented.');
    }
    getSearchTags?(): Promise<TagSection[]> {
        throw new Error('Method not implemented.');
    }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...request.headers,
                    'Referer': DOMAIN,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
                return request;
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response;
            }
        }
    });

    getMangaShareUrl(mangaId: string): string {
        return `${DOMAIN}${mangaId}`;
    }

    parser = new Parser();

    private async DOMHTML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });

        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}/manga/${mangaId}`);
        let mangaDetails = this.parser.parseMangaDetails($, mangaId);
        return mangaDetails
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMHTML(`${DOMAIN}/manga/${mangaId}`);
        return this.parser.parseChapters($);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const $ = await this.DOMHTML(`${DOMAIN}/manga/${mangaId}/read/${chapterId}?style=list`);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true;
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;

        const param = encodeURI(`/archive?keyword=${query.title}&page=${page}`);
        const $ = await this.DOMHTML(`${DOMAIN}${param}`);

        const results = this.parser.parseSearchResults($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results,
            metadata
        })

    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('Mangaworld Running...')
        let url: string = `${DOMAIN}/archive?sort=most_read`
        const $ = await this.DOMHTML(url);
        const section = App.createHomeSection({ id: 'most_read', title: 'I più letti', type: HomeSectionType.singleRowLarge, containsMoreItems: false });
        sectionCallback(section);
        const result = this.parser.parseHome($);
        section.items = result;
        sectionCallback(section);
    }
}

// async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
//     let page: number = metadata?.page ?? 1;
//     let url = '';

//     switch (homepageSectionId) {
//         case 'hot':
//             url = `${DOMAIN}ajax/Search/AjaxLoadListManga?key=tatca&orderBy=3&p=${page}`;
//             break;
//         case 'new_updated':
//             url = `${DOMAIN}thumb-${page}`;
//             break;
//         case 'full':
//             url = `${DOMAIN}ajax/Category/AjaxLoadMangaByCategory?id=0&orderBy=5&p=${page}`;
//             break;
//         default:
//             throw new Error(`Invalid home section ID`);
//     }

//     const $ = await this.DOMHTML(url);
//     const results = this.parser.parseViewMoreSection($, homepageSectionId);
//     metadata = isLastPage($) ? undefined : { page: page + 1 };

//     return App.createPagedResults({
//         results,
//         metadata
//     })
// }

// async getSearchTags(): Promise<TagSection[]> {
//     const url = `${DOMAIN}timkiem/nangcao`;
//     const $ = await this.DOMHTML(url);
//     return this.parser.parseTags($);
// }
//}