export function categoryLinks(categories = []) {
  // The API is the directory of record. Never invent links to unsaved categories.
  return categories.filter(category => category.name?.trim()).map(category => ({
    id: category.id,
    name: category.name,
    href: `/categories/${category.id}`,
  }));
}
