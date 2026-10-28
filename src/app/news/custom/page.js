import { redirect } from "next/navigation";
export default function Page() { redirect("/topics?manage=1#followed-categories"); }
