import Image from "next/image";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import StoryCoverage from "../../../components/StoryCoverage";
import RelatedNews from "../../../components/RelatedNews";
import { buildApiUrl, resolveApiAssetUrl } from "../../../lib/api";

async function fetchArticleAndRelatedNews(articleId) {
  const articleUrl = buildApiUrl(`/news/${articleId}/`);
  const relatedUrl = buildApiUrl(`/news/${articleId}/related/`);

  if (!articleUrl || !relatedUrl) {
    return { article: null, relatedArticles: [] };
  }

  try {
    const [articleRes, relatedRes] = await Promise.all([
      fetch(articleUrl, { cache: "no-store" }),
      fetch(relatedUrl, { cache: "no-store" }),
    ]);

    if (!articleRes.ok) {
      throw new Error("Failed to fetch article.");
    }

    const article = await articleRes.json();
    const relatedArticles = relatedRes.ok ? await relatedRes.json() : [];
    return { article, relatedArticles };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { article: null, relatedArticles: [] };
  }
}

export default async function NewsDetails({ params }) {
  const { id: articleId } = params;
  const { article, relatedArticles } = await fetchArticleAndRelatedNews(articleId);

  if (!article) {
    return (
      <div className="text-center text-gray-500">
        <p>Article not found.</p>
      </div>
    );
  }

  const coverageUrl = buildApiUrl(`/news/${articleId}/coverage/`);
  const articleImage = article.image_url || article.image;

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-3">
          <LeftSidebar articleId={articleId} />
        </div>

        <main className="col-span-6 bg-white p-6">
          {articleImage && (
            <Image
              src={resolveApiAssetUrl(articleImage)}
              alt={article.title}
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-md mb-4"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold mt-6 mb-1">News summary</h3>
          <div className="flex flex-col space-y-1 mb-6">
            <div className="h-0.5 w-full bg-gray-700"></div>
            <div className="h-0.5 w-full bg-gray-400"></div>
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>

          <p className="text-gray-700 leading-relaxed">{article.content}</p>

          {coverageUrl && (
            <div className="mt-6">
              <StoryCoverage apiUrl={coverageUrl} />
            </div>
          )}
        </main>

        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>

      {Array.isArray(relatedArticles) && relatedArticles.length > 0 && (
        <section className="mt-8">
          <RelatedNews articles={relatedArticles} />
        </section>
      )}
    </div>
  );
}
