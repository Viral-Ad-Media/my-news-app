const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const DEFAULT_CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dz58pgz41";

const CLOUDINARY_BASE = `https://res.cloudinary.com/${DEFAULT_CLOUDINARY_CLOUD_NAME}/image/upload`;

// Cloudinary-hosted editorial images for starter & roundup stories
// (used automatically when an API environment has not yet synced image fields)
const CLOUDINARY_STORY_IMAGES_BY_TITLE = {
  "oyedele calls for public listings of nnpc and nlng": `${CLOUDINARY_BASE}/v1792480242/abokinews/starter/story-1.webp`,
  "nigerian equities fall as industrial and bank shares retreat": `${CLOUDINARY_BASE}/v1792480243/abokinews/starter/story-2.webp`,
  "nigeria introduces capital-market development plan through 2036": `${CLOUDINARY_BASE}/v1792480243/abokinews/starter/story-3.webp`,
  "kano lawmakers reduce spending plan after revenue shortfall": `${CLOUDINARY_BASE}/v1792480244/abokinews/starter/story-4.webp`,
  "nafdac reports suspected counterfeit-drinks operation in aba": `${CLOUDINARY_BASE}/v1792480245/abokinews/starter/story-5.webp`,
  "mortgage bank reports housing-finance approvals for 2025": `${CLOUDINARY_BASE}/v1792480245/abokinews/starter/story-6.webp`,
  "education ministry says recruitment-waiver process remains in force": `${CLOUDINARY_BASE}/v1792480246/abokinews/starter/story-7.webp`,
  "nitda and naccima announce commercial links for nigerian startups": `${CLOUDINARY_BASE}/v1792480247/abokinews/starter/story-8.webp`,
  "nasa’s simulated mars crew reaches a year in isolation": `${CLOUDINARY_BASE}/v1792480248/abokinews/starter/story-9.jpg`,
  "nasa's simulated mars crew reaches a year in isolation": `${CLOUDINARY_BASE}/v1792480248/abokinews/starter/story-9.jpg`,
  "nasa engineers streamline rocket shock and vibration modelling": `${CLOUDINARY_BASE}/v1792480844/abokinews/starter/story-10.jpg`,
  "cbn reports foreign-exchange reserves climb to $40.2 billion in october": `${CLOUDINARY_BASE}/v1792483613/abokinews/starter/story-11.webp`,
  "lagos expands fiber-optic metro duct network by 1,200 kilometers": `${CLOUDINARY_BASE}/v1792483614/abokinews/starter/story-12.webp`,
  "dangote refinery begins direct aviation jet-fuel supply to regional carriers": `${CLOUDINARY_BASE}/v1792483615/abokinews/starter/story-13.webp`,
  "nerc orders electricity discos to accelerate prepaid meter rollout before q4 deadline": `${CLOUDINARY_BASE}/v1792483616/abokinews/starter/story-14.webp`,
  "health ministry launches maternal-care and primary clinic solarization across 18 states": `${CLOUDINARY_BASE}/v1792483616/abokinews/starter/story-15.webp`,
  "nelfund disburses student institutional upkeep loans to 42 additional public campuses": `${CLOUDINARY_BASE}/v1792483617/abokinews/starter/story-16.webp`,
  "nasa’s europa clipper completes deep-space instrument calibration ahead of planetary flyby": `${CLOUDINARY_BASE}/v1792483618/abokinews/starter/story-17.webp`,
  "nasa's europa clipper completes deep-space instrument calibration ahead of planetary flyby": `${CLOUDINARY_BASE}/v1792483618/abokinews/starter/story-17.webp`,
  "webb telescope maps silicate cloud structures in nearby exoplanet atmosphere": `${CLOUDINARY_BASE}/v1792483619/abokinews/starter/story-18.webp`,
  "uk treasury outlines green gilt issuance and north sea grid interconnectors for 2027": `${CLOUDINARY_BASE}/v1792483620/abokinews/starter/story-19.webp`,
  "london and manchester fast-track brownfield urban housing regeneration permits": `${CLOUDINARY_BASE}/v1792483621/abokinews/starter/story-20.webp`,
  "doj arrests 28 in alleged voter fraud in ca": `${CLOUDINARY_BASE}/v1792480845/abokinews/allsides/roundup-1.png`,
  "how will trump's endorsement of netanyahu affect israel's election?": `${CLOUDINARY_BASE}/v1792480846/abokinews/allsides/roundup-2.jpg`,
  "could school voucher programs be a key factor in the texas gubernatorial race?": `${CLOUDINARY_BASE}/v1792480847/abokinews/allsides/roundup-3.webp`,
  "elon musk pledges spacex shares to every american child in 2027": `${CLOUDINARY_BASE}/v1792480847/abokinews/allsides/roundup-4.webp`,
  "is casual sex problematic?": `${CLOUDINARY_BASE}/v1792480848/abokinews/allsides/roundup-5.jpg`,
  "trump waives impending sanctions on russian goods and energy buyers": `${CLOUDINARY_BASE}/v1792480849/abokinews/allsides/roundup-6.webp`,
  "what's behind the nationwide rioting in france?": `${CLOUDINARY_BASE}/v1792480850/abokinews/allsides/roundup-7.webp`,
};

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

export function getArticleFallbackImage(article = {}) {
  const topic = getArticleImageTopic(article);
  const identity = String(article.id ?? article.article_url ?? `${article.title || ''}|${article.description || ''}|${article.published_at || ''}|${article.source?.id || article.source?.name || ''}`);
  // Two independent fingerprints keep ID-less fixtures stable without a global
  // allocation registry. Real articles always retain their unique database ID.
  let a = 2166136261, b = 5381;
  for (const char of identity) { a = Math.imul(a ^ char.codePointAt(0), 16777619) >>> 0; b = (Math.imul(b, 33) ^ char.codePointAt(0)) >>> 0; }
  const story = article.id != null ? `article-${article.id}` : `story-${a.toString(16)}-${b.toString(16)}`;
  return `/api/news-illustration?story=${encodeURIComponent(story)}&topic=${topic}&title=${encodeURIComponent(String(article.title || 'News report').slice(0, 180))}`;
}

export function getArticleImageCandidates(article = {}) {
  const titleKey = String(article.title || "").trim().toLowerCase();
  return [...new Set([
    article.image_url, article.remote_image_url, article.image,
    article.og_image_url, CLOUDINARY_STORY_IMAGES_BY_TITLE[titleKey],
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
