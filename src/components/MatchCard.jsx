import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const kickoffFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function TeamSide({ team, align }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${align === "away" ? "justify-end" : ""}`}
    >
      {align === "home" && <Crest team={team} />}
      <span className="truncate font-medium">{team.name}</span>
      {align === "away" && <Crest team={team} />}
    </div>
  )
}

function Crest({ team }) {
  return (
    <img
      src={team.crest}
      alt={`${team.name} crest`}
      className="size-6 rounded-full ring-1 ring-foreground/10"
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
    />
  )
}

function Score({ match }) {
  if (match.status === "finished" && match.score) {
    return (
      <span className="text-lg font-semibold tabular-nums">
        {match.score.home} - {match.score.away}
      </span>
    )
  }
  return <span className="text-lg font-semibold text-muted-foreground">vs</span>
}

function Kickoff({ kickoff }) {
  return (
    <span className="text-xs text-muted-foreground">
      {kickoffFormat.format(new Date(kickoff))}
    </span>
  )
}

function MatchCard({ match }) {
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
            <Kickoff kickoff={match.kickoff} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamSide team={match.home} align="home" />
            <Score match={match} />
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

export default MatchCard
