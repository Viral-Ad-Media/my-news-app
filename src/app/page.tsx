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
      {/* Inside the 1100px frame: 48px padding leaves 1052px; (1052 - 3*16)/4 = 251px, with a 785px story column + 16px gap + 251px rail. */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className="lg:col-span-3 min-w-0 space-y-8">
          <TopNews />
          <LopsidedStories mode="widget" />
          <PersonalizedNewsFeed />
          <LatestNews />
        </div>
        <aside
          aria-label="Explore topics and ask questions"
          className="min-w-0"
        >
          <Sidebar />
        </aside>
      </div>
    </>
  );
}
