import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createChannel, broadcast } from '../lib/realtime'
import { supabase } from '../lib/supabase'
import { usePresence } from './usePresence'
import { getRoom } from '../lib/room'
import type { Room } from '../types'

export function useRoom(code: string, playerId: string, nickname: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const isHost = sessionStorage.getItem('role') === 'host'

  const presenceState = useMemo(
    () =>
      channel
        ? { player_id: playerId, nickname, is_host: isHost }
        : null,
    [playerId, nickname, isHost, channel],
  )

  const players = usePresence(channel, presenceState)
  const partnerJoined = players.length >= 2

  // Fetch room data
  useEffect(() => {
    let cancelled = false
    async function fetchRoom() {
      try {
        const data = await getRoom(code)
        if (cancelled) return
        if (!data) {
          setError('ルームが見つかりません')
        } else {
          const created = new Date(data.created_at).getTime()
          if (Date.now() - created > 60 * 60 * 1000) {
            setError('ルームの有効期限が切れています')
          } else {
            setRoom(data)
          }
        }
      } catch {
        if (!cancelled) setError('接続エラーが発生しました')
      }
      if (!cancelled) setLoading(false)
    }
    fetchRoom()
    return () => { cancelled = true }
  }, [code])

  // Set up channel (once per room)
  useEffect(() => {
    if (!room) return
    if (channelRef.current) return

    const ch = createChannel(code)
    channelRef.current = ch
    setChannel(ch)

    return () => {
      // Use removeChannel for full cleanup (unsubscribe + remove from client)
      supabase.removeChannel(ch)
      channelRef.current = null
    }
  }, [room, code])

  const startGame = useCallback(() => {
    if (!channel) return
    broadcast(channel, 'game_start', {})
  }, [channel])

  return {
    room,
    channel,
    players,
    partnerJoined,
    isHost,
    loading,
    error,
    startGame,
  }
}
