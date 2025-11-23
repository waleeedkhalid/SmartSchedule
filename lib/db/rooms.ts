// Database queries for rooms
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { createClient } from '@/supabase/server';
import { Room, RoomInput, RoomType } from '@/lib/types/database';

/**
 * Get all rooms (DEPRECATED - use getRoomsPaginated instead)
 * @deprecated Use getRoomsPaginated for better performance
 */
export async function getRooms() {
  const rooms = await db.room.findMany({
    orderBy: { code: 'asc' }
  });
  
  return rooms as Room[];
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
  const skip = (page - 1) * pageSize;
  
  // Build where clause
  const where: any = {};
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.searchTerm && filters.searchTerm.trim()) {
    where.code = {
      contains: filters.searchTerm.trim(),
      mode: 'insensitive' as const
    };
  }
  
  // Build orderBy clause
  const orderBy = { [sortBy]: sortOrder };
  
  // Execute queries in parallel
  const [rooms, totalCount] = await Promise.all([
    db.room.findMany({
      where,
      select: {
        code: true,
        type: true,
        created_at: true,
        updated_at: true
      },
      orderBy,
      skip,
      take: pageSize
    }),
    db.room.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    rooms: rooms as Room[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

export async function getRoomByCode(code: string) {
  const room = await db.room.findUnique({
    where: { code }
  });
  
  if (!room) {
    throw new Error(`Room with code ${code} not found`);
  }
  
  return room as Room;
}

export async function getRoomsByType(type: RoomType) {
  const rooms = await db.room.findMany({
    where: { type },
    orderBy: { code: 'asc' }
  });
  
  return rooms as Room[];
}

export async function createRoom(room: RoomInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const created = await db.room.create({
    data: {
      ...room,
      created_by: user?.id || null
    }
  });
  
  return created as Room;
}

export async function updateRoom(code: string, updates: Partial<RoomInput>) {
  const updated = await db.room.update({
    where: { code },
    data: updates
  });
  
  return updated as Room;
}

export async function deleteRoom(code: string) {
  await db.room.delete({
    where: { code }
  });
}

