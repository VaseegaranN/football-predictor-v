import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { getMatches } from "@/api/matches"
import MatchCard from "@/components/MatchCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

function MatchSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl border p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function Matches() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const league = searchParams.get("league") ?? "all"
  const status = searchParams.get("status") ?? "all"
  const q = searchParams.get("q") ?? ""
  const paramsKey = `${league}|${status}|${q}`
  const loading = result?.paramsKey !== paramsKey

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === "all") {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  useEffect(() => {
    let cancelled = false

    getMatches({
      league: league === "all" ? undefined : league,
      status: status === "all" ? undefined : status,
      q: q || undefined,
    })
      .then((data) => {
        if (cancelled) return
        setResult({ matches: data.matches, leagues: data.leagues, paramsKey })
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load matches")
      })

    return () => {
      cancelled = true
    }
  }, [league, status, q, paramsKey])

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
        <h1 className="text-2xl font-semibold tracking-tight">Matches</h1>
        <p className="text-sm text-muted-foreground">Filter by league, status, or search</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={league} onValueChange={(value) => setParam("league", value)}>
          <SelectTrigger className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All leagues</SelectItem>
            {(result?.leagues ?? []).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(value) => setParam("status", value)}>
          <SelectTrigger className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search teams or leagues…"
          className="w-56"
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
        />
      </div>

      {loading ? (
        <MatchSkeleton />
      ) : result.matches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches found.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {result.matches.length} fixture{result.matches.length === 1 ? "" : "s"}
          </p>
          <div className="flex flex-col gap-4">
            {result.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Matches
