import Sidebar from "../components/Sidebar";
import TopNews from "../components/TopNews";
import LatestNews from "../components/LatestNews";
import PersonalizedNewsFeed from "../components/PersonalizedNewsFeed";
import LopsidedStories from "../components/LopsidedStories";
import HomeHero from "../components/HomeHero";

export default function Home() {
  return (
    <>
      <HomeHero />
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
