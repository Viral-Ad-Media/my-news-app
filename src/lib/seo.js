export const SEO_DEFAULTS = {
  focus_keyword: "",
  seo_title: "",
  seo_description: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  image_alt: "",
  seo_noindex: false,
  seo_nofollow: false,
  schema_type: "NewsArticle",
};

export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://my-news-app-blond-six.vercel.app";
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol)) return url.origin;
  } catch {}
  return "https://my-news-app-blond-six.vercel.app";
}

export function httpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function articleSeo(article) {
  const url = `${getSiteUrl()}/news/${article.id}`;
  const canonical = httpUrl(article.canonical_url) || url;
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.description || "";
  const image = httpUrl(article.og_image_url) || httpUrl(article.image_url);
  return { url, canonical, title, description, image };
}

export function articleMetadata(article) {
  const seo = articleSeo(article);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: { index: !article.seo_noindex, follow: !article.seo_nofollow },
    openGraph: {
      type: "article",
      siteName: "AbokiNews",
      url: seo.canonical,
      title: article.og_title || seo.title,
      description: article.og_description || seo.description,
      publishedTime: article.published_at,
      ...imageEntry(seo.image, article.image_alt),
    },
    twitter: {
      card: seo.image ? "summary_large_image" : "summary",
      title: article.og_title || seo.title,
      description: article.og_description || seo.description,
      ...(seo.image ? { images: [seo.image] } : {}),
    },
  };
}
function imageEntry(url, alt) {
  return url ? { images: [{ url, alt: alt || "" }] } : {};
}

export function articleStructuredData(article) {
  const seo = articleSeo(article);
  return {
    "@context": "https://schema.org",
    "@type": ["Article", "NewsArticle", "BlogPosting"].includes(
      article.schema_type,
    )
      ? article.schema_type
      : "NewsArticle",
    headline: article.title,
    description: seo.description,
    datePublished: article.published_at,
    mainEntityOfPage: seo.canonical,
    url: seo.url,
    ...(article.author
      ? {
          author: {
            "@type": /desk|news|editorial/i.test(article.author)
              ? "Organization"
              : "Person",
            name: article.author,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "AbokiNews",
      url: getSiteUrl(),
    },
    ...(seo.image ? { image: [seo.image] } : {}),
  };
}
