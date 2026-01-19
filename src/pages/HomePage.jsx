import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { teams, addTeam, removeTeam, resetAll } = useGame()
  const [newTeamName, setNewTeamName] = useState('')

  const handleAddTeam = () => {
    if (newTeamName.trim() && teams.length < 10) {
      addTeam(newTeamName.trim())
      setNewTeamName('')
    }
  }

  const games = [
    {
      id: 'drawing',
      name: 'Рисовалка',
      description: 'Одна команда рисует, остальные угадывают',
      icon: '🎨',
      path: '/drawing'
    }
  ]

  return (
    <div className="home-page">
      <div className="container">
        <h1 className="title">🎮 Командные Игры</h1>
        
        <div className="teams-section">
          <h2>Команды ({teams.length}/10)</h2>
          <div className="team-input">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
              placeholder="Название команды"
              maxLength={20}
              disabled={teams.length >= 10}
            />
            <button onClick={handleAddTeam} disabled={teams.length >= 10 || !newTeamName.trim()}>
              Добавить
            </button>
          </div>
          
          <div className="teams-list">
            {teams.map(team => (
              <div key={team} className="team-item">
                <span>{team}</span>
                <button onClick={() => removeTeam(team)}>✕</button>
              </div>
            ))}
          </div>
          
          {teams.length > 0 && (
            <button className="reset-btn" onClick={resetAll}>
              Сбросить все команды
            </button>
          )}
        </div>

        <div className="games-section">
          <h2>Выберите игру</h2>
          <div className="games-grid">
            {games.map(game => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => teams.length > 0 && navigate(game.path)}
                style={{ opacity: teams.length === 0 ? 0.5 : 1, cursor: teams.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                <div className="game-icon">{game.icon}</div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
              </div>
            ))}
          </div>
        </div>

        {teams.length === 0 && (
          <div className="warning">
            ⚠️ Добавьте хотя бы одну команду для начала игры
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage

