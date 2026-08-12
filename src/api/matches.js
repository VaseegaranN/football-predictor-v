import { request } from "@/api/client"

export function getMatches(params) {
  const qs = new URLSearchParams()
  if (params?.league) qs.set("league", params.league)
  if (params?.status) qs.set("status", params.status)
  if (params?.q) qs.set("q", params.q)
  if (params?.team) qs.set("team", params.team)

  const suffix = qs.toString() ? `?${qs.toString()}` : ""
  return request(`/api/matches${suffix}`)
}

export function getMatch(id) {
  return request(`/api/matches/${id}`)
}

export function getTeams() {
  return request("/api/teams")
}

export function getTeam(id) {
  return request(`/api/teams/${id}`)
}

export function getPrediction(id) {
  return request(`/api/predict/${id}`)
}
