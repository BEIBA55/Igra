// Простая синхронизация через JSONBin.io (бесплатный сервис, без регистрации)
// Работает через простой API - просто копируем и используем!

const JSONBIN_API = 'https://api.jsonbin.io/v3/b'
const API_KEY = '$2a$10$JP40f4..vIc7UwYk0WoB0OkWQzfEB8yr8.Ig2IfC/WkvHRyCdOKv.' // Замените на свой ключ (см. инструкцию ниже)

// Для получения ключа:
// 1. Зайдите на jsonbin.io
// 2. Зарегистрируйтесь (или используйте без регистрации с ограничениями)
// 3. Скопируйте API ключ
// ИЛИ используйте без ключа (с ограничениями по частоте запросов)

let binIds = {} // Кэш ID для каждой комнаты

export async function getGameState(roomCode) {
  try {
    // Если у нас уже есть bin ID для этой комнаты, используем его
    if (!binIds[roomCode]) {
      // Создаем новый bin для комнаты
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify({ roomCode, gameState: {} })
      })
      const data = await response.json()
      binIds[roomCode] = data.metadata?.id
    }

    const response = await fetch(`${JSONBIN_API}/${binIds[roomCode]}`, {
      headers: {
        'X-Master-Key': API_KEY,
      }
    })
    const data = await response.json()
    return data.record?.gameState || {}
  } catch (error) {
    console.error('Error fetching game state:', error)
    return {}
  }
}

export async function updateGameState(roomCode, updates) {
  try {
    if (!binIds[roomCode]) {
      // Создаем новый bin если его нет
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify({ roomCode, gameState: updates })
      })
      const data = await response.json()
      binIds[roomCode] = data.metadata?.id
      return
    }

    // Получаем текущее состояние
    const currentState = await getGameState(roomCode)
    const newState = { ...currentState, ...updates, lastUpdate: Date.now() }

    // Обновляем
    await fetch(`${JSONBIN_API}/${binIds[roomCode]}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
      },
      body: JSON.stringify({ roomCode, gameState: newState })
    })
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}
