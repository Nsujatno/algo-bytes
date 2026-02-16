"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Play, Loader2, CheckCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PracticeChallenge {
    id: string;
    title: string;
    difficulty: string;
    algorithm_category: string;
    status: 'locked' | 'available' | 'completed';
}

export function PracticeLab() {
  const [challenges, setChallenges] = useState<PracticeChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch challenges
  const loadChallenges = async () => {
    try {
        const res = await fetch('/api/challenges/practice');
        if (res.ok) {
            const data = await res.json();
            setChallenges(data);
        }
    } catch (e) {
        console.error("Failed to load practice challenges");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleUnlock = async (id: string) => {
    setUnlockingId(id);
    try {
        const res = await fetch(`/api/challenges/${id}/unlock`, { method: 'POST' });
        const data = await res.json();
        
        if (res.ok) {
            // Success! Refresh list to show available
             // Success! Route to the challenge
             router.push(`/challenge/${id}`);
        } else {
            alert(data.error || "Failed to unlock");
        }
    } catch (e) {
        console.error("Unlock failed", e);
    } finally {
        setUnlockingId(null);
    }
  };

  if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 overflow-x-auto">
        <Badge variant="yellow" className="cursor-pointer">
          All
        </Badge>
        {/* Categories could be dynamic too, but static is fine for now */}
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Arrays
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Trees
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Stack
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Card
            key={challenge.id}
            className="flex flex-col justify-between border-border bg-surface transition-colors hover:border-accent/50"
          >
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge
                  variant={challenge.difficulty.toLowerCase() as "easy" | "medium" | "hard"}
                  className="capitalize"
                >
                  {challenge.difficulty}
                </Badge>
                {challenge.status === "locked" && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                {challenge.status === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <CardTitle className="text-lg font-medium leading-none mt-3">
                {challenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {challenge.algorithm_category}
              </div>
            </CardContent>
            <CardFooter>
              {challenge.status === "completed" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer text-green-500 hover:text-green-600 hover:bg-green-500/10"
                  onClick={() => router.push(`/challenge/${challenge.id}`)}
                >
                  Review Solution
                </Button>
              ) : challenge.status === "locked" ? (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full opacity-70 hover:opacity-100 transition-opacity gap-2" 
                    onClick={() => handleUnlock(challenge.id)}
                    disabled={unlockingId === challenge.id}
                >
                  {unlockingId === challenge.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Lock className="h-3 w-3" />} 
                  Unlock (1 ⭐)
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full gap-2 text-black"
                  onClick={() => router.push(`/challenge/${challenge.id}`)}
                >
                  <Play className="h-3 w-3" /> Start
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
