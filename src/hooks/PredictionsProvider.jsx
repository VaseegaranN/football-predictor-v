import { createContext, useContext, useEffect, useMemo, useReducer } from "react"

import { predictionsReducer } from "@/hooks/predictionsReducer"

const PredictionsContext = createContext(null)

const STORAGE_KEY = "fifa-predictions"

function initPredictions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore invalid JSON or storage access errors
  }
  return []
}

function PredictionsProvider({ children }) {
  const [predictions, dispatch] = useReducer(predictionsReducer, undefined, initPredictions)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions))
  }, [predictions])

  const value = useMemo(
    () => ({
      predictions,
      save: (payload) => dispatch({ type: "save", ...payload }),
      remove: (matchId) => dispatch({ type: "remove", matchId }),
      clear: () => dispatch({ type: "clear" }),
      pickFor: (matchId) =>
        predictions.find((pick) => pick.matchId === matchId) ?? null,
    }),
    [predictions]
  )

  return (
    <PredictionsContext.Provider value={value}>
      {children}
    </PredictionsContext.Provider>
  )
}

function usePredictions() {
  const context = useContext(PredictionsContext)
  if (!context) {
    throw new Error("usePredictions must be used within a PredictionsProvider")
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { PredictionsProvider, usePredictions }
