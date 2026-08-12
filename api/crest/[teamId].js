import { getTeam, getCrest, methodNotAllowed } from "../_lib/server.js"

export default async function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const { teamId } = req.query
    const team = getTeam(teamId)
    if (!team) return res.status(404).json({ error: `No team with id "${teamId}"` })

    const png = await getCrest(team.crestId)
    if (!png) return res.status(404).json({ error: `No crest available for "${team.id}"` })

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=604800, immutable")
    res.send(png)
}
