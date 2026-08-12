import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getMatch, getPrediction } from "@/api/matches"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { usePredictions } from "@/hooks/PredictionsProvider"

const kickoffFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function MatchDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-40" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  )
}

function WinProbabilities({ probabilities, home, away }) {
  const segments = [
    { label: home.short, value: probabilities.home, color: "bg-emerald-500" },
    { label: "Draw", value: probabilities.draw, color: "bg-muted-foreground/40" },
    { label: away.short, value: probabilities.away, color: "bg-sky-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win probabilities</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={segment.color}
              style={{ width: `${segment.value}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-foreground/10">{""}</span>
              <span className="font-medium">{segment.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {segment.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExpectedGoals({ expectedGoals, home, away }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected goals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{home.short}</span>
          <span className="text-sm font-medium text-foreground">
            {expectedGoals.home.toFixed(2)} - {expectedGoals.away.toFixed(2)}
          </span>
          <span className="font-medium">{away.short}</span>
        </div>
        <Progress value={(expectedGoals.home / 3.5) * 100} />
        <Progress value={(expectedGoals.away / 3.5) * 100} />
      </CardContent>
    </Card>
  )
}

function PredictedScoreline({ scoreline, home, away }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicted scoreline</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-3">
        <img
          src={home.crest}
          alt={`${home.name} crest`}
          className="size-8 rounded-full ring-1 ring-foreground/10"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <p className="text-2xl font-semibold tabular-nums">
          {scoreline.home} - {scoreline.away}
        </p>
        <img
          src={away.crest}
          alt={`${away.name} crest`}
          className="size-8 rounded-full ring-1 ring-foreground/10"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </CardContent>
    </Card>
  )
}

const FACTOR_ORDER = [
  "Home advantage",
  "Squad rating",
  "Recent form",
  "Head to head",
  "Defensive record",
]

function MatchFactors({ factors }) {
  const byLabel = Object.fromEntries(factors.map((factor) => [factor.label, factor]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match factors</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {FACTOR_ORDER.map((label) => {
          const factor = byLabel[label]
          if (!factor) return null
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{factor.weight}</span>
              </div>
              <Progress value={factor.weight} />
              <span className="text-xs text-muted-foreground">{factor.detail}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function MatchDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const { pickFor, save, remove } = usePredictions()
  const currentPick = pickFor(id)

  const match = data?.matchId === id ? data.match : null
  const prediction = data?.matchId === id ? data.prediction : null

  useEffect(() => {
    let cancelled = false

    Promise.all([getMatch(id), getPrediction(id)])
      .then(([matchData, predictionData]) => {
        if (cancelled) return
        setData({ matchId: id, match: matchData, prediction: predictionData })
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load match")
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <Alert variant="destructive">
          <AlertTitle>Match not found</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link
          to="/"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to matches
        </Link>
      </div>
    )
  }

  if (!match || !prediction) {
    return <MatchDetailSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to matches
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{match.league}</span>
            <Badge variant={match.status === "finished" ? "secondary" : "outline"}>
              {match.stage}
            </Badge>
          </CardTitle>
          <CardDescription>
            {kickoffFormat.format(new Date(match.kickoff))} · {match.venue}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <img
                src={match.home.crest}
                alt={`${match.home.name} crest`}
                className="size-10 rounded-full ring-1 ring-foreground/10"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className="font-medium">{match.home.name}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <img
                src={match.away.crest}
                alt={`${match.away.name} crest`}
                className="size-10 rounded-full ring-1 ring-foreground/10"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className="font-medium">{match.away.name}</span>
            </div>
          </div>

          {match.status === "finished" && match.score ? (
            <p className="text-center text-lg font-semibold tabular-nums">
              {match.score.home} - {match.score.away}
            </p>
          ) : (
            <p className="text-center text-lg font-semibold text-muted-foreground">vs</p>
          )}

          <div className="rounded-lg border bg-muted/50 px-4 py-3">
            <h2 className="text-sm font-medium">Why the model picked this</h2>
            <p className="mt-1 text-sm text-muted-foreground">{prediction.rationale}</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Your prediction</h2>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => save({ matchId: id, pick: "home", modelPick: prediction.pick })}
                variant={currentPick?.pick === "home" ? "default" : "outline"}
              >
                {match.home.short}
              </Button>
              <Button
                onClick={() => save({ matchId: id, pick: "draw", modelPick: prediction.pick })}
                variant={currentPick?.pick === "draw" ? "default" : "outline"}
              >
                Draw
              </Button>
              <Button
                onClick={() => save({ matchId: id, pick: "away", modelPick: prediction.pick })}
                variant={currentPick?.pick === "away" ? "default" : "outline"}
              >
                {match.away.short}
              </Button>
            </div>
            {currentPick && (
              <Button variant="ghost" onClick={() => remove(id)}>
                Clear Pick
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <WinProbabilities
        probabilities={prediction.probabilities}
        home={match.home}
        away={match.away}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ExpectedGoals
          expectedGoals={prediction.expectedGoals}
          home={match.home}
          away={match.away}
        />
        <PredictedScoreline
          scoreline={prediction.scoreline}
          home={match.home}
          away={match.away}
        />
      </div>

      <MatchFactors factors={prediction.factors} />
    </div>
  )
}

export default MatchDetail
