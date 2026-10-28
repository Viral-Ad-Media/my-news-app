import { test, expect } from "@playwright/test";
import path from "node:path";

const topics = ["energy", "business", "health", "sport", "education", "world"];
const titles = ["Solar power brings new opportunities for communities", "Markets and the changing business outlook", "Health services expand their local reach", "Football clubs prepare for the next season", "Education and the future of learning", "Urban housing takes a new direction"];
const stories = topics.map((topic, index) => ({
  location: "ng", id: index + 1, title: titles[index], description: "A browser fixture for the editorial layout, with source-linked reporting and context for readers.",
  published_at: "2026-10-20T09:00:00Z", source: { name: "Browser fixture" },
  categories: [{ id: index + 1, name: topic }],
  image_url: index === 2 ? "https://photos.test/broken.jpg" : index === 4 ? null : `https://photos.test/${topic}.webp`,
  remote_image_url: index === 2 ? "https://photos.test/health.webp" : "",
}));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("news-location", "ng"); });
  await page.route("http://news-api.test/api/**", route => route.fulfill({ json: { results: route.request().url().includes("categories") ? [{ id: 1, name: "Energy", article_count: 6 }] : stories, count: 6 } }));
  await page.route("**/api/session", route => route.fulfill({ json: { authenticated: false } }));
  await page.route("**/api/reader/**", route => route.fulfill({ json: { saved_ids: [] } }));
  await page.route("https://photos.test/**", route => route.request().url().endsWith("broken.jpg")
    ? route.fulfill({ status: 404, body: "missing" })
    : route.fulfill({ path: path.join(process.cwd(), "public/images/editorial", new URL(route.request().url()).pathname), contentType: "image/webp" }));
});

for (const width of [390, 768, 1440]) {
  test(`editorial homepage and photographs work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const briefing = page.getByRole("region", { name: "Latest briefing" });
    await expect(briefing.locator("article")).toHaveCount(6);
    await expect(briefing.locator("img")).toHaveCount(6);
    await expect(briefing.locator("img[src='https://photos.test/health.webp']")).toBeVisible();
    await expect(briefing.getByText("Illustrative photo", { exact: true })).toHaveCount(1);
    await expect.poll(() => briefing.locator("img").evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // Load offscreen photographs before capturing the entire page.
    await page.locator("main img").evaluateAll(images => images.forEach(image => image.setAttribute("loading", "eager")));
    await expect.poll(() => page.locator("main img").evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/editorial-${width}.png`, fullPage: true });
    await page.screenshot({ path: `test-results/editorial-top-${width}.png` });
    if (width === 1440) {
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await page.screenshot({ path: "test-results/editorial-dark.png", fullPage: true });
    }
  });
}

test("broken source photo falls back to a labelled topic photograph", async ({ page }) => {
  await page.route("https://photos.test/**", route => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  const briefing = page.getByRole("region", { name: "Latest briefing" });
  await expect(briefing.getByText("Illustrative photo", { exact: true })).toHaveCount(6);
  await expect.poll(() => briefing.locator("img").evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
});
