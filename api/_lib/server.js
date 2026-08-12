import { TEAMS, LEAGUES, getTeam } from "../../server/data/teams.js"
import { MATCHES, resultOf } from "../../server/data/matches.js"
import { predictMatch } from "../../server/predict.js"
import { aiEnabled, aiRationale } from "../../server/ai.js"
import { getCrest } from "../../server/crests.js"

export { TEAMS, LEAGUES, MATCHES, getTeam, predictMatch }
export { aiEnabled, aiRationale, getCrest }

export function methodNotAllowed(res, allowed = ["GET"]) {
    res.setHeader("Allow", allowed.join(", "))
    return res.status(405).json({ error: "Method not allowed" })
}

export function teamSummary(team) {
    return {
        id: team.id,
        name: team.name,
        short: team.short,
        monogram: team.monogram,
        color: team.color,
        crest: `/api/crest/${team.id}`,
        league: team.league,
        rating: team.rating,
        form: team.form,
        formPoints: team.form.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0),
    }
}

export function serializeMatch(match) {
    const home = getTeam(match.homeId)
    const away = getTeam(match.awayId)
    const prediction = predictMatch(match)

    return {
        id: match.id,
        league: match.league,
        stage: match.stage,
        kickoff: match.kickoff,
        venue: home.stadium,
        status: match.status,
        score: match.score,
        result: resultOf(match),
        home: teamSummary(home),
        away: teamSummary(away),
        model: {
            pick: prediction.pick,
            confidence: prediction.confidence,
            probabilities: prediction.probabilities,
        },
    }
}

export function serializeTeam(team) {
    const played = MATCHES.filter(
        (m) => (m.homeId === team.id || m.awayId === team.id) && m.status === "finished",
    ).map(serializeMatch)

    const upcoming = MATCHES.filter(
        (m) => (m.homeId === team.id || m.awayId === team.id) && m.status === "upcoming",
    ).map(serializeMatch)

    return {
        ...teamSummary(team),
        country: team.country,
        stadium: team.stadium,
        manager: team.manager,
        lastSeason: team.lastSeason,
        results: played.sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff)),
        fixtures: upcoming.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
    }
}
