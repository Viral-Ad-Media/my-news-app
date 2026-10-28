export const NEWS_CATEGORIES = [
  ["Sports", "sport"], ["Culture"], ["Arts", "art"], ["Finance", "financial"],
  ["Games", "gaming", "video games"], ["Entertainment"], ["Business"],
  ["Politics"], ["Technology", "tech"], ["Science"], ["Health"], ["Education"],
  ["Environment", "climate"], ["Travel"], ["Food"], ["Lifestyle"], ["World"],
].map(([name, ...aliases]) => ({ name, aliases }));

export function categoryLinks(categories = []) {
  const matched = new Set();
  const items = NEWS_CATEGORIES.map(({ name, aliases }) => {
    const match = categories.find(category => [name.toLowerCase(), ...aliases].includes(category.name?.toLowerCase()));
    if (match) matched.add(match.id);
    return { name, href: `/topics?category=${encodeURIComponent(name)}` };
  });
  for (const category of categories) {
    if (!matched.has(category.id) && !items.some(item => item.name.toLowerCase() === category.name?.toLowerCase())) {
      items.push({ name: category.name, href: `/topics?category=${encodeURIComponent(category.name)}` });
    }
  }
  return items;
}
