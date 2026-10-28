import { Suspense } from "react";
import CurrentTopics from "../../components/CurrentTopics";
export const metadata = { title: "Topics in the news | AbokiNews", description: "Current news topics and their categories in your country edition." };
export default function TopicsPage() { return <Suspense fallback={<p>Loading topics…</p>}><CurrentTopics /></Suspense>; }
