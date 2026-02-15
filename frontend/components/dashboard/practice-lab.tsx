"use client"

import { Lock, Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const challenges = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays",
    status: "completed",
  },
  {
    id: 2,
    title: "Valid Palindrome",
    difficulty: "easy",
    category: "Two Pointers",
    status: "available",
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    category: "Linked Lists",
    status: "available",
  },
  {
    id: 4,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    category: "Arrays",
    status: "locked",
  },
  {
    id: 5,
    title: "Two Sum II",
    difficulty: "medium",
    category: "Two Pointers",
    status: "locked",
  },
  {
    id: 6,
    title: "Contains Duplicate",
    difficulty: "easy",
    category: "Arrays",
    status: "locked",
  },
]

export function PracticeLab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 overflow-x-auto">
        <Badge variant="yellow" className="cursor-pointer">
          All
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Arrays
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Two Pointers
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Linked Lists
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
                  variant={challenge.difficulty as "easy" | "medium" | "hard"}
                  className="capitalize"
                >
                  {challenge.difficulty}
                </Badge>
                {challenge.status === "locked" && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-lg font-medium leading-none mt-3">
                {challenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {challenge.category}
              </div>
            </CardContent>
            <CardFooter>
              {challenge.status === "completed" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-default text-green-500 hover:text-green-500"
                >
                  Completed
                </Button>
              ) : challenge.status === "locked" ? (
                <Button variant="outline" size="sm" className="w-full opacity-50" disabled>
                  Locked (1 ⭐)
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full gap-2 text-black"
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
