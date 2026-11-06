import LocalizedArticleText from "./LocalizedArticleText";
import Link from "next/link";
import NewsImage from "./NewsImage";
import { formatNewsDate, getArticleImageUrl } from "../lib/api";

export default function ReportCards({ articles = [] }) {
  return <div className="report-card-grid">{articles.map(article => <article key={article.id} className="report-card">
    <p className="editorial-eyebrow"><Link href={`/sources/${article.source?.id}`}>{article.source?.name || "Source"}</Link> · {article.editorial_type || "news"}</p>
    <Link href={`/news/${article.id}`}><NewsImage article={article} src={getArticleImageUrl(article)} alt={article.image_alt || article.title} width={640} height={360} className="w-full aspect-[16/9] rounded-md mb-3" /><h3><LocalizedArticleText articleId={article.id} field="title" original={article.title} /></h3></Link>
    <p><LocalizedArticleText articleId={article.id} field="description" original={article.description} /></p>
    <time dateTime={article.published_at}>{formatNewsDate(article.published_at)}</time>
    {article.recommendation_reason && <p className="recommendation-reason">Why this story: {article.recommendation_reason}</p>}
    {/^https?:\/\//i.test(article.article_url || "") && <a className="text-link" href={article.article_url} target="_blank" rel="noopener noreferrer">Read original report ↗</a>}
  </article>)}</div>;
}
