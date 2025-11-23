-- Fix deprecated comment table foreign key constraint
-- This table is deprecated and replaced by schedule_comment
-- Drop the foreign key constraint to auth.users to allow Prisma migration

-- Drop the foreign key constraint if it exists
ALTER TABLE IF EXISTS public.comment 
DROP CONSTRAINT IF EXISTS comment_author_id_fkey;

-- Note: The comment table itself is kept for backward compatibility
-- but is no longer used in the application

