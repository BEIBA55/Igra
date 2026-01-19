import { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext()

export function useGame() {
  return useContext(GameContext)
}

export function GameProvider({ children }) {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('teams')
    return saved ? JSON.parse(saved) : []
  })
  
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('scores')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores))
  }, [scores])

  const addTeam = (name) => {
    if (teams.length < 10 && !teams.includes(name)) {
      setTeams([...teams, name])
      setScores({ ...scores, [name]: 0 })
    }
  }

  const removeTeam = (name) => {
    setTeams(teams.filter(t => t !== name))
    const newScores = { ...scores }
    delete newScores[name]
    setScores(newScores)
  }

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

  const resetAll = () => {
    setTeams([])
    setScores({})
  }

  return (
    <GameContext.Provider value={{
      teams,
      scores,
      addTeam,
      removeTeam,
      addScore,
      resetScores,
      resetAll
    }}>
      {children}
    </GameContext.Provider>
  )
}

