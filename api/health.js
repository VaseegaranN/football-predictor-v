import { TEAMS, LEAGUES, MATCHES, aiEnabled, methodNotAllowed } from "./_lib/server.js"

export default function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    res.status(200).json({
        ok: true,
        dataset: "synthetic",
        matches: MATCHES.length,
        teams: TEAMS.length,
        leagues: LEAGUES,
        aiRationale: aiEnabled() ? "enabled" : "template",
    })
}
