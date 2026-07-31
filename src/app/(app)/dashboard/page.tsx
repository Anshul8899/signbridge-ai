import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

const DEMO_USER = {
  id: "demo",
  email: "demo@signbridge.ai",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as any;

const DEMO_PROFILE = {
  username: "demo_user",
  full_name: "Demo User",
  avatar_url: null,
  xp: 420,
  level: 3,
  coins: 100,
  streak: 5,
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("sb-demo-mode")?.value === "1";

  if (isDemo) {
    return (
      <DashboardClient
        user={DEMO_USER}
        profile={DEMO_PROFILE}
        completedLessons={["greetings"]}
        earnedAchievements={["first-lesson"]}
      />
    );
  }

  const supabase = await createClient();
  let user = null;
  let profile = null;
  let completedLessons: string[] = [];
  let earnedAchievements: string[] = [];

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const [profileRes, progressRes, achievementsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("lesson_progress").select("*").eq("user_id", user.id).eq("completed", true),
        supabase.from("achievements").select("*").eq("user_id", user.id),
      ]);
      profile = profileRes.data;
      completedLessons = progressRes.data?.map((p) => p.lesson_id) ?? [];
      earnedAchievements = achievementsRes.data?.map((a) => a.achievement_id) ?? [];
    }
  } catch {
    // Supabase not configured
  }

  if (!user) redirect("/auth/login");

  return (
    <DashboardClient
      user={user}
      profile={profile}
      completedLessons={completedLessons}
      earnedAchievements={earnedAchievements}
    />
  );
}
