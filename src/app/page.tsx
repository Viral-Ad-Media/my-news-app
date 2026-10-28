import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNews from "../components/TopNews";
import LatestNews from "../components/LatestNews";
import LopsidedStories from "../components/LopsidedStories";
import HomeHero from "../components/HomeHero";

export default function Home() {
  return (
    <div className="editorial-home">
      <HomeHero />
      <div className="editorial-lower-grid">
        <div className="min-w-0">
          <TopNews />
        </div>
        <aside aria-label="Explore categories and ask questions" className="editorial-sidebar min-w-0"><Sidebar /></aside>
      </div>
      <LopsidedStories mode="widget" />
      <LatestNews />
      <div className="reader-invitation">
        <div><p className="editorial-eyebrow">Make it your edition</p><h2>The stories you follow. All in one place.</h2><p>Choose your topics, save a story, and come back to what matters.</p></div>
        <Link href="/feed">Explore your feed <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
