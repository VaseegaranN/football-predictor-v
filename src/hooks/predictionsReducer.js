export function predictionsReducer(state, action) {
  switch (action.type) {
    case "save": {
      const savedAt = action.savedAt ?? Date.now()
      const withoutMatch = state.filter((pick) => pick.matchId !== action.matchId)
      const savedPick = {
        matchId: action.matchId,
        pick: action.pick,
        modelPick: action.modelPick,
        savedAt,
      }
      return [savedPick, ...withoutMatch]
    }
    case "remove": {
      return state.filter((pick) => pick.matchId !== action.matchId)
    }
    case "clear": {
      return []
    }
    default: {
      throw new Error(`Unknown action type: ${action.type}`)
    }
  }
}
