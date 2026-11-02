import DevelopingStories from "../../../components/DevelopingStories";
import { notFound } from "next/navigation";
export const metadata = { title: "Follow the story | AbokiNews" };
export default async function Page({ params }) { const { id } = await params; if (!/^\d+$/.test(id)) notFound(); return <DevelopingStories storyId={id} />; }
