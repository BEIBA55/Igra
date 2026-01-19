import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './DrawingGame.css'

// Исправляем маршрут для игроков

function DrawingGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'host' // 'host' или 'player'
  const roomCode = searchParams.get('room') || generateRoomCode()
  
  const { teams, addScore } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  const [customWord, setCustomWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [teamAnswers, setTeamAnswers] = useState({})
  const [selectedTeam, setSelectedTeam] = useState('')
  const [playerAnswer, setPlayerAnswer] = useState('')
  const [round, setRound] = useState(1)

  // Синхронизация через localStorage
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const gameState = localStorage.getItem(`game_${roomCode}`)
      if (gameState) {
        const state = JSON.parse(gameState)
        if (mode === 'player') {
          setCurrentWord(state.currentWord || '')
          setIsPlaying(state.isPlaying || false)
          setTimeLeft(state.timeLeft || 0)
        } else {
          setTeamAnswers(state.teamAnswers || {})
        }
      }
    }, 1000)

    return () => clearInterval(syncInterval)
  }, [roomCode, mode])

  // Таймер для ведущего
  useEffect(() => {
    if (mode === 'host' && isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1
        setTimeLeft(newTime)
        updateGameState({ timeLeft: newTime })
        if (newTime === 0) {
          setIsPlaying(false)
          updateGameState({ isPlaying: false })
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isPlaying, mode])

  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  function updateGameState(updates) {
    const currentState = JSON.parse(localStorage.getItem(`game_${roomCode}`) || '{}')
    const newState = { ...currentState, ...updates }
    localStorage.setItem(`game_${roomCode}`, JSON.stringify(newState))
  }

  const startRound = (word) => {
    const wordToUse = word || customWord
    if (!wordToUse.trim()) return

    setCurrentWord(wordToUse)
    setIsPlaying(true)
    setTimeLeft(90)
    setTeamAnswers({})
    setCustomWord('')
    
    updateGameState({
      currentWord: wordToUse,
      isPlaying: true,
      timeLeft: 90,
      teamAnswers: {}
    })
  }

  const handlePlayerSubmit = () => {
    if (!selectedTeam || !playerAnswer.trim()) return

    const currentState = JSON.parse(localStorage.getItem(`game_${roomCode}`) || '{}')
    const answers = currentState.teamAnswers || {}
    answers[selectedTeam] = playerAnswer.trim()
    
    updateGameState({ teamAnswers: answers })
    setTeamAnswers(answers)
    setPlayerAnswer('')
  }

  const handleAcceptAnswer = (teamName) => {
    addScore(teamName, 10) // Можно сделать разные очки
    const newAnswers = { ...teamAnswers }
    delete newAnswers[teamName]
    setTeamAnswers(newAnswers)
    updateGameState({ teamAnswers: newAnswers })
  }

  const handleRejectAnswer = (teamName) => {
    const newAnswers = { ...teamAnswers }
    delete newAnswers[teamName]
    setTeamAnswers(newAnswers)
    updateGameState({ teamAnswers: newAnswers })
  }

  const endRound = () => {
    setIsPlaying(false)
    setCurrentWord('')
    updateGameState({
      isPlaying: false,
      currentWord: '',
      teamAnswers: {}
    })
  }

  const nextRound = () => {
    setRound(round + 1)
    setCurrentWord('')
    setIsPlaying(false)
    setTeamAnswers({})
    updateGameState({
      currentWord: '',
      isPlaying: false,
      teamAnswers: {},
      timeLeft: 0
    })
  }

  // Режим ведущего
  if (mode === 'host') {
    return (
      <div className="drawing-game">
        <div className="drawing-container host-container">
          <div className="drawing-header">
            <button onClick={() => navigate('/')} className="back-btn">← Назад</button>
            <div className="room-info">
              <h2>Комната: <span className="room-code">{roomCode}</span></h2>
              <p>Покажите этот код игрокам</p>
            </div>
            {isPlaying && (
              <div className="timer" style={{ color: timeLeft <= 15 ? '#f44336' : '#333' }}>
                ⏱️ {timeLeft}с
              </div>
            )}
          </div>

          {!isPlaying && (
            <div className="host-controls">
              <div className="word-input-section">
                <h3>Введите слово для рисования</h3>
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder="Например: Кот, Дом, Самолет..."
                  className="word-input"
                  onKeyPress={(e) => e.key === 'Enter' && startRound()}
                />
                <button onClick={() => startRound()} className="start-btn" disabled={!customWord.trim()}>
                  Начать раунд
                </button>
              </div>

              {currentWord && (
                <div className="current-word-display">
                  <p>Текущее слово:</p>
                  <h2>{currentWord}</h2>
                </div>
              )}
            </div>
          )}

          {isPlaying && currentWord && (
            <div className="word-section">
              <div className="word-card">
                <h1 className="word-text">{currentWord}</h1>
                <p className="word-hint">Рисуйте это слово!</p>
              </div>

              <div className="answers-section">
                <h3>Ответы команд:</h3>
                {Object.keys(teamAnswers).length === 0 ? (
                  <p className="no-answers">Пока нет ответов</p>
                ) : (
                  <div className="answers-list">
                    {Object.entries(teamAnswers).map(([team, answer]) => (
                      <div key={team} className="answer-item">
                        <div className="answer-content">
                          <span className="answer-team">{team}:</span>
                          <span className="answer-text">{answer}</span>
                        </div>
                        <div className="answer-actions">
                          <button
                            onClick={() => handleAcceptAnswer(team)}
                            className="accept-btn"
                          >
                            ✓ Засчитать
                          </button>
                          <button
                            onClick={() => handleRejectAnswer(team)}
                            className="reject-btn"
                          >
                            ✕ Отклонить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="action-buttons">
                  <button onClick={endRound} className="end-round-btn">
                    Завершить раунд
                  </button>
                  <button onClick={nextRound} className="next-round-btn">
                    Следующий раунд
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Режим игрока
  return (
    <div className="drawing-game">
      <div className="drawing-container player-container">
        <div className="drawing-header">
          <button onClick={() => navigate('/drawing')} className="back-btn">← Назад</button>
          <div className="room-info">
            <h2>Комната: <span className="room-code">{roomCode}</span></h2>
          </div>
          {isPlaying && (
            <div className="timer" style={{ color: timeLeft <= 15 ? '#f44336' : '#333' }}>
              ⏱️ {timeLeft}с
            </div>
          )}
        </div>

        {!isPlaying && (
          <div className="waiting-screen">
            <h2>Ожидание начала раунда...</h2>
            <p>Ведущий скоро начнет игру</p>
          </div>
        )}

        {isPlaying && (
          <div className="player-section">
            <div className="drawing-prompt">
              <h2>🎨 Что рисует ведущий?</h2>
            </div>

            <div className="answer-form">
              <label>Выберите вашу команду:</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="team-select"
              >
                <option value="">Выберите команду</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>

              <label>Ваш ответ:</label>
              <input
                type="text"
                value={playerAnswer}
                onChange={(e) => setPlayerAnswer(e.target.value)}
                placeholder="Введите слово..."
                className="answer-input"
                onKeyPress={(e) => e.key === 'Enter' && handlePlayerSubmit()}
              />

              <button
                onClick={handlePlayerSubmit}
                className="submit-btn"
                disabled={!selectedTeam || !playerAnswer.trim()}
              >
                Отправить ответ
              </button>
            </div>

            {teamAnswers[selectedTeam] && (
              <div className="submitted-answer">
                <p>✓ Ваш ответ отправлен: <strong>{teamAnswers[selectedTeam]}</strong></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DrawingGame
