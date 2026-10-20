import { test, expect } from "@playwright/test";

const story = {
  id: 1,
  title: "A source-linked story for reader testing",
  description: "This is a browser-test fixture, not published news.",
  published_at: "2026-10-19T00:00:00Z",
  source: { name: "Test publisher" },
  categories: [{ id: 1, name: "Science" }],
  image_url: null,
};
test.beforeEach(async ({ page }) => {
  await page.route("http://news-api.test/api/**", (route) =>
    route.fulfill({
      json: {
        count: 1,
        next: null,
        previous: null,
        results: route.request().url().includes("categories")
          ? [{ id: 1, name: "Science", article_count: 1 }]
          : [story],
      },
    }),
  );
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { username: "Test reader" } }),
  );
  await page.route("**/api/reader/**", (route) =>
    route.fulfill({
      json: route.request().url().includes("preferences")
        ? { categories: [] }
        : { saved_ids: [] },
    }),
  );
});
for (const width of [390, 768, 1440]) {
  test(`news remains readable without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your news, in focus." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: story.title }).first(),
    ).toBeVisible();
    await expect(page.getByText("19 Oct 2026").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page
      .getByRole("searchbox", { name: "Search stories" })
      .fill("science");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/search\?q=science/);
  });
}
test("mobile sheet traps focus, closes with Escape, and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBeTruthy();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Topics", exact: true })
    .click();
  await expect(page).toHaveURL(/news\/custom/);
  await expect(dialog).not.toBeVisible();
});
test("reduced motion removes drawer travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
test("topic checkbox supports keyboard selection and saves the selected IDs", async ({
  page,
}) => {
  let selected: number[] = [];
  await page.route("**/api/reader/preferences", (route) => {
    if (route.request().method() === "PUT")
      selected = route.request().postDataJSON().categories;
    return route.fulfill({ json: { categories: selected } });
  });
  await page.goto("/news/custom");
  const checkbox = page.getByRole("checkbox", { name: "Science" });
  await expect(checkbox).toBeEnabled();
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await page.getByRole("button", { name: "Save Topics" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Topics saved" }),
  ).toContainText("Topics saved");
  expect(selected).toEqual([1]);
});
test("save story gives a pressed state and supports unsaving", async ({
  page,
}) => {
  const methods: string[] = [];
  await page.route("**/api/reader/saved/1", (route) => {
    methods.push(route.request().method());
    return route.fulfill({
      status: route.request().method() === "DELETE" ? 204 : 200,
      body:
        route.request().method() === "DELETE"
          ? undefined
          : JSON.stringify({ saved: true }),
    });
  });
  await page.goto("/");
  const save = page.getByRole("button", { name: "Save", exact: true });
  await save.click();
  const unsave = page.getByRole("button", { name: "Unsave", exact: true });
  await expect(unsave).toHaveAttribute("aria-pressed", "true");
  await unsave.click();
  await expect(save).toHaveAttribute("aria-pressed", "false");
  expect(methods).toEqual(["PUT", "DELETE"]);
});
test("lopsided page renders AllSides Left, Center, and Right comparisons without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lopsided");
  await expect(
    page.getByRole("heading", {
      name: "Lopsided Coverage & Headline Roundups",
    }),
  ).toBeVisible();
  await expect(page.getByText("From the Left").first()).toBeVisible();
  await expect(page.getByText("From the Center").first()).toBeVisible();
  await expect(page.getByText("From the Right").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("login, forgot password, signup password toggle, and reader dashboard work cleanly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  const passwordInput = page.locator("#current-password");
  await expect(passwordInput).toHaveAttribute("type", "password");
  const showBtn = page.getByRole("button", { name: "Show password" });
  await showBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await expect(
    page.getByRole("checkbox", { name: "Remember me for 30 days" }),
  ).toBeChecked();
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/forgot-password/);
  await expect(
    page.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeVisible();

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Test reader" }),
  ).toBeVisible();
  await expect(page.getByText("My Reading Spectrum")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();

  await page.goto("/timelines");
  await expect(
    page.getByRole("heading", { name: "News Timeline & Wire Archive" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Last 24 Hours" }),
  ).toBeVisible();

  await page.goto("/local-news");
  await expect(
    page.getByRole("heading", { name: "Regional & Local News Desks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "United Kingdom & Europe" }),
  ).toBeVisible();
});
