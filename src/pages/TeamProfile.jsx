import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Gauge, MapPin, User } from "lucide-react"

import { getTeam } from "@/api/matches"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getMockSquad } from "@/data/squads"

const kickoffFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function calculateForm(teamId, matches) {
  return matches
    .filter((match) => match.status === "finished" && match.score)
    .sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff))
    .slice(0, 5)
    .map((match) => {
      const isHome = match.home.id === teamId
      const teamScore = isHome ? match.score.home : match.score.away
      const opponentScore = isHome ? match.score.away : match.score.home
      if (teamScore > opponentScore) return "W"
      if (teamScore < opponentScore) return "L"
      return "D"
    })
}

function TeamProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}

function FormGuide({ results }) {
  const badgeClass = {
    W: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    D: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    L: "bg-red-500/15 text-red-700 dark:text-red-400",
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {results.map((result, i) => (
        <Badge key={i} className={badgeClass[result] ?? "bg-muted text-muted-foreground"}>
          {result}
        </Badge>
      ))}
    </div>
  )
}

function LastSeasonStat({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function matchInfo(match, teamId) {
  const isHome = match.home.id === teamId
  const opponent = isHome ? match.away : match.home
  const teamScore = isHome ? match.score.home : match.score.away
  const opponentScore = isHome ? match.score.away : match.score.home
  return { opponent, teamScore, opponentScore }
}

function ResultRow({ match, teamId }) {
  const { opponent, teamScore, opponentScore } = matchInfo(match, teamId)

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      <img
        src={opponent.crest}
        alt={`${opponent.name} crest`}
        className="size-8 rounded-full ring-1 ring-foreground/10"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">vs {opponent.name}</p>
        <p className="text-xs text-muted-foreground">
          {kickoffFormat.format(new Date(match.kickoff))}
        </p>
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {teamScore} - {opponentScore}
      </span>
    </div>
  )
}

function FixtureRow({ match, teamId }) {
  const isHome = match.home.id === teamId
  const opponent = isHome ? match.away : match.home
  const predicted =
    match.model.pick === "home"
      ? match.home.short
      : match.model.pick === "away"
        ? match.away.short
        : "Draw"

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      <img
        src={opponent.crest}
        alt={`${opponent.name} crest`}
        className="size-8 rounded-full ring-1 ring-foreground/10"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">vs {opponent.name}</p>
        <p className="text-xs text-muted-foreground">
          {kickoffFormat.format(new Date(match.kickoff))}
        </p>
      </div>
      <Badge className="bg-foreground text-background">{predicted}</Badge>
    </div>
  )
}

function PlayerCard({ player }) {
  return (
    <Card className="flex flex-col items-center p-4 bg-card hover:bg-accent transition-colors relative overflow-hidden">
      {/* Rating Badge - Top Right */}
      <div className="absolute top-2 right-2">
        <Badge className="font-bold" variant="default">{player.rating}</Badge>
      </div>
      
      {/* National Flag - Top Left */}
      <div className="absolute top-2 left-2 text-xl" title="Nationality">
        {player.flag}
      </div>

      {/* Player Portrait */}
      <div className="w-24 h-24 mt-6 mb-2 relative flex items-center justify-center">
        {player.imageUrl ? (
          <img 
            src={player.imageUrl} 
            alt={player.name}
            className="w-full h-full object-contain drop-shadow-md"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Photo</span>
          </div>
        )}
      </div>

      {/* Player Name and Position */}
      <div className="mt-auto pt-3 w-full text-center border-t border-border">
        <p className="font-bold text-sm uppercase truncate w-full tracking-wide" title={player.name}>
          {player.name}
        </p>
        <p className="text-xs text-muted-foreground font-medium">{player.position}</p>
      </div>
    </Card>
  )
}

function TeamProfile() {
  const { id } = useParams()
  const [team, setTeam] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getTeam(id)
      .then((data) => {
        if (cancelled) return
        setTeam(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load team")
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <Alert variant="destructive">
          <AlertTitle>Team not found</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link
          to="/teams"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to teams
        </Link>
      </div>
    )
  }

  if (!team || team.id !== id) {
    return <TeamProfileSkeleton />
  }

  const { lastSeason } = team

  const formResults = calculateForm(id, team.results)
  const squad = getMockSquad(id)

  const lastSeasonStats = [
    { label: "Position", value: lastSeason.position },
    { label: "Played", value: lastSeason.played },
    {
      label: "Record",
      value: `${lastSeason.won}W ${lastSeason.drawn}D ${lastSeason.lost}L`,
    },
    { label: "Goals for", value: lastSeason.gf },
    { label: "Goals against", value: lastSeason.ga },
    { label: "Rating", value: team.rating },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/teams"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to teams
      </Link>

      <div className="flex flex-col items-center gap-3 text-center">
        <img
          src={team.crest}
          alt={`${team.name} crest`}
          className="size-20 rounded-full ring-1 ring-foreground/10"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
        <p className="-mt-2 text-sm text-muted-foreground">{team.country}</p>
        <FormGuide results={formResults} />
        <Separator className="my-2 max-w-lg" />
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {team.stadium}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <User className="size-4" aria-hidden />
            {team.manager}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="size-4" aria-hidden />
            Rating {team.rating}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Last season</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {lastSeasonStats.map((stat) => (
            <LastSeasonStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent results</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {team.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent results.</p>
            ) : (
              team.results.map((match) => (
                <ResultRow key={match.id} match={match} teamId={id} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming fixtures</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {team.fixtures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>
            ) : (
              team.fixtures.map((match) => (
                <FixtureRow key={match.id} match={match} teamId={id} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Player Roster & Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {squad.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamProfile