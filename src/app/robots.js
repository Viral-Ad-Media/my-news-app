import { getSiteUrl } from "../lib/seo";

export default function robots() {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/reset-password/", "/admin", "/superadmin", "/dashboard"] }, sitemap: `${getSiteUrl()}/sitemap.xml` };
}
