import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { DailyChallengeCard } from "@/components/dashboard/daily-challenge-card"
import { DashboardHeader } from "@/components/dashboard/header"
import { PracticeLab } from "@/components/dashboard/practice-lab"
import {
  MinimalTabsList,
  MinimalTabsTrigger,
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, practice_credits, streak_count")
    .eq("id", user.id)
    .single()

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
            <DailyChallengeCard streak={profile?.streak_count ?? 0} />
          </TabsContent>

          <TabsContent value="lab" className="pt-4">
            <PracticeLab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
