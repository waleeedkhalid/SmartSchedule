// Database queries for time grid configuration
import { createClient } from '@/supabase/server';
import { TimeGridConfig } from '@/lib/types/database';

export async function getTimeGridConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_grid_config')
    .select('*')
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as TimeGridConfig;
}

export async function updateTimeGridConfig(
  id: string,
  updates: Partial<Omit<TimeGridConfig, 'id' | 'created_at' | 'updated_at' | 'updated_by'>>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('time_grid_config')
    .update({ ...updates, updated_by: user?.id })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as TimeGridConfig;
}

