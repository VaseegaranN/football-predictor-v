import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getPrediction } from "@/api/matches"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const kickoffFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function Crest({ team, size }) {
  return (
    <img
      src={team.crest}
      alt={`${team.name} crest`}
      className={`${size} rounded-full ring-1 ring-foreground/10`}
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
    />
  )
}

function TeamSide({ team, align, showCrest = true }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "away" ? "justify-end" : ""
      }`}
    >
      {align === "home" && showCrest && <Crest team={team} size="size-6" />}
      <span className="truncate font-medium">{team.name}</span>
      {align === "away" && showCrest && <Crest team={team} size="size-6" />}
    </div>
  )
}

function PredictionMatchCard({ match }) {
  const [scoreline, setScoreline] = useState(null)

  useEffect(() => {
    let cancelled = false

    getPrediction(match.id)
      .then((data) => {
        if (cancelled) return
        setScoreline(data.scoreline)
      })

    return () => {
      cancelled = true
    }
  }, [match.id])

  const pickLabel =
    match.model.pick === "home"
      ? match.home.short
      : match.model.pick === "away"
        ? match.away.short
        : "Draw"

  return (
    <Link to={`/match/${match.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <Badge variant={match.status === "finished" ? "secondary" : "outline"}>
              {match.league}
            </Badge>
            <span className="text-sm font-medium">{match.stage}</span>
          </CardTitle>
          <CardDescription>
            {kickoffFormat.format(new Date(match.kickoff))}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamSide team={match.home} align="home" />
            {scoreline ? (
              <span className="text-lg font-semibold tabular-nums">
                {scoreline.home} - {scoreline.away}
              </span>
            ) : (
              <Skeleton className="h-6 w-10" />
            )}
            <TeamSide team={match.away} align="away" />
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>
              Model: <span className="font-medium text-foreground">{pickLabel}</span>
            </span>
            <span className="capitalize">{match.model.confidence}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PredictionMatchCard