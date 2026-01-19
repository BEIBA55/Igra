// Синхронизация через Vercel Serverless Function
// Работает без CORS проблем, так как запросы идут на тот же домен

const API_URL = '/api/sync'

export async function getGameState(roomCode) {
  try {
    const response = await fetch(`${API_URL}?roomCode=${roomCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data || {}
  } catch (error) {
    console.error('Error fetching game state:', error)
    return {}
  }
}

export async function updateGameState(roomCode, updates) {
  try {
    const response = await fetch(`${API_URL}?roomCode=${roomCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}
