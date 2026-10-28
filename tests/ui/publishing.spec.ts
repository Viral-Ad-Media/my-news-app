import { readFileSync } from 'node:fs';
const fullArticle = readFileSync('tests/fixtures/full-article.txt', 'utf8');
import { test, expect } from "@playwright/test";

test("news publication submits a full article while keeping the summary separate", async ({ page }) => {
  let submitted: any;
  await page.route("**/api/session", (route) => route.fulfill({ json: { username: "Editor", is_staff: true } }));
  await page.route("**/api/reader/superadmin/overview", (route) => route.fulfill({ json: { stats: {}, articles: [], categories: [], sources: [], users: [] } }));
  await page.route("**/api/reader/superadmin/seo/analyze", (route) => route.fulfill({ json: { score: 20, checks: [], word_count: 5, internal_links: 0, external_links: 0 } }));
  await page.route("**/api/reader/superadmin/articles", (route) => {
    submitted = route.request().postDataJSON();
    return route.fulfill({ status: 201, json: { ...submitted, id: 77, seo_title: submitted.title } });
  });
  await page.context().addCookies([{ name: "news_access", value: "editor-browser-fixture", domain: "127.0.0.1", path: "/", httpOnly: true }]);
  await page.goto("/superadmin?tab=articles");
  await page.locator("#admin-post-title").fill("A short source-backed news update");
  await page.locator("#admin-post-desc").fill("A short news summary.");
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send for review", exact: true })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /I reviewed the current draft/ })).toHaveCount(0);
  await page.locator("#admin-post-content").fill(fullArticle);
  const publish = page.getByRole("button", { name: "Publish Blog Post", exact: true });
  await expect(publish).toBeEnabled();
  await publish.click();
  await expect(page.getByRole("status").filter({ hasText: "Published new blog post" })).toBeVisible();
  expect(submitted.title).toBe("A short source-backed news update");
  expect(submitted.content).toBe(fullArticle);
  expect(submitted.description).toBe("A short news summary.");
  expect(submitted).not.toHaveProperty("review_confirmed");
  expect(submitted).not.toHaveProperty("publication_status");
});
