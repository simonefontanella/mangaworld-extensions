import cheerio from "cheerio";
import { APIWrapper, MangaStatus, SearchRequest } from "paperback-extensions-common";
import { MangaWorld } from "../MangaWorld/MangaWorld";
let wrapper: APIWrapper;
let source: MangaWorld;

beforeEach(() => {
  wrapper = new APIWrapper();
  source = new MangaWorld(cheerio);
});

test("getMangaDetails", async () => {
  let result = await wrapper.getMangaDetails(source, "2173/asadora");
  expect(result.titles[0] == "Asadora");
  expect(result.author == "URASAWA Naoki");
  expect(result.status == MangaStatus.ONGOING);
});

test("getChapters", async () => {
  let result = await wrapper.getChapters(source,"2278/berserk");
  expect(result.pop()?.name == "Capitolo 00.01");
  //SO SAD
});


test("getChapterDetails", async () => {
  let result = await wrapper.getChapterDetails(source, "1684/tokyo-revengers", "60c156351c8dbb7cee36bdaf");
  expect(result.id == "60c156351c8dbb7cee36bdaf");
});

test("getSearchResult", async () => {
  let query = <SearchRequest>{title : "tokyo r"};
  let result = await wrapper.searchRequest(source,query,1);
  expect(result.results.pop()?.id == "1684/tokyo-revengers");
});

test("getHomePage", async () => {
   let result = await wrapper.getHomePageSections(source);
});
