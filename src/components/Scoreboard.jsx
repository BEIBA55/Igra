import { useGame } from '../context/GameContext'
import './Scoreboard.css'

function Scoreboard() {
  const { teams, scores } = useGame()

  if (teams.length === 0) return null

  const sortedTeams = [...teams].sort((a, b) => (scores[b] || 0) - (scores[a] || 0))

  return (
    <div className="scoreboard">
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
  )
}

export default Scoreboard

