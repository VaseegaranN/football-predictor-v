import { MATCHES, serializeMatch, methodNotAllowed } from "../_lib/server.js"

export default function handler(req, res) {
    if (req.method !== "GET") return methodNotAllowed(res)

    const { id } = req.query
    const match = MATCHES.find((m) => m.id === id)
    if (!match) return res.status(404).json({ error: `No match with id "${id}"` })

    res.status(200).json(serializeMatch(match))
}
