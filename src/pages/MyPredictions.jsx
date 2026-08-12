import { useEffect, useState } from "react"

import { getMatches } from "@/api/matches"
import PredictionMatchCard from "@/components/PredictionMatchCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { usePredictions } from "@/hooks/PredictionsProvider"

function MyPredictions() {
  const { predictions } = usePredictions()
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const pickedIds = new Set(predictions.map((pick) => pick.matchId))
  const pickedMatches = matches.filter((match) => pickedIds.has(match.id))

  useEffect(() => {
    let cancelled = false

    getMatches()
      .then((data) => {
        if (cancelled) return
        setMatches(data.matches)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load matches")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Predictions</h1>
        <p className="text-sm text-muted-foreground">Your picks for upcoming fixtures</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : pickedMatches.length === 0 ? (
        <Alert>
          <AlertTitle>No predictions yet</AlertTitle>
          <AlertDescription>
            You haven't made any predictions. Browse the matches page to pick your first one.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          {pickedMatches.map((match) => (
            <PredictionMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPredictions
