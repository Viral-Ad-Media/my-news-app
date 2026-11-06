const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const DEFAULT_CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dz58pgz41";

const CLOUDINARY_BASE = `https://res.cloudinary.com/${DEFAULT_CLOUDINARY_CLOUD_NAME}/image/upload`;

export function getApiBaseUrl() {
  const configuredBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  if (!configuredBase) {
    return "";
  }

  const normalizedBase = trimTrailingSlash(configuredBase);
  return normalizedBase.endsWith("/api")
    ? normalizedBase
    : `${normalizedBase}/api`;
}

export function getApiOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  if (!configuredOrigin) {
    return "";
  }

  const normalizedOrigin = trimTrailingSlash(configuredOrigin);
  return normalizedOrigin.endsWith("/api")
    ? normalizedOrigin.slice(0, -4)
    : normalizedOrigin;
}

export function buildApiUrl(path = "") {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return "";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function resolveApiAssetUrl(path = "") {
  if (!path || path === "None" || path === "null") {
    return "";
  }

  const raw = String(path).trim();
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw)) {
    if (/^http:\/\/res\.cloudinary\.com\//i.test(raw)) {
      return raw.replace(/^http:\/\//i, "https://");
    }
    return raw;
  }

  if (raw.startsWith("/images/")) {
    return raw;
  }

  const stripped = raw.replace(/^\/+/, "");
  if (stripped.startsWith("image/upload/")) {
    return `https://res.cloudinary.com/${DEFAULT_CLOUDINARY_CLOUD_NAME}/${stripped}`;
  }
  if (stripped.startsWith("abokinews/")) {
    return `${CLOUDINARY_BASE}/${stripped}`;
  }

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${apiOrigin}${normalizedPath}`;
}

// Shared stock placeholders are never treated as photographs of a news event.
export function isPlaceholderImage(value) {
  return /placeholder|feature1\.webp|\/images\/editorial\/|\/api\/news-illustration(?:\?|$)/i.test(String(value || "")) || /abokinews\/starter\/story-(?:2|1[1-9]|20)(?:\.[a-z0-9]+)?(?:$|[?#])/i.test(String(value || ""));
}

export function getArticleImageTopic(article = {}) {
  const categories = (Array.isArray(article.categories) ? article.categories : []).map(c => String(c?.name || c || '')).join(' ').toLowerCase();
  const patterns = [
    ['sport', /\b(sport|sports|football|soccer|basketball|tennis|olympic|league)\b/],
    ['entertainment', /\b(entertainment|film|movie|music|concert|celebrity|cinema|television)\b/],
    ['culture', /\b(culture|art|arts|literature|heritage|theatre|theater)\b/],
    ['health', /\b(health|medical|hospital|medicine|vaccine|doctor|disease)\b/],
    ['science', /\b(science|space|nasa|astronomy|europa|clipper|telescope)\b/],
    ['technology', /\b(technology|tech|software|broadband|telecom|internet|ai|network)\b/],
    ['finance', /\b(finance|financial|banking|currency|inflation|cbn|loan|stock|equities)\b/],
    ['business', /\b(business|economy|economic|trade|market|investment|refinery|oil|petroleum|fuel)\b/],
    ['education', /\b(education|school|university|student|teacher|learning)\b/],
    ['environment', /\b(environment|climate|energy|solar|renewable|electricity|wildlife|conservation)\b/],
    ['politics', /\b(politics|political|election|parliament|government|president|governor)\b/],
    ['travel', /\b(travel|tourism|flight|aviation|holiday|tourist)\b/],
    ['lifestyle', /\b(lifestyle|food|fashion|wellness|family|cooking)\b/],
    ['world', /\b(world|international|global|diplomacy|foreign)\b/],
    ['local', /\b(local|community|housing|city|urban|transport)\b/],
  ];
  // Prefer the saved editorial category over incidental words in the headline.
  return patterns.find(([, pattern]) => pattern.test(categories))?.[0]
    || patterns.find(([, pattern]) => pattern.test(String(article.title || '').toLowerCase()))?.[0] || 'news';
}

export function getArticleFallbackImage() { return ''; }

export function getArticleImageCandidates(article = {}) {
  return [...new Set([
    article.image_url, article.remote_image_url, article.image,
    article.og_image_url,
  ].filter((value) => typeof value === "string")
    .map(resolveApiAssetUrl)
    .filter((value) => value && !isPlaceholderImage(value)))];
}

export function getArticleImageUrl(article) {
  if (!article || typeof article !== "object") return "";
  return getArticleImageCandidates(article)[0] || getArticleFallbackImage(article);
}

export function listItems(data) {
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
}

// Preserve the source's recorded publication date across reader time zones.
export function formatNewsDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function withinPublicationWindow(article, window, now = Date.now()) {
  const days = { last_day: 1, last_week: 7, last_month: 30 }[window];
  if (!days) return true;
  const published = Date.parse(article.published_at);
  return Number.isFinite(published) && published <= now && published >= now - days * 86400000;
}
