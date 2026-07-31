import { LESSONS } from "@/lib/lessons";
import { LessonsClient } from "@/components/learn/lessons-client";

export default function LearnPage() {
  return <LessonsClient lessons={LESSONS} />;
}
