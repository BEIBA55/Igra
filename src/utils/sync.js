// Простая синхронизация через JSONBin.io (бесплатный сервис, без регистрации)
// Работает через простой API - просто копируем и используем!

const JSONBIN_API = 'https://api.jsonbin.io/v3/b'
const API_KEY = '$2a$10$JP40f4..vIc7UwYk0WoB0OkWQzfEB8yr8.Ig2IfC/WkvHRyCdOKv.'

// Храним bin ID в localStorage для синхронизации между устройствами
function getBinId(roomCode) {
  return localStorage.getItem(`binId_${roomCode}`)
}

function setBinId(roomCode, binId) {
  localStorage.setItem(`binId_${roomCode}`, binId)
}

export async function getGameState(roomCode) {
  try {
    let binId = getBinId(roomCode)
    
    // Если нет bin ID, пытаемся найти существующий или создать новый
    if (!binId) {
      // Пытаемся найти существующий bin по roomCode
      // Для этого используем поиск через коллекции (если доступно) или создаем новый
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify({ roomCode, gameState: {}, binId: null })
      })
      
      if (!response.ok) {
        console.error('Failed to create bin:', response.statusText)
        return {}
      }
      
      const data = await response.json()
      binId = data.metadata?.id
      
      if (binId) {
        setBinId(roomCode, binId)
        // Сохраняем binId в самом состоянии для синхронизации
        await fetch(`${JSONBIN_API}/${binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY,
          },
          body: JSON.stringify({ roomCode, gameState: {}, binId })
        })
      }
    }

    if (!binId) {
      return {}
    }

    const response = await fetch(`${JSONBIN_API}/${binId}`, {
      headers: {
        'X-Master-Key': API_KEY,
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch game state:', response.statusText)
      return {}
    }
    
    const data = await response.json()
    const state = data.record?.gameState || {}
    
    // Если в состоянии есть binId, обновляем его
    if (data.record?.binId && data.record.binId !== binId) {
      setBinId(roomCode, data.record.binId)
      return await getGameState(roomCode) // Рекурсивно получаем с правильным ID
    }
    
    return state
  } catch (error) {
    console.error('Error fetching game state:', error)
    return {}
  }
}

export async function updateGameState(roomCode, updates) {
  try {
    let binId = getBinId(roomCode)
    
    if (!binId) {
      // Создаем новый bin если его нет
      const response = await fetch(JSONBIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify({ roomCode, gameState: updates, binId: null })
      })
      
      if (!response.ok) {
        console.error('Failed to create bin:', response.statusText)
        return
      }
      
      const data = await response.json()
      binId = data.metadata?.id
      
      if (binId) {
        setBinId(roomCode, binId)
        // Сохраняем binId в состоянии
        await fetch(`${JSONBIN_API}/${binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY,
          },
          body: JSON.stringify({ roomCode, gameState: { ...updates, lastUpdate: Date.now() }, binId })
        })
        return
      }
    }

    // Получаем текущее состояние
    const currentState = await getGameState(roomCode)
    const newState = { ...currentState, ...updates, lastUpdate: Date.now() }

    // Обновляем
    const response = await fetch(`${JSONBIN_API}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
      },
      body: JSON.stringify({ roomCode, gameState: newState, binId })
    })
    
    if (!response.ok) {
      console.error('Failed to update game state:', response.statusText)
    }
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}
