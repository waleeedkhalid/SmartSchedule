// Database queries for time grid configuration
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { createClient } from '@/supabase/server';
import { TimeGridConfig } from '@/lib/types/database';

export async function getTimeGridConfig() {
  const config = await db.timeGridConfig.findFirst();
  
  if (!config) {
    throw new Error('Time grid config not found');
  }
  
  return config as TimeGridConfig;
}

export async function updateTimeGridConfig(
  id: string,
  updates: Partial<Omit<TimeGridConfig, 'id' | 'created_at' | 'updated_at' | 'updated_by'>>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const updated = await db.timeGridConfig.update({
    where: { id },
    data: {
      ...updates,
      updated_by: user?.id || null
    }
  });
  
  return updated as TimeGridConfig;
}

