import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"

import { getTeams } from "@/api/matches"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function TeamCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  )
}

function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="flex-row items-start justify-between gap-2">
          <Badge variant="secondary">{team.league}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Favorite ${team.name}`}
            onClick={(e) => e.preventDefault()}
          >
            <Star className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-1">
          <img
            src={team.crest}
            alt={`${team.name} crest`}
            className="size-16 rounded-full ring-1 ring-foreground/10"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <span className="mt-2 font-bold">{team.name}</span>
          <span className="text-sm text-muted-foreground">{team.country}</span>
          <span className="mt-3 text-xs text-muted-foreground">
            Rating {team.rating} • Form {team.formPoints}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function Teams() {
  const [teams, setTeams] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getTeams()
      .then((data) => {
        if (cancelled) return
        setTeams(data.teams)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load teams")
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
        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">Browse the clubs in our data</p>
      </div>

      {loading ? (
        <TeamCardSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Teams