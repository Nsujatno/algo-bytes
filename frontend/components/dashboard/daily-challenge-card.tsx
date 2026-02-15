import Link from "next/link"
import { ArrowRight, Calendar, Flame } from "lucide-react"

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
}

export function DailyChallengeCard({ streak }: DailyChallengeCardProps) {
  return (
    <Card className="w-full max-w-2xl border-border bg-surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="yellow" className="mb-2">
            Today's Challenge
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Feb 14, 2026</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Reverse Linked List
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Master the fundamentals of pointer manipulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Badge variant="easy">Easy</Badge>
          <Badge variant="outline">Linked Lists</Badge>
          <Badge variant="outline">Code Assembler</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex items-center gap-2 text-yellow-500">
          <Flame className="h-5 w-5 fill-current" />
          <span className="font-bold">{streak} day streak</span>
        </div>
        <Button size="default" className="gap-2 text-black font-medium">
          Start Challenge <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
