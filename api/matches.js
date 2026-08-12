import { MATCHES, LEAGUES, serializeMatch, methodNotAllowed } from "./_lib/server.js"

export default function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const url = new URL(req.url, "http://localhost")
    const league = url.searchParams.get("league")
    const status = url.searchParams.get("status")
    const q = url.searchParams.get("q")
    const team = url.searchParams.get("team")

    let rows = MATCHES.map(serializeMatch)

    if (league && league !== "all") rows = rows.filter((m) => m.league === league)
    if (status && status !== "all") rows = rows.filter((m) => m.status === status)
    if (team) rows = rows.filter((m) => m.home.id === team || m.away.id === team)
    if (q) {
        const needle = String(q).toLowerCase()
        rows = rows.filter(
            (m) =>
                m.home.name.toLowerCase().includes(needle) ||
                m.away.name.toLowerCase().includes(needle) ||
                m.league.toLowerCase().includes(needle),
        )
    }

    rows.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    res.status(200).json({ count: rows.length, leagues: LEAGUES, matches: rows })
}
