import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

const DEMO_PROFILE = {
  id: "demo",
  username: "demo_user",
  full_name: "Demo User",
  avatar_url: null,
  xp: 420,
  level: 3,
  coins: 100,
  streak: 5,
  last_activity: new Date().toDateString(),
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("sb-demo-mode")?.value === "1";

  if (isDemo) {
    return (
      <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
        <Sidebar profile={DEMO_PROFILE} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  const supabase = await createClient();
  let user = null;
  let profile = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      profile = p;
    }
  } catch {
    // Supabase not configured — treat as unauthenticated
  }

  if (!user) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
