// Database queries for rooms
import { createClient } from '@/supabase/server';
import { Room, RoomInput, RoomType } from '@/lib/types/database';

export async function getRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('room')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data as Room[];
}

export async function getRoomByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('room')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data as Room;
}

export async function getRoomsByType(type: RoomType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('room')
    .select('*')
    .eq('type', type)
    .order('code');
  
  if (error) throw error;
  return data as Room[];
}

export async function createRoom(room: RoomInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('room')
    .insert({ ...room, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Room;
}

export async function updateRoom(code: string, updates: Partial<RoomInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('room')
    .update(updates)
    .eq('code', code)
    .select()
    .single();
  
  if (error) throw error;
  return data as Room;
}

export async function deleteRoom(code: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('room')
    .delete()
    .eq('code', code);
  
  if (error) throw error;
}

