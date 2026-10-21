import { test, expect } from "@playwright/test";

const entry = {
  id: 1,
  title: "Solar power: a practical household guide",
  description: "A useful solar power summary.",
  content:
    "Solar power explained.\n\n## Solar power choices\n\n[Related](/news/2)",
  categories: [],
  source: { name: "Editorial desk" },
  published_at: "2026-10-20T00:00:00Z",
};

test.beforeEach(async ({ page }) => {
  await page.route("http://news-api.test/api/**", (r) =>
    r.fulfill({ json: { results: [], count: 0 } }),
  );
  await page.route("**/api/session", (r) =>
    r.fulfill({ status: 401, json: { detail: "Please sign in" } }),
  );
  await page.route("**/api/reader/**", (r) =>
    r.fulfill({ status: 401, json: { detail: "Please sign in" } }),
  );
});

for (const width of [390, 768, 1440])
  test(`auth pages use readable forms at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, title] of [
      ["/login", "Welcome back."],
      ["/signup", "Make room for better news."],
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await expect(page.locator("main form")).toHaveCount(1);
      await expect(page.getByRole("link", { name: "Continue with Google" })).toBeVisible();
      const input = page.locator("#username");
      await expect(input).toBeVisible();
      const rect = await input.boundingBox();
      expect(rect!.y).toBeLessThan(650);
    }
  });

test("account popup switches forms, traps focus and restores it after Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Login", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("form")).toHaveCount(1);
  await expect(dialog.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", /mode=login&remember=1/);
  await expect(
    dialog.getByRole("textbox", { name: /username or email/i }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await dialog.getByRole("link", { name: "Create your account" }).click();
  await expect(dialog.locator("form")).toHaveCount(1);
  await expect(dialog.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", /mode=signup&remember=1/);
  await expect(dialog.getByLabel("Password", { exact: true })).toBeVisible();
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("meaningful-password-42");
  await dialog
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(dialog.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
});

test("failed login shows the error inside the popup without losing entered details", async ({
  page,
}) => {
  await page.route("**/api/session", (r) =>
    r.fulfill({
      status: 401,
      json: { detail: "Credentials were not accepted." },
    }),
  );
  await page.goto("/login"); // full-page fallback shares the same form
  await page.locator("#username").fill("reader");
  await page.locator("#current-password").fill("bad-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Credentials were not accepted" }),
  ).toContainText("Credentials were not accepted");
  await expect(page.locator("#username")).toHaveValue("reader");
});

test("editor analyzes an unsaved draft and persists SEO settings with the post", async ({
  page,
}) => {
  test.setTimeout(60000);
  let saved: any;
  await page.route("**/api/session", (r) =>
    r.fulfill({ json: { username: "Editor", is_staff: true } }),
  );
  await page.route("**/api/reader/superadmin/overview", (r) =>
    r.fulfill({
      json: {
        stats: {},
        articles: [entry],
        categories: [],
        sources: [],
        users: [],
      },
    }),
  );
  await page.route("**/api/reader/superadmin/seo/analyze", (r) => {
    const d = r.request().postDataJSON();
    return r.fulfill({
      json: {
        score: d.focus_keyword ? 75 : 20,
        possible: 100,
        word_count: 25,
        internal_links: 1,
        external_links: 0,
        checks: [
          {
            id: "reference",
            label: "Supporting reference link",
            passed: false,
            points: 5,
            advice: "Link to primary evidence.",
          },
        ],
      },
    });
  });
  await page.route("**/api/reader/superadmin/articles", (r) => {
    saved = r.request().postDataJSON();
    return r.fulfill({ json: { ...saved, id: 2 } });
  });
  await page.goto("/superadmin?tab=articles");
  await page.locator("#admin-post-title").fill(entry.title);
  await page.locator("#admin-post-desc").fill(entry.description);
  await page.locator("#seo-focus").fill("solar power");
  await page.locator("#seo-title").fill("Solar power: a practical guide");
  await expect(page.getByText("75/100")).toBeVisible();
  await expect(page.getByLabel("Search result preview")).toContainText(
    "Solar power: a practical guide",
  );
  await page.getByRole("tab", { name: "Advanced", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Exclude from search results (noindex)" })
    .check();
  await page.getByLabel("Article schema").selectOption("BlogPosting");
  await page
    .getByRole("button", { name: "Publish Blog Post", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Published new blog post" }),
  ).toBeVisible();
  expect(saved.focus_keyword).toBe("solar power");
  expect(saved.seo_noindex).toBe(true);
  expect(saved.schema_type).toBe("BlogPosting");
});

test("public article renders saved search/social metadata, robots, schema and real body links", async ({
  page,
}) => {
  await page.goto("/news/1");
  await expect(page).toHaveTitle(
    "Solar power: a practical guide for households",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A distinct search description for our editorial guide.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://news.example/canonical",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "A social title for this article",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const schema = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(schema["@type"]).toBe("BlogPosting");
  await expect(
    page.getByRole("heading", { name: "Solar power choices" }),
  ).toBeVisible();
  await expect(page.locator("article img")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "How Left, Center & Right Covered This Story",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Related story", exact: true }),
  ).toHaveAttribute("href", "/news/2");
});

test("SEO service failures keep the editor usable and preserve the draft", async ({
  page,
}) => {
  await page.route("**/api/session", (r) =>
    r.fulfill({ json: { username: "Editor", is_staff: true } }),
  );
  await page.route("**/api/reader/superadmin/overview", (r) =>
    r.fulfill({
      json: { stats: {}, articles: [], categories: [], sources: [], users: [] },
    }),
  );
  await page.route("**/api/reader/superadmin/seo/analyze", (r) =>
    r.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page.goto("/superadmin?tab=articles");
  await page.locator("#admin-post-title").fill("An unsaved editorial draft");
  await expect(
    page.getByRole("button", { name: "Retry analysis" }),
  ).toBeVisible();
  await expect(page.locator("#admin-post-title")).toHaveValue(
    "An unsaved editorial draft",
  );
  await expect(
    page.getByRole("button", { name: "Publish Blog Post", exact: true }),
  ).toBeEnabled();
});

test("reader proxy permits the local browser origin and rejects foreign or missing origins", async ({
  request,
}) => {
  const url = "/api/reader/superadmin/seo/analyze";
  const allowed = await request.post(url, {
    headers: { Origin: "http://127.0.0.1:3210" },
    data: { title: "A local draft" },
  });
  expect(allowed.status()).toBe(200);
  const foreign = await request.post(url, {
    headers: { Origin: "https://unrelated.example" },
    data: {},
  });
  expect(foreign.status()).toBe(403);
  const missing = await request.post(url, { data: {} });
  expect(missing.status()).toBe(403);
});

test("successful popup sign-in establishes the shared reader flow and closes the dialog", async ({
  page,
}) => {
  let signedIn = false;
  await page.route("**/api/session", (r) => {
    if (r.request().method() === "POST") {
      expect(r.request().postDataJSON()).toMatchObject({
        username: "reader",
        password: "test-only-password",
        rememberMe: true,
      });
      signedIn = true;
    }
    return r.fulfill(
      signedIn
        ? { json: { username: "reader" } }
        : { status: 401, json: { detail: "Please sign in" } },
    );
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: /username or email/i })
    .fill("reader");
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("test-only-password");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(dialog).not.toBeVisible();
});

test("popup keeps unique field IDs and the unchecked remember-me choice on failure", async ({ page }) => {
  let submitted: Record<string, unknown> = {};
  await page.route("**/api/session", (route) => {
    if (route.request().method() === "POST") submitted = route.request().postDataJSON();
    return route.fulfill({ status: 401, json: { detail: "Credentials were not accepted." } });
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("#account-dialog-username")).toBeFocused();
  expect(await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll("[id]")).map((node) => node.id);
    return ids.length === new Set(ids).size;
  })).toBe(true);
  await dialog.getByLabel("Remember me for 30 days").uncheck();
  await expect(dialog.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", /mode=login&remember=0/);
  await dialog.getByLabel("Username or email", { exact: true }).fill("reader@example.com");
  await dialog.getByLabel("Password", { exact: true }).fill("test-only-password");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Credentials were not accepted.");
  expect(submitted).toEqual({ username: "reader@example.com", password: "test-only-password", rememberMe: false });
  await expect(dialog.getByLabel("Username or email", { exact: true })).toHaveValue("reader@example.com");
});
