import { TEAMS, LEAGUES, teamSummary, methodNotAllowed } from "./_lib/server.js"

export default function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const rows = TEAMS.map((team) => ({
        ...teamSummary(team),
        country: team.country,
        stadium: team.stadium,
        lastSeason: team.lastSeason,
    })).sort((a, b) => b.rating - a.rating)

    res.status(200).json({ count: rows.length, leagues: LEAGUES, teams: rows })
}
