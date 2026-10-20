import Sidebar from "../components/Sidebar";
import TopNews from "../components/TopNews";
import LatestNews from "../components/LatestNews";
import PersonalizedNewsFeed from "../components/PersonalizedNewsFeed";
import LopsidedStories from "../components/LopsidedStories";

export default function Home() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your news, in focus.
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Nigeria and beyond. Read the story, follow the source.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-8">
          <TopNews />
          <LopsidedStories mode="widget" />
          <PersonalizedNewsFeed />
          <LatestNews />
        </div>
        <aside
          aria-label="Explore topics and ask questions"
          className="lg:col-span-4 xl:col-span-3 min-w-0"
        >
          <Sidebar />
        </aside>
      </div>
    </>
  );
}
