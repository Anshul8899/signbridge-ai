import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch lesson progress
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", true);

  // Fetch achievements
  const { data: achievementsData } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id);

  return (
    <DashboardClient
      user={user}
      profile={profile}
      completedLessons={progressData?.map((p) => p.lesson_id) ?? []}
      earnedAchievements={achievementsData?.map((a) => a.achievement_id) ?? []}
    />
  );
}
