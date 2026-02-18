import { Logo } from "@/components/ui/logo"
import { MoreHorizontal, Star } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardHeaderProps {
  credits: number
  username: string | null
}

export function DashboardHeader({ credits, username }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8" />
        <span className="font-mono text-lg font-bold tracking-wider text-accent uppercase">
          AlgoBytes
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-sm font-medium text-yellow-500 border border-border cursor-help"
              >
                <Star className="h-4 w-4 fill-current" />
                <span>{credits}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Practice credits used to unlock challenges</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-3">
          {/* <div className="h-8 w-8 rounded-full bg-surface border border-border" /> */}
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">
            Hi, {username || "User"}
          </span>
          {/* <MoreHorizontal className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" /> */}
        </div>
      </div>
    </header>
  )
}
