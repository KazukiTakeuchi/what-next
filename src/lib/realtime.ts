import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function createChannel(roomCode: string): RealtimeChannel {
  return supabase.channel(`room:${roomCode}`, {
    config: {
      broadcast: { self: true },
      presence: { key: '' }, // will be overridden per player
    },
  })
}

export function broadcast(
  channel: RealtimeChannel,
  event: string,
  payload: Record<string, unknown>,
) {
  return channel.send({
    type: 'broadcast',
    event,
    payload,
  })
}
