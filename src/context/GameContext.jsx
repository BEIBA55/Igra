import { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext()

export function useGame() {
  return useContext(GameContext)
}

// 10 команд по умолчанию
const DEFAULT_TEAMS = [
  'Команда 1',
  'Команда 2',
  'Команда 3',
  'Команда 4',
  'Команда 5',
  'Команда 6',
  'Команда 7',
  'Команда 8',
  'Команда 9',
  'Команда 10'
]

export function GameProvider({ children }) {
  const [teams] = useState(DEFAULT_TEAMS)
  
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('scores')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    // Инициализируем очки для всех команд
    setScores(prevScores => {
      const newScores = { ...prevScores }
      teams.forEach(team => {
        if (!(team in newScores)) {
          newScores[team] = 0
        }
      })
      return newScores
    })
  }, [teams])

  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores))
  }, [scores])

  const addScore = (teamName, points) => {
    setScores(prev => ({
      ...prev,
      [teamName]: (prev[teamName] || 0) + points
    }))
  }

  const resetScores = () => {
    const newScores = {}
    teams.forEach(team => {
      newScores[team] = 0
    })
    setScores(newScores)
  }

  return (
    <GameContext.Provider value={{
      teams,
      scores,
      addScore,
      resetScores
    }}>
      {children}
    </GameContext.Provider>
  )
}

