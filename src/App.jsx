import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DrawingModeSelect from './pages/DrawingModeSelect'
import DrawingGame from './pages/DrawingGame'
import Scoreboard from './components/Scoreboard'
import { GameProvider } from './context/GameContext'
import './App.css'

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="app">
          <Scoreboard />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drawing" element={<DrawingModeSelect />} />
            <Route path="/drawing/game" element={<DrawingGame />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  )
}

export default App

