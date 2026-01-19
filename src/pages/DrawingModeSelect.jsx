import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DrawingModeSelect.css'

function DrawingModeSelect() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleHostClick = () => {
    const code = generateRoomCode()
    navigate(`/drawing/game?mode=host&room=${code}`)
  }

  const handlePlayerClick = () => {
    if (roomCode.trim()) {
      navigate(`/drawing/game?mode=player&room=${roomCode.toUpperCase()}`)
    }
  }

  return (
    <div className="mode-select-page">
      <div className="mode-select-container">
        <h1 className="page-title">🎨 Рисовалка</h1>
        <p className="page-subtitle">Выберите режим игры</p>

        <div className="modes-grid">
          <div className="mode-card host-card">
            <div className="mode-icon">👤</div>
            <h2>Ведущий</h2>
            <p>Вы будете видеть слова для рисования и управлять игрой</p>
            <button onClick={handleHostClick} className="mode-btn host-btn">
              Стать ведущим
            </button>
          </div>

          <div className="mode-card player-card">
            <div className="mode-icon">👥</div>
            <h2>Игрок</h2>
            <p>Введите код комнаты и угадывайте слова</p>
            <div className="room-input-section">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Код комнаты"
                className="room-input"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handlePlayerClick()}
              />
              <button
                onClick={handlePlayerClick}
                className="mode-btn player-btn"
                disabled={!roomCode.trim()}
              >
                Присоединиться
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="back-home-btn">
          ← На главную
        </button>
      </div>
    </div>
  )
}

export default DrawingModeSelect

