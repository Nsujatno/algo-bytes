import Link from "next/link"
import { ArrowRight, Calendar, Flame, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DailyChallengeCardProps {
  streak: number
  challenge?: {
    id: string
    title: string
    description: string
    difficulty: string
    algorithm_category: string
    game_type: string
    daily_date: string | null
    completed?: boolean
  } | null
}

export function DailyChallengeCard({ streak, challenge }: DailyChallengeCardProps) {
  if (!challenge) {
    return (
      <Card className="w-full max-w-2xl border-border bg-surface text-center py-10">
        <CardTitle>No Daily Challenge Available</CardTitle>
        <CardDescription>Check back later!</CardDescription>
      </Card>
    )
  }

  const dateDisplay = challenge.daily_date 
    ? new Date(
        parseInt(challenge.daily_date.split('-')[0]),
        parseInt(challenge.daily_date.split('-')[1]) - 1,
        parseInt(challenge.daily_date.split('-')[2])
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Card className="w-full max-w-2xl border-border bg-surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="yellow" className="mb-2">
            Today's Challenge
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{dateDisplay}</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          {challenge.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2">
          {challenge.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Badge variant={challenge.difficulty.toLowerCase() as any}>{challenge.difficulty}</Badge>
          <Badge variant="outline">{challenge.algorithm_category}</Badge>
          <Badge variant="outline">Code Assembler</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex items-center gap-2 text-yellow-500">
          <Flame className="h-5 w-5 fill-current" />
          <span className="font-bold">{streak} day streak</span>
        </div>
        <Link href={`/challenge/${challenge.id}`}>
          <Button 
            size="default" 
            className={cn(
                "gap-2 font-medium",
                challenge.completed ? "bg-green-600 hover:bg-green-700 text-white" : "text-black"
            )}
          >
            {challenge.completed ? (
                <>
                    Review Solution <CheckCircle className="h-4 w-4" />
                </>
            ) : (
                <>
                    Start Challenge <ArrowRight className="h-4 w-4" />
                </>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
