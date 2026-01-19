// Vercel Serverless Function для синхронизации игры
// Хранит состояние в памяти (для продакшена лучше использовать базу данных)

// Простое хранилище в памяти (работает только в рамках одного инстанса)
// Для продакшена лучше использовать Redis или базу данных
const gameRooms = new Map()

export default async function handler(req, res) {
  // Включаем CORS для всех доменов
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { roomCode } = req.query

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code is required' })
  }

  if (req.method === 'GET') {
    // Получить состояние комнаты
    const state = gameRooms.get(roomCode) || {
      isPlaying: false,
      currentWord: '',
      timeLeft: 0,
      teamAnswers: {},
      lastUpdate: 0
    }
    return res.status(200).json(state)
  }

  if (req.method === 'POST') {
    // Обновить состояние комнаты
    const updates = req.body
    
    const currentState = gameRooms.get(roomCode) || {
      isPlaying: false,
      currentWord: '',
      timeLeft: 0,
      teamAnswers: {},
      lastUpdate: 0
    }
    
    const newState = {
      ...currentState,
      ...updates,
      lastUpdate: Date.now()
    }
    
    gameRooms.set(roomCode, newState)
    
    return res.status(200).json({ success: true, state: newState })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

