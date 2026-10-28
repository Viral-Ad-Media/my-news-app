import { buildServerApiUrl } from "../../lib/server-api";
import { getArticleImageUrl, listItems } from "../../lib/api";

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const category = (searchParams.get("category") || "").trim();
  const location = (searchParams.get("location") || "").trim().toLowerCase();
  const bias = (searchParams.get("bias") || "").trim().toLowerCase();

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (location) query.set("location", location);
  if (bias) query.set("bias", bias);

  const upstreamQuery = new URLSearchParams(query);
  upstreamQuery.set("page_size", "30");
  const apiUrl = buildServerApiUrl(`/news/?${upstreamQuery}`);
  let articles;
  try {
    if (!apiUrl) throw new Error("Unconfigured API");
    const response = await fetch(apiUrl, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Unavailable API");
    articles = listItems(await response.json());
  } catch {
    return new Response("RSS feed is temporarily unavailable. Please try again later.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const labelParts = [];
  if (category) labelParts.push(category);
  if (location) labelParts.push(location.toUpperCase());
  if (bias) labelParts.push(`${bias} spectrum`);

  const channelTitle = labelParts.length
    ? `AbokiNews — ${labelParts.join(" · ")} RSS Feed`
    : "AbokiNews — Multi-Perspective News Feed";

  const selfHref = `${origin}/rss.xml${
    query.toString() ? `?${query.toString()}` : ""
  }`;
  const nowRfc2822 = new Date().toUTCString();

  const itemsXml = articles
    .slice(0, 30)
    .map((article) => {
      const storyLink =
        article.article_url || `${origin}/news/${article.id}`;
      const guid = `${origin}/news/${article.id}`;
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : nowRfc2822;
      const author =
        article.author || article.source?.name || "AbokiNews Editorial Desk";
      const imageUrl = getArticleImageUrl(article);
      const catsXml = (article.categories || [])
        .map((c) => `      <category>${escapeXml(c.name)}</category>`)
        .join("\n");
      const enclosureXml =
        imageUrl && /^https?:\/\//i.test(imageUrl)
          ? `\n      <enclosure url="${escapeXml(imageUrl)}" length="0" type="${
              imageUrl.endsWith(".webp") ? "image/webp" : "image/jpeg"
            }" />`
          : "";

      return [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(storyLink)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(guid)}</guid>`,
        `      <pubDate>${escapeXml(pubDate)}</pubDate>`,
        `      <dc:creator>${escapeXml(author)}</dc:creator>`,
        `      <description>${escapeXml(article.description || "")}</description>`,
        catsXml,
        enclosureXml.trimStart() ? `      ${enclosureXml.trimStart()}` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(origin)}</link>
    <description>Balanced and source-linked news stories across Nigeria, the United States, the UK, and the world.</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(nowRfc2822)}</lastBuildDate>
    <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
