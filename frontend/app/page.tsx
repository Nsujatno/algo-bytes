'use client';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { DailyChallengeCard } from "@/components/dashboard/daily-challenge-card"
import { DashboardHeader } from "@/components/dashboard/header"
import { PracticeLab } from "@/components/dashboard/practice-lab"
import {
  MinimalTabsList,
  MinimalTabsTrigger,
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);

        // Fetch Profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("username, practice_credits, streak_count")
            .eq("id", user.id)
            .single();
        setProfile(profile);

        // Fetch Today's Challenge via API
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch('/api/challenges/today', {
            headers: {
                'x-user-timezone': userTimezone
            }
        });
        if (res.ok) {
            const challengeData = await res.json();
            setChallenge(challengeData);
        } else {
            console.error("Failed to fetch daily challenge");
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <DashboardHeader 
        credits={profile?.practice_credits ?? 3} 
        username={profile?.username ?? user.email?.split('@')[0] ?? "User"} 
      />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <Tabs defaultValue="daily" className="space-y-8">
          <div className="flex justify-center">
            <MinimalTabsList className="w-full max-w-[400px] justify-center">
              <MinimalTabsTrigger value="daily" className="flex-1">
                Daily Challenge
              </MinimalTabsTrigger>
              <MinimalTabsTrigger value="lab" className="flex-1">
                Practice Lab
              </MinimalTabsTrigger>
            </MinimalTabsList>
          </div>

          <TabsContent value="daily" className="flex justify-center pt-4">
            <DailyChallengeCard 
              streak={profile?.streak_count ?? 0} 
              challenge={challenge} 
            />
          </TabsContent>

          <TabsContent value="lab" className="pt-4">
            <PracticeLab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
