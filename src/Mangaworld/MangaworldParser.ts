import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types'

const entities = require('entities');

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const titles: string[] = []

        const title = $(".name.bigger").text().trim();
        titles.push(title)
        const image = $("img.rounded").attr("src") || "";
        const author = $('span.font-weight-bold:contains("Autore: ")').next().text()
        const artist = $('span.font-weight-bold:contains("Artista: ")').next().text()
        const desc = $("div#noidungm").text().trim();
        const status = $('span.font-weight-bold:contains("Stato: ")').first().next().text().trim().toLowerCase().replace(/\s/g, "");
        const tags: Tag[] = []
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: titles,
                author,
                artist,
                image,
                covers: [image],
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: tags })]
            })
        })
    }

    parseChapters($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];
        let sortingIndex = 0
        var chapNum = $('.chapter').length;
        $('.chapter').map((i, chapter) => {
            // const time_raw = $('.publishedDate', obj).text().trim();
            const time = new Date($(".chap-date", chapter).text().trim())
            const title = $("span", chapter).text().trim();
            let id = $("a.chap", chapter).attr("href");
            id = (id?.split('/'))?.pop();


            chapters.push(App.createChapter({
                id,
                chapNum,
                name: title,
                time,
                langCode: "it",
                sortingIndex: sortingIndex
            }));
            chapNum--;
            sortingIndex--;
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        for (const obj of $('.col-12.text-center.position-relative').find("img").toArray()) {
            let image = $(obj).attr("src") ?? "";
            pages.push(image);
        }

        // $('#content > img').each((_: any, obj: any) => {
        //     if (!obj.attribs['src']) return;
        //     const link = obj.attribs['src'];
        //     pages.push(link);
        // });

        return pages;
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const results: PartialSourceManga[] = [];
        for (let obj of $('div.entry').toArray()) {
            let id_arr = $('a.thumb.position-relative', $(obj)).attr('href')?.split('/').slice(-2);
            let id = (id_arr?.join())?.replace(',', '/');
            let title = $('a.thumb.position-relative', $(obj)).attr('title');
            let image = $('img', $(obj)).attr('src');
            results.push(App.createPartialSourceManga({
                mangaId: id || "",
                title: title || "",
                image: image || ""
            }))
            console.log(`id: ${id}`);
            console.log(`title: ${title}`);
            console.log(`image: ${image}`);

        }
        return results;
        // $('p:not(:first-child)', '.list').each((_: any, obj: any) => {
        //     const title = this.decodeHTMLEntity($('a', obj).text().trim());
        //     const subtitle = 'Chương ' + this.decodeHTMLEntity($('span:nth-child(2)', obj).text().trim());
        //     const image = $('img', $(obj).next()).attr('src') || "https://i.imgur.com/GYUxEX8.png";
        //     const mangaId = String($('a', obj).attr('href'));
        //     if (!mangaId || !title) return;

        //     results.push(App.createPartialSourceManga({
        //         mangaId,
        //         image,
        //         title,
        //         subtitle
        //     }))
        // });

        // return results;
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('a', '#storyPinked').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('p:first-child', $(obj).next()).text().trim());
            const mangaId = String($(obj).attr('href'));
            const image = $('img', obj).attr('src')?.replace('300x300', '500x') || "https://i.imgur.com/GYUxEX8.png";
            const subtitle = this.decodeHTMLEntity($('p:last-child', $(obj).next()).text().trim());
            if (!mangaId || !title) return;

            featuredItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }))
        });

        return featuredItems;
    }

    parseAjaxSection($: CheerioStatic): PartialSourceManga[] {
        const ajaxItems: PartialSourceManga[] = [];

        $('p:not(:first-child)', '.list').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('a', obj).text().trim());
            const subtitle = 'Chương ' + this.decodeHTMLEntity($('span:nth-child(2)', obj).text().trim());
            const image = $('img', $(obj).next()).attr('src') || "https://i.imgur.com/GYUxEX8.png";
            const mangaId = String($('a', obj).attr('href'));
            if (!mangaId || !title) return;

            ajaxItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return ajaxItems;
    }

    parseNewUpdatedSection($: CheerioStatic): PartialSourceManga[] {
        const newUpdatedItems: PartialSourceManga[] = [];

        $('.row', '.list-mainpage .storyitem').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity(String($('h3.title > a', obj).attr('title')).trim());
            const subtitle = this.decodeHTMLEntity($('div:nth-child(2) > div:nth-child(4) > span:nth-child(1) > .color-red', obj).text());
            const image = String($('div:nth-child(1) > a > img', obj).attr('src'));
            const mangaId = $('div:nth-child(1) > a', obj).attr('href') ?? title;
            if (!mangaId || !title) return;

            newUpdatedItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return newUpdatedItems;
    }

    parseViewMoreSection($: CheerioStatic, homepageSectionId: any): PartialSourceManga[] {
        switch (homepageSectionId) {
            case 'featured':
                return this.parseFeaturedSection($);
            case 'hot':
                return this.parseAjaxSection($);
            case 'new_updated':
                return this.parseNewUpdatedSection($);
            default:
                return [];
        }
    }

    parseHome($: CheerioStatic): PartialSourceManga[] {
        return this.parseSearchResults($)
    }

    parseTags($: CheerioStatic): TagSection[] {
        const arrayTags: Tag[] = [];
        const arrayTags2: Tag[] = [];

        // The loai
        for (const tag of $('li', '.list-unstyled.row').toArray()) {
            const label = this.decodeHTMLEntity($(tag).text().trim());
            const id = $(tag).attr('data-id') ?? label;
            if (!id || !label) continue;
            arrayTags.push({ id: id, label: label });
        }

        // Tinh trang
        for (const tag of $('option', '#Status').toArray()) {
            const label = this.decodeHTMLEntity($(tag).text().trim());
            let id: string;
            switch (label) {
                case 'Sao cũng được':
                    id = 'anything' + $(tag).attr('value') ?? label;
                    break;
                case 'Đang tiến hành':
                    id = 'ongoing' + $(tag).attr('value') ?? label;
                    break;
                case 'Đã hoàn thành':
                    id = 'completed' + $(tag).attr('value') ?? label;
                    break;
                case 'Tạm ngưng':
                    id = 'drop' + $(tag).attr('value') ?? label;
                    break;
                default:
                    id = $(tag).attr('value') ?? label;
            }
            if (!id || !label) continue;
            arrayTags2.push({ id: id, label: label });
        }

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể loại (Chọn nhiều)', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Tình trạng (Chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
        ];

        return tagSections;
    }

    private decodeHTMLEntity = (str: string): string => {
        return entities.decodeHTML(str);
    };

    private convert_time = (timeAgo: string): Date => {
        const [D, H] = timeAgo.split(' ');
        const fixD = String(D).split('/');
        const finalD = `${fixD[1]}/${fixD[0]}/${fixD[2]}`;
        return new Date(`${finalD} ${H}`)
    }
}