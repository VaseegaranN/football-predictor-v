import { getTeam, serializeTeam, methodNotAllowed } from "../_lib/server.js"

export default function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const { id } = req.query
    const team = getTeam(id)
    if (!team) return res.status(404).json({ error: `No team with id "${id}"` })

    res.status(200).json(serializeTeam(team))
}
