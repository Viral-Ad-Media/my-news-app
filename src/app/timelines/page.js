import NewsList from "../../components/NewsList";
export default function Page() {
  return (
    <>
      <p>Stories listed from newest to oldest by their publication time.</p>
      <NewsList title="News Timeline" />
    </>
  );
}
