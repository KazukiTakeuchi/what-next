import { supabase } from './supabase'
import type { Room } from '../types'

export async function createRoom(
  code: string,
  hostId: string,
  hostNickname: string,
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      host_id: hostId,
      host_nickname: hostNickname,
      status: 'waiting',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Room
}

export async function joinRoom(
  code: string,
  guestId: string,
  guestNickname: string,
): Promise<Room> {
  // First check if room exists
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select()
    .eq('code', code)
    .single()

  if (fetchError || !room) throw new Error('ルームが見つかりません')

  // Check if room is expired (1 hour)
  const created = new Date(room.created_at).getTime()
  if (Date.now() - created > 60 * 60 * 1000) {
    throw new Error('ルームの有効期限が切れています')
  }

  // Atomic update: only succeed if guest_id is still null (prevents TOCTOU race)
  const { data, error } = await supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      guest_nickname: guestNickname,
    })
    .eq('code', code)
    .is('guest_id', null)
    .select()
    .single()

  if (error || !data) throw new Error('ルームは満員です')
  return data as Room
}

export async function getRoom(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code)
    .single()

  if (error) return null
  return data as Room
}

export async function updateRoomStatus(code: string, status: Room['status']) {
  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('code', code)

  if (error) throw new Error(error.message)
}
