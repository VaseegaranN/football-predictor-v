import { MATCHES, getTeam, methodNotAllowed, aiRationale, predictMatch } from "../../_lib/server.js"

export default async function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const { id } = req.query
    const match = MATCHES.find((m) => m.id === id)
    if (!match) return res.status(404).json({ error: `No match with id "${id}"` })

    const prediction = predictMatch(match)
    const home = getTeam(match.homeId)
    const away = getTeam(match.awayId)

    const written = await aiRationale({ home, away, match, prediction })
    if (written) {
        prediction.rationale = written
        prediction.rationaleSource = "ai"
    }

    res.status(200).json(prediction)
}
