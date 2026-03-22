import { fetchLessons } from "@/lib/data";
import LessonsClient from "./LessonsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lessons | Pokemon Training Center",
  description: "Browse all lesson categories across every Pokemon type.",
};

export default async function LessonsPage() {
  const lessons = await fetchLessons();
  return <LessonsClient lessons={lessons} />;
}
