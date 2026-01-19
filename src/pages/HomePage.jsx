import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { teams, scores } = useGame()

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
          <h2>Команды ({teams.length})</h2>
          <div className="teams-list">
            {teams.map(team => (
              <div key={team} className="team-item">
                <span>{team}</span>
                <span className="team-score">{scores[team] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="games-section">
          <h2>Выберите игру</h2>
          <div className="games-grid">
            {games.map(game => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => navigate(game.path)}
              >
                <div className="game-icon">{game.icon}</div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

