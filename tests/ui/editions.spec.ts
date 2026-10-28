import { test, expect } from "@playwright/test";

const stories = [
  { id: 201, location: "us", title: "US regional fixture", image_url: null },
  { id: 202, location: "ng", title: "Nigeria regional fixture", image_url: null },
  { id: 203, location: "ca", title: "Canada regional fixture", image_url: null },
  { id: 204, location: "world", title: "Global fixture excluded from editions", image_url: null },
  { id: 205, location: "us", title: "Refinery aviation fixture", image_url: "https://res.cloudinary.com/dz58pgz41/image/upload/v1792483615/abokinews/starter/story-13.webp" },
].map(article => ({ ...article, description: "Test fixture only.", source: { name: "Browser fixture" }, categories: [], published_at: "2026-10-20T00:00:00Z" }));

test.beforeEach(async ({ page }) => {
  await page.route("**/api/edition", route => route.fulfill({ json: { country: "us" } }));
  // Deliberately return mixed regions: the UI must still reject foreign stories.
  await page.route("http://news-api.test/api/**", route => route.fulfill({ json: { results: route.request().url().includes("categories") ? [] : stories, count: stories.length } }));
  await page.route("**/api/session", route => route.fulfill({ json: { authenticated: false } }));
  await page.route("**/api/reader/**", route => route.fulfill({ json: route.request().url().includes("saved-status") ? { saved_ids: [] } : { results: stories, count: 5 } }));
});

test("detected US edition is consistent and changing country updates every homepage section", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", request => { if (/news-api.test\/api\/(news|lopsided)\//.test(request.url())) requested.push(new URL(request.url()).searchParams.get("location") || ""); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".edition-description")).toContainText("United States");
  await expect(page.getByRole("heading", { name: "US regional fixture" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nigeria regional fixture" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Global fixture excluded from editions" })).toHaveCount(0);
  expect(requested.length).toBeGreaterThan(0);
  expect(requested.every(country => country === "us")).toBe(true);
  await page.getByRole("combobox", { name: "Country", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(61);
  await page.getByRole("option", { name: "Canada", exact: true }).click();
  await expect(page.locator(".edition-description")).toContainText("Canada");
  await expect(page.getByRole("heading", { name: "Canada regional fixture" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "US regional fixture" })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("news-location"))).toBe("ca");
  await page.screenshot({ path: "test-results/canada-edition-desktop.png", fullPage: true });
});

test("search, timeline, saved and personal feeds carry the chosen region", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("news-location", "ca"));
  const urls: string[] = [];
  page.on("request", request => { if (/\/api\/(?:reader\/)?(?:news|feed|saved)\/?\?/.test(request.url())) urls.push(request.url()); });
  for (const route of ["/search?q=fixture", "/timelines", "/news/saved", "/feed"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Canada regional fixture" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "US regional fixture" })).toHaveCount(0);
  }
  expect(urls.length).toBeGreaterThanOrEqual(4);
  expect(urls.every(url => new URL(url).searchParams.get("location") === "ca")).toBe(true);
});

test("orange login, cream AI panel and source-card replacement are visible", async ({ page }) => {
  let generatedCardRequests = 0;
  await page.route("**/abokinews/starter/story-13*", route => { generatedCardRequests++; return route.abort(); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const login = page.getByRole("button", { name: "Login", exact: true });
  await expect(login).toHaveCSS("background-color", "rgb(217, 71, 24)");
  const ai = page.getByRole("region", { name: "Ask Aboki AI" });
  await expect(ai).toBeVisible();
  await expect(ai).toHaveCSS("background-color", "rgb(246, 240, 227)");
  expect((await ai.boundingBox())!.y).toBeLessThan((await page.locator(".lead-photo").boundingBox())!.y);
  const refinery = page.locator(".supporting-story").filter({ hasText: "Refinery aviation fixture" });
  await expect(refinery.locator("img")).toHaveAttribute("src", /refinery.webp/);
  await expect(refinery.getByText("Illustrative photo")).toBeVisible();
  expect(generatedCardRequests).toBe(0);
  let submitted: any;
  await page.route("**/api/reader/ask", route => { submitted = route.request().postDataJSON(); return route.fulfill({ json: { answer: "US fixture answer", sources: [] } }); });
  await ai.getByRole("textbox", { name: "Question" }).fill("Latest news?");
  await ai.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(ai.getByRole("status")).toContainText("US fixture answer");
  expect(submitted.location).toBe("us");
  await page.screenshot({ path: "test-results/us-edition-desktop.png" });
});

test("global languages include translated navigation and RTL without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/");
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(21);
  await page.getByRole("option", { name: "Deutsch", exact: true }).click();
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await page.locator("#news-language").click();
  await page.getByRole("option", { name: "اردو", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/us-edition-urdu-mobile.png" });
});
