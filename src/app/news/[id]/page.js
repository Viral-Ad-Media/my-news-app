import { cache } from "react";
import { articleMetadata, articleStructuredData } from "@/lib/seo";
import ArticleBody from "@/components/ArticleBody";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "../../../components/NewsImage";
import SaveStoryButton from "../../../components/SaveStoryButton";
import { notFound } from "next/navigation";
import { buildServerApiUrl } from "../../../lib/server-api";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import StoryCoverage from "../../../components/StoryCoverage";
import RelatedNews from "../../../components/RelatedNews";
import CoverageBar from "../../../components/CoverageBar";
import ArticleTranslator from "../../../components/ArticleTranslator";
import { formatNewsDate, getArticleImageUrl } from "../../../lib/api";

const fetchArticleAndRelatedNews = cache(async function (articleId) {
  const articleUrl = buildServerApiUrl(`/news/${articleId}/`);
  const relatedUrl = buildServerApiUrl(`/news/${articleId}/related/`);

  if (!articleUrl || !relatedUrl) {
    return { article: null, relatedArticles: [] };
  }

  try {
    const [articleRes, relatedRes] = await Promise.all([
      fetch(articleUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }),
      fetch(relatedUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }).catch(() => null),
    ]);

    if (articleRes.status === 404)
      return { article: null, relatedArticles: [], missing: true };
    if (!articleRes.ok) {
      throw new Error("Failed to fetch article.");
    }

    const article = await articleRes.json();
    const relatedArticles = relatedRes?.ok ? await relatedRes.json() : [];
    return { article, relatedArticles };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { article: null, relatedArticles: [] };
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { article } = await fetchArticleAndRelatedNews(id);
  return article
    ? articleMetadata(article)
    : { title: "Story unavailable", robots: { index: false, follow: false } };
}

export default async function NewsDetails({ params }) {
  const { id: articleId } = await params;
  const { article, relatedArticles, missing } =
    await fetchArticleAndRelatedNews(articleId);
  if (missing) notFound();

  if (!article) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>The news service is temporarily unavailable.</p>
      </div>
    );
  }

  const hasComparison =
    Array.isArray(article.perspectives) &&
    article.perspectives.length > 1 &&
    article.total_sources > 1;
  const isExplainer =
    Array.isArray(article.tags) && article.tags.includes("explainer");
  const coverageUrl = buildServerApiUrl(`/news/${articleId}/coverage/`);
  const articleImage = getArticleImageUrl(article);
  const paragraphs = String(article.content || article.description || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="w-full min-w-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData(article)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <div
        className={
          hasComparison
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(210px,245px)_minmax(0,1fr)_minmax(220px,260px)] gap-6 items-start"
            : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start max-w-[1200px] mx-auto"
        }
      >
        {hasComparison && (
          <div className="md:col-span-1 lg:col-span-1 min-w-0 order-2 lg:order-1">
            <LeftSidebar articleId={articleId} />
          </div>
        )}

        <article className="md:col-span-2 lg:col-span-1 min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6 lg:p-8 order-1 lg:order-2 break-words">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {Array.isArray(article.categories) &&
              article.categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.id}`}>
                  <Badge variant="secondary" className="text-xs">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            {article.location && (
              <Badge variant="outline" className="uppercase text-xs">
                {article.location}
              </Badge>
            )}
          </div>

          <h1 className="fluid-article-title font-bold tracking-tight leading-tight text-balance mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-border text-xs text-muted-foreground">
            <div className="space-y-0.5 min-w-0">
              <div className="font-semibold text-foreground break-words">
                {article.source?.name || "AbokiNews Desk"}
                {article.author ? ` · By ${article.author}` : ""}
              </div>
              <div>
                <time dateTime={article.published_at}>
                  {formatNewsDate(article.published_at)}
                </time>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {article.article_url && (
                <a
                  href={article.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline underline-offset-4 px-2.5 py-1.5 rounded-md border border-border bg-muted/40"
                >
                  {isExplainer ? "Reference" : "Original source"}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              <SaveStoryButton articleId={article.id} />
            </div>
          </div>

          {articleImage && (
            <div className="w-full h-[240px] sm:h-[340px] lg:h-[400px] rounded-lg overflow-clip mb-6 bg-muted/30">
              <Image
                src={articleImage}
                alt={article.image_alt || article.title}
                width={1000}
                height={400}
                className="block w-full h-full object-cover object-center"
              />
            </div>
          )}

          {hasComparison && (
            <div className="mb-5 rounded-lg border border-border bg-muted/30 p-3.5">
              <CoverageBar article={article} compact={true} />
            </div>
          )}

          <div className="mb-5">
            <ArticleTranslator
              title={article.title}
              description={article.description}
              paragraphs={paragraphs}
            />
          </div>

          {article.description &&
            article.content &&
            article.description.trim() !== article.content.trim() && (
              <div className="mb-5 rounded-lg border-l-4 border-foreground bg-muted/40 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Key Briefing Summary
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {article.description}
                </p>
              </div>
            )}

          <h2 className="text-lg font-bold mb-3">Full Report</h2>
          <div className="max-w-[72ch]">
            <ArticleBody content={article.content || article.description} />
          </div>

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Tags:
                </span>
                {article.tags.map((tag, index) => (
                  <Badge
                    key={`${tag}-${index}`}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {coverageUrl && hasComparison && (
            <div className="mt-6 pt-4 border-t border-border">
              <StoryCoverage apiUrl={coverageUrl} />
            </div>
          )}
        </article>

        <div className="md:col-span-1 lg:col-span-1 min-w-0 order-3">
          <RightSidebar />
        </div>
      </div>

      {Array.isArray(relatedArticles) && relatedArticles.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border">
          <RelatedNews articles={relatedArticles} />
        </section>
      )}
    </div>
  );
}
