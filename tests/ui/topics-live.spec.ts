import { test, expect } from "@playwright/test";
const story = { id: 310, location: "us", title: "Live sports fixture", description: "Browser fixture, not published news.", published_at: "2026-10-21T10:00:00Z", categories: [{ id: 8, name: "Sports" }], tags: ["Football"], source: { name: "Test desk" } };
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("news-location", "us"));
  await page.route("http://news-api.test/api/**", route => route.fulfill({ json: { results: route.request().url().includes("categories") ? story.categories : [story], count: 1 } }));
  await page.route("**/api/reader/saved-status**", route => route.fulfill({ json: { saved_ids: [] } }));
  await page.route("**/api/session", route => route.fulfill({ json: { authenticated: false } }));
});
test("homepage has one category explorer, coverage before full-width latest news", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore categories", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore topics", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "More to explore", exact: true })).toHaveCount(0);
  for (const name of ["Sports", "Culture", "Arts", "Finance", "Games", "Entertainment"]) await expect(page.locator(".explore-categories").getByRole("link", { name, exact: true })).toBeVisible();
  const coverage = page.getByRole("heading", { name: "Side-by-Side & Lopsided Stories" });
  const latest = page.locator(".news-list").filter({ has: page.getByRole("heading", { name: "Latest News", exact: true }) });
  await expect(coverage).toBeVisible();
  const brief = page.getByRole("region", { name: "Latest briefing" });
  expect((await coverage.boundingBox())!.y).toBeGreaterThan((await brief.boundingBox())!.y);
  expect((await latest.boundingBox())!.y).toBeGreaterThan((await coverage.boundingBox())!.y);
  const main = await page.locator("main").boundingBox();
  expect((await latest.boundingBox())!.width).toBeGreaterThan(main!.width * .9);
  await page.screenshot({ path: "test-results/homepage-categories-desktop.png", fullPage: true });
  await page.locator(".explore-categories").getByRole("link", { name: "Culture", exact: true }).click();
  await expect(page).toHaveURL(/topics\?category=Culture/);
  await expect(page.getByRole("navigation", { name: "News categories" }).getByRole("link", { name: "Culture", exact: true })).toBeVisible();
});
test("Topics navigation opens current subjects with categories and refreshes", async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route("http://news-api.test/api/news/**", route => {
    requests++;
    return route.fulfill({ json: { results: requests > 1 ? [{ ...story, id: 311, title: "Updated sports fixture" }] : [story] } });
  });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Topics", exact: true }).click();
  await expect(page).toHaveURL(/\/topics$/);
  await expect(page.getByRole("heading", { name: "Topics in the news" })).toBeVisible();
  await expect(page.getByText("Category: Sports", { exact: true })).toBeVisible();
  await expect(page.getByText("Topics: Football", { exact: true })).toBeVisible();
  const before = requests;
  await page.clock.fastForward(31000);
  await expect.poll(() => requests).toBeGreaterThan(before);
  await expect(page.getByRole("heading", { name: "Updated sports fixture" })).toBeVisible();
});
test("guest Live page requires an account without requesting the live feed", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/reader/live/**", route => { requests++; return route.fulfill({ status: 401, json: { detail: "Authentication required" } }); });
  await page.goto("/live");
  await expect(page.getByRole("heading", { name: "Sign in to follow the live desk." })).toBeVisible();
  expect(requests).toBe(0);
  const links = await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link").allTextContents();
  expect(links.indexOf("Live")).toBe(links.indexOf("RSS") + 1);
  await page.locator(".live-account-gate").getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
test("member Live feed refreshes across categories and respects the selected country", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/session", route => route.fulfill({ json: { authenticated: true, username: "Test member" } }));
  let calls = 0;
  let query: URL;
  await page.route("**/api/reader/live/**", route => {
    calls++; query = new URL(route.request().url());
    return route.fulfill({ json: { results: calls === 1 ? [story] : [{ ...story, id: 312, title: "New live fixture", categories: [{ id: 9, name: "Entertainment" }] }], count: 1 } });
  });
  await page.goto("/live");
  await expect(page.getByRole("heading", { name: story.title })).toBeVisible();
  expect(query!.searchParams.get("location")).toBe("us");
  expect(query!.searchParams.has("category")).toBe(false);
  await page.clock.fastForward(31000);
  await expect(page.getByRole("heading", { name: "New live fixture" })).toBeVisible();
  await expect(page.getByText("Category: Entertainment", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/live-members-desktop.png" });
  await page.getByLabel("Category", { exact: true }).selectOption("Games");
  await expect.poll(() => query!.searchParams.get("category")).toBe("Games");
});
test("topics and live are usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/topics");
  await expect(page.getByText("Category: Sports", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/topics-mobile.png", fullPage: true });
  await page.goto("/live");
  await expect(page.getByRole("heading", { name: "Sign in to follow the live desk." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
