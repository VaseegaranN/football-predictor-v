import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import Matches from './pages/Matches.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import Teams from './pages/Teams.jsx'
import TeamProfile from './pages/TeamProfile.jsx'
import MyPredictions from './pages/MyPredictions.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Matches />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamProfile />} />
        <Route path="/my-predictions" element={<MyPredictions />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
