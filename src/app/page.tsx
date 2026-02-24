import Sidebar from '../components/Sidebar';
import TopNews from '../components/TopNews';
import LatestNews from '../components/LatestNews';
// import LocalNews from '../components/LocalNews';
import PersonalizedNewsFeed from '../components/PersonalizedNewsFeed';

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      
      {/* Top News - Full width on small screens, 75% width on large screens */}
      <div className="lg:col-span-3 col-span-1">
        <TopNews />
        <PersonalizedNewsFeed />
        {/* <LocalNews /> */}
        <LatestNews />
      </div>

      {/* Right Sidebar - Full width on small screens, 25% width on large screens */}
      <div className="lg:col-span-1 col-span-1">
        <Sidebar />
      </div>
    </div>
  );
}
