import NewsList from "../../../components/NewsList";
export default function Page() {
  return (
    <NewsList title="Saved Stories" endpoint="/saved/" privateFeed saved />
  );
}
