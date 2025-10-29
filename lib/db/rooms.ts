// Database queries for rooms
import { createClient } from '@/supabase/server';
import { Room, RoomInput, RoomType } from '@/lib/types/database';

/**
 * Get all rooms (DEPRECATED - use getRoomsPaginated instead)
 * @deprecated Use getRoomsPaginated for better performance
 */
export async function getRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('room')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data as Room[];
}

/**
 * Get paginated rooms with optional search and filtering
 * Implements server-side pagination for optimal performance
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of rooms per page (default: 20)
 * @param filters - Optional filters: { type?, searchTerm? }
 * @param sortBy - Field to sort by (default: 'code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing rooms array, total count, and total pages
 */
export async function getRoomsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    type?: RoomType
    searchTerm?: string
  },
  sortBy: 'code' | 'type' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const supabase = await createClient()
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Build query with count - select specific columns for better performance
  let query = supabase
    .from('room')
    .select(`
      code,
      type,
      created_at,
      updated_at
    `, { count: 'exact' })
  
  // Apply filters if provided
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.searchTerm && filters.searchTerm.trim()) {
    const searchPattern = `%${filters.searchTerm.trim()}%`
    query = query.ilike('code', searchPattern)
  }
  
  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  return {
    rooms: data as Room[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  }
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

