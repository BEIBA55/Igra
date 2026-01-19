import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { getGameState, updateGameState } from '../utils/sync'
import './DrawingGame.css'

function DrawingGame() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'host'
  const roomCode = searchParams.get('room') || generateRoomCode()
  
  const { teams, addScore } = useGame()
  const [currentWord, setCurrentWord] = useState('')
  const [customWord, setCustomWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [teamAnswers, setTeamAnswers] = useState({})
  const [selectedTeam, setSelectedTeam] = useState(() => {
    // Загружаем выбранную команду из localStorage для этой комнаты
    if (mode === 'player') {
      return localStorage.getItem(`team_${roomCode}`) || ''
    }
    return ''
  })
  const [playerAnswer, setPlayerAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [isConnected, setIsConnected] = useState(true)
  const [hasSelectedTeam, setHasSelectedTeam] = useState(() => {
    // Проверяем, выбрал ли игрок команду
    if (mode === 'player') {
      return !!localStorage.getItem(`team_${roomCode}`)
    }
    return true
  })
  const lastUpdateRef = useRef(0)

  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Инициализация комнаты для ведущего
  useEffect(() => {
    if (mode === 'host') {
      // Создаем начальное состояние комнаты
      updateGameState(roomCode, {
        isPlaying: false,
        currentWord: '',
        timeLeft: 0,
        teamAnswers: {}
      }).catch(err => console.error('Failed to init room:', err))
    }
  }, [roomCode, mode])

  // Синхронизация через polling каждые 500ms
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const state = await getGameState(roomCode)
        
        // Обновляем состояние если есть изменения или это первая загрузка
        const hasUpdates = !state.lastUpdate || state.lastUpdate !== lastUpdateRef.current
        
        if (hasUpdates) {
          if (state.lastUpdate) {
            lastUpdateRef.current = state.lastUpdate
          }
          setIsConnected(true)
          
          if (mode === 'player') {
            if (state.currentWord !== undefined) setCurrentWord(state.currentWord || '')
            if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying)
            if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft)
            if (state.teamAnswers !== undefined) setTeamAnswers(state.teamAnswers || {})
          } else if (mode === 'host') {
            if (state.teamAnswers !== undefined) setTeamAnswers(state.teamAnswers || {})
            if (state.currentWord !== undefined) setCurrentWord(state.currentWord || '')
            if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying)
            if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft)
          }
        }
      } catch (error) {
        console.error('Sync error:', error)
        setIsConnected(false)
      }
    }, 500) // Проверяем каждые 500ms

    // Первая загрузка сразу
    getGameState(roomCode).then(state => {
      if (state.lastUpdate) {
        lastUpdateRef.current = state.lastUpdate
      }
      setIsConnected(true)
      
      if (mode === 'player') {
        if (state.currentWord !== undefined) setCurrentWord(state.currentWord || '')
        if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying)
        if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft)
        if (state.teamAnswers !== undefined) setTeamAnswers(state.teamAnswers || {})
      } else if (mode === 'host') {
        if (state.teamAnswers !== undefined) setTeamAnswers(state.teamAnswers || {})
        if (state.currentWord !== undefined) setCurrentWord(state.currentWord || '')
        if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying)
        if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft)
      }
    })

    return () => clearInterval(syncInterval)
  }, [roomCode, mode])

  // Таймер для ведущего
  useEffect(() => {
    if (mode === 'host' && isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1
        setTimeLeft(newTime)
        updateGameState(roomCode, { timeLeft: newTime })
        if (newTime === 0) {
          setIsPlaying(false)
          updateGameState(roomCode, { isPlaying: false })
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isPlaying, mode, roomCode])

  const startRound = async (word) => {
    const wordToUse = word || customWord
    if (!wordToUse.trim()) return

    setCurrentWord(wordToUse)
    setIsPlaying(true)
    setTimeLeft(90)
    setTeamAnswers({})
    setCustomWord('')
    
    await updateGameState(roomCode, {
      currentWord: wordToUse,
      isPlaying: true,
      timeLeft: 90,
      teamAnswers: {}
    })
  }

  const handleTeamSelect = (team) => {
    setSelectedTeam(team)
    localStorage.setItem(`team_${roomCode}`, team)
    setHasSelectedTeam(true)
  }

  const handlePlayerSubmit = async () => {
    if (!selectedTeam || !playerAnswer.trim()) return

    const currentState = await getGameState(roomCode)
    const answers = { ...(currentState.teamAnswers || {}), [selectedTeam]: playerAnswer.trim() }
    
    await updateGameState(roomCode, { teamAnswers: answers })
    setTeamAnswers(answers)
    setPlayerAnswer('')
  }

  const handleAcceptAnswer = async (teamName) => {
    addScore(teamName, 10)
    const currentState = await getGameState(roomCode)
    const newAnswers = { ...(currentState.teamAnswers || {}) }
    delete newAnswers[teamName]
    setTeamAnswers(newAnswers)
    await updateGameState(roomCode, { teamAnswers: newAnswers })
  }

  const handleRejectAnswer = async (teamName) => {
    const currentState = await getGameState(roomCode)
    const newAnswers = { ...(currentState.teamAnswers || {}) }
    delete newAnswers[teamName]
    setTeamAnswers(newAnswers)
    await updateGameState(roomCode, { teamAnswers: newAnswers })
  }

  const endRound = async () => {
    setIsPlaying(false)
    setCurrentWord('')
    await updateGameState(roomCode, {
      isPlaying: false,
      currentWord: '',
      teamAnswers: {}
    })
  }

  const nextRound = async () => {
    setRound(round + 1)
    setCurrentWord('')
    setIsPlaying(false)
    setTeamAnswers({})
    await updateGameState(roomCode, {
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
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Подключено' : '🔴 Не подключено'}
              </div>
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
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Подключено' : '🔴 Не подключено'}
            </div>
          </div>
          {isPlaying && (
            <div className="timer" style={{ color: timeLeft <= 15 ? '#f44336' : '#333' }}>
              ⏱️ {timeLeft}с
            </div>
          )}
        </div>

        {!hasSelectedTeam && (
          <div className="team-selection-screen">
            <h2>Выберите вашу команду</h2>
            <p>Выберите команду для участия в игре</p>
            <div className="teams-grid">
              {teams.map(team => (
                <button
                  key={team}
                  onClick={() => handleTeamSelect(team)}
                  className="team-select-btn"
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasSelectedTeam && !isPlaying && (
          <div className="waiting-screen">
            <h2>Ожидание начала раунда...</h2>
            <p>Вы играете за команду: <strong>{selectedTeam}</strong></p>
            <p>Ведущий скоро начнет игру</p>
            {!isConnected && (
              <p style={{ color: '#f44336', marginTop: '10px' }}>
                ⚠️ Проблема с подключением. Проверьте код комнаты.
              </p>
            )}
            <p style={{ fontSize: '0.9em', color: '#999', marginTop: '10px' }}>
              Комната: {roomCode} | Статус: {isConnected ? '🟢 Подключено' : '🔴 Не подключено'}
            </p>
          </div>
        )}

        {hasSelectedTeam && isPlaying && (
          <div className="player-section">
            <div className="drawing-prompt">
              <h2>🎨 Что рисует ведущий?</h2>
              <p className="player-team-info">Вы играете за: <strong>{selectedTeam}</strong></p>
            </div>

            <div className="answer-form">
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
                disabled={!playerAnswer.trim()}
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
