import { useState } from 'react'
import { useGame } from '../context/GameContext'
import './Scoreboard.css'

function Scoreboard() {
  const { teams, scores } = useGame()
  const [isOpen, setIsOpen] = useState(false)

  if (teams.length === 0) return null

  const sortedTeams = [...teams].sort((a, b) => (scores[b] || 0) - (scores[a] || 0))

  return (
    <>
      {/* Кнопка для открытия табло на мобильных */}
      <button 
        className="scoreboard-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть табло"
      >
        🏆 Табло
      </button>

      {/* Модальное окно для мобильных */}
      <div 
        className={`scoreboard-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <div className="scoreboard-modal" onClick={(e) => e.stopPropagation()}>
          <div className="scoreboard-header">
            <h2>Табло</h2>
            <button 
              className="scoreboard-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <div className="scoreboard-list">
            {sortedTeams.map((team, index) => (
              <div key={team} className={`score-item ${index === 0 ? 'winner' : ''}`}>
                <span className="team-name">{team}</span>
                <span className="team-score">{scores[team] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Обычное табло для десктопа */}
      <div className="scoreboard scoreboard-desktop">
        <h2>Табло</h2>
        <div className="scoreboard-list">
          {sortedTeams.map((team, index) => (
            <div key={team} className={`score-item ${index === 0 ? 'winner' : ''}`}>
              <span className="team-name">{team}</span>
              <span className="team-score">{scores[team] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Scoreboard

