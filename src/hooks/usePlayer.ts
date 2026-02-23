import { useState, useEffect } from 'react'

function generateId(): string {
  return crypto.randomUUID()
}

export function usePlayer() {
  const [nickname, setNickname] = useState(() => {
    return sessionStorage.getItem('nickname') || ''
  })
  const [playerId] = useState(() => {
    const stored = sessionStorage.getItem('player_id')
    if (stored) return stored
    const id = generateId()
    sessionStorage.setItem('player_id', id)
    return id
  })

  useEffect(() => {
    sessionStorage.setItem('nickname', nickname)
  }, [nickname])

  return { playerId, nickname, setNickname }
}

export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}
