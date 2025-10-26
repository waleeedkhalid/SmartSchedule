#!/bin/bash

# Supabase Client Migration Script
# This script helps migrate files from old pattern to new pattern

echo "🔄 Starting Supabase Client Migration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Count total files to migrate
TOTAL_FILES=$(grep -r "createServerClient(cookieStore" src/ --include="*.ts" --include="*.tsx" | wc -l | xargs)

echo "📊 Found ${TOTAL_FILES} files needing migration"
echo ""

# Function to migrate a single file
migrate_file() {
  local file=$1
  echo "  Migrating: $file"
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Replace import statement
  sed -i '' 's|import { createServerClient } from "@/lib/supabase";|import { createServerClient } from "@/lib/supabase/server";|g' "$file"
  
  # Remove cookies import if it's only used for cookieStore
  # Note: This is a simple version, manual review may be needed
  sed -i '' '/import { cookies } from "next\/headers";/d' "$file"
  
  # Replace usage pattern
  sed -i '' 's/const cookieStore = await cookies();.*$/\/\/ Removed: const cookieStore = await cookies();/g' "$file"
  sed -i '' 's/const supabase = createServerClient(cookieStore);/const supabase = await createServerClient();/g' "$file"
  
  echo "    ✅ Migrated successfully"
}

# Get list of files (excluding already migrated ones)
FILES=$(grep -r "createServerClient(cookieStore" src/ --include="*.ts" --include="*.tsx" -l)

if [ -z "$FILES" ]; then
  echo "${GREEN}✅ No files need migration!${NC}"
  exit 0
fi

echo "${YELLOW}⚠️  This script will modify files. Backups will be created.${NC}"
echo ""
echo "Files to migrate:"
echo "$FILES" | while read -r file; do echo "  - $file"; done
echo ""

# Ask for confirmation
read -p "Continue with migration? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "${RED}❌ Migration cancelled${NC}"
  exit 1
fi

# Migrate each file
echo ""
echo "🚀 Starting migration..."
echo ""

echo "$FILES" | while read -r file; do
  if [ -f "$file" ]; then
    migrate_file "$file"
  fi
done

echo ""
echo "${GREEN}✅ Migration complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Review the changes with: git diff"
echo "  2. Test the application"
echo "  3. Run linter: npm run lint"
echo "  4. If everything works, remove .backup files"
echo "  5. If issues occur, restore from .backup files"
echo ""
echo "🔍 Backup files created with .backup extension"

