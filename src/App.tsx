import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopPage from './pages/TopPage'
import WaitingRoom from './pages/WaitingRoom'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'
import LiquidGlassFilter from './components/LiquidGlassFilter'

export default function App() {
  return (
    <>
      <LiquidGlassFilter />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/room/:code" element={<WaitingRoom />} />
          <Route path="/room/:code/game" element={<GamePage />} />
          <Route path="/room/:code/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
