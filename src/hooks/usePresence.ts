import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

type PresenceState = {
  player_id: string
  nickname: string
  is_host: boolean
}

export function usePresence(
  channel: RealtimeChannel | null,
  myState: PresenceState | null,
) {
  const [players, setPlayers] = useState<PresenceState[]>([])

  useEffect(() => {
    if (!channel || !myState) return

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>()
      const allPlayers: PresenceState[] = []
      for (const key in state) {
        for (const presence of state[key]) {
          allPlayers.push({
            player_id: presence.player_id,
            nickname: presence.nickname,
            is_host: presence.is_host,
          })
        }
      }
      setPlayers(allPlayers)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(myState)
      }
    })

    return () => {
      channel.untrack()
    }
  }, [channel, myState])

  return players
}
