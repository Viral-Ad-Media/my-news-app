import NewsList from "../../components/NewsList";
export default async function Page({ searchParams }) {
  const q = String((await searchParams).q || "").slice(0, 200);
  return (
    <NewsList
      title={`Search: ${q || "All stories"}`}
      query={`search=${encodeURIComponent(q)}`}
    />
  );
}
