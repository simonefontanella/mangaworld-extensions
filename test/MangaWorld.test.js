"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaWorld_1 = require("../MangaWorld/MangaWorld");
let wrapper;
let source;
beforeEach(() => {
    wrapper = new paperback_extensions_common_1.APIWrapper();
    source = new MangaWorld_1.MangaWorld(cheerio_1.default);
});
test("getMangaDetails", async () => {
    let result = await wrapper.getMangaDetails(source, "2173/asadora");
    expect(result.titles[0] == "Asadora");
    expect(result.author == "URASAWA Naoki");
    expect(result.status == paperback_extensions_common_1.MangaStatus.ONGOING);
});
test("getChapters", async () => {
    let result = await wrapper.getChapters(source, "2278/berserk");
    expect(result.pop()?.name == "Capitolo 00.01");
    //SO SAD
});
test("getChapterDetails", async () => {
    let result = await wrapper.getChapterDetails(source, "1684/tokyo-revengers", "60c156351c8dbb7cee36bdaf");
    expect(result.id == "60c156351c8dbb7cee36bdaf");
});
test("getSearchResult", async () => {
    let query = { title: "tokyo r" };
    let result = await wrapper.searchRequest(source, query, 1);
    expect(result.results.pop()?.id == "1684/tokyo-revengers");
});
test("getHomePage", async () => {
    let result = await wrapper.getHomePageSections(source);
});
//# sourceMappingURL=MangaWorld.test.js.map