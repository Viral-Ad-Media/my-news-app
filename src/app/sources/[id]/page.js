import SourceDirectory from "../../../components/SourceDirectory";
import { notFound } from "next/navigation";
export const metadata = { title: "Publisher profile | AbokiNews" };
export default async function Page({ params }) { const { id } = await params; if (!/^\d+$/.test(id)) notFound(); return <SourceDirectory sourceId={id} />; }
