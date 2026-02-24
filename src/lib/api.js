const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export function getApiBaseUrl() {
  const configuredBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";

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
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin}${normalizedPath}`;
}
