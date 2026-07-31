import { LESSONS } from "@/lib/lessons";
import { notFound } from "next/navigation";
import { LessonDetailClient } from "@/components/learn/lesson-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) notFound();
  return <LessonDetailClient lesson={lesson} />;
}

export async function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}
