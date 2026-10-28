// Deliberately small Markdown subset. No raw HTML or embedded scripts are accepted.
export function safeContentHref(value) {
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
function inline(text, affiliateLinks = []) {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|(https?:\/\/[^\s<>]+)/g;
  const result = [];
  let start = 0;
  let match;
  while ((match = pattern.exec(text))) {
    result.push(text.slice(start, match.index));
    const href = safeContentHref(match[2] || match[3]);
    result.push(
      href ? (
        <a
          key={match.index}
          href={href}
          rel={affiliateLinks.includes(match[2] || match[3]) ? "sponsored nofollow noopener" : undefined}
          className="underline underline-offset-4 break-words"
        >
          {match[1] || match[3]}
        </a>
      ) : (
        match[0]
      ),
    );
    start = pattern.lastIndex;
  }
  result.push(text.slice(start));
  return result;
}
export default function ArticleBody({ content, affiliateLinks = [] }) {
  return (
    <div className="space-y-4 text-base text-foreground leading-relaxed break-words">
      {String(content || "")
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((block, index) => {
          const lines = block.trim().split("\n");
          const cells = (line) => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
          if (lines.length >= 3 && lines[1].includes("|") && cells(lines[1]).every((cell) => /^:?-{3,}:?$/.test(cell))) {
            const headers = cells(lines[0]);
            return <div key={index} className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr>{headers.map((cell, i) => <th key={i} scope="col" className="border-b p-3 text-left font-semibold">{inline(cell, affiliateLinks)}</th>)}</tr></thead><tbody>{lines.slice(2).map((row, i) => <tr key={i}>{cells(row).slice(0, headers.length).map((cell, j) => <td key={j} className="border-b p-3 align-top">{inline(cell, affiliateLinks)}</td>)}</tr>)}</tbody></table></div>;
          }
          return lines.map((line, i) => {
            const heading = line.match(/^(#{2,3})\s+(.+)/);
            if (heading) {
              const Tag = heading[1].length === 2 ? "h2" : "h3";
              return (
                <Tag
                  key={`${index}-${i}`}
                  className="text-lg font-semibold pt-3"
                >
                  {inline(heading[2], affiliateLinks)}
                </Tag>
              );
            }
            return <p key={`${index}-${i}`}>{inline(line, affiliateLinks)}</p>;
          });
        })}
    </div>
  );
}
