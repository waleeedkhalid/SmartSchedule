#!/usr/bin/env node

/**
 * Automatic Supabase Import Fixer
 * Migrates files from old pattern to new pattern
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Supabase Import Fixer\n');

// Get list of files that need fixing
const filesToFix = [
  'src/app/committee/scheduler/student-counts/page.tsx',
  'src/app/api/faculty/availability/route.ts',
  'src/app/api/faculty/schedule/route.ts',
  'src/app/api/faculty/courses/route.ts',
  'src/app/api/faculty/feedback/route.ts',
  'src/app/faculty/layout.tsx',
  'src/app/faculty/availability/page.tsx',
  'src/app/faculty/schedule/page.tsx',
  'src/app/faculty/feedback/page.tsx',
  'src/app/faculty/courses/page.tsx',
  'src/app/faculty/dashboard/page.tsx',
  'src/app/api/faculty/events/route.ts',
  'src/app/api/faculty/status/route.ts',
  'src/app/committee/registrar/timeline/page.tsx',
  'src/app/student/dashboard/page.tsx',
  'src/app/api/auth/bootstrap/route.ts',
  'src/app/api/auth/sign-up/route.ts',
  'src/app/api/auth/sign-in/route.ts',
  'src/app/api/auth/sign-out/route.ts',
  'src/app/api/student/profile/route.ts',
  'src/app/student/page.tsx',
  'src/app/student/setup/page.tsx',
  'src/app/committee/scheduler/setup/page.tsx',
  'src/app/committee/registrar/page.tsx',
  'src/app/committee/registrar/dashboard/page.tsx',
  'src/app/committee/registrar/setup/page.tsx',
  'src/app/committee/teaching-load/page.tsx',
  'src/app/committee/teaching-load/dashboard/page.tsx',
  'src/app/committee/teaching-load/setup/page.tsx',
  'src/app/faculty/page.tsx',
  'src/app/faculty/setup/page.tsx',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix 1: Update import from @/lib/supabase to @/lib/supabase/server
  const oldImport = /import\s*{\s*createServerClient\s*}\s*from\s*["']@\/lib\/supabase["'];?/g;
  if (content.match(oldImport)) {
    content = content.replace(
      oldImport,
      'import { createServerClient } from "@/lib/supabase/server";'
    );
    modified = true;
  }
  
  // Fix 2: Remove standalone cookies import (only if not used elsewhere)
  // Check if cookies() is used elsewhere in the file
  const cookiesUsageCount = (content.match(/cookies\(\)/g) || []).length;
  if (cookiesUsageCount <= 1) {
    // Only used for cookieStore, safe to remove
    content = content.replace(
      /import\s*{\s*cookies\s*}\s*from\s*["']next\/headers["'];?\n/g,
      ''
    );
    modified = true;
  }
  
  // Fix 3: Replace cookieStore pattern
  // Pattern 1: const cookieStore = await cookies();
  content = content.replace(
    /const\s+cookieStore\s*=\s*await\s+cookies\(\);?\s*\n/g,
    ''
  );
  
  // Fix 4: Replace createServerClient(cookieStore) with await createServerClient()
  content = content.replace(
    /createServerClient\(cookieStore\)/g,
    'await createServerClient()'
  );
  modified = true;
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

console.log(`📁 Found ${filesToFix.length} files to check\n`);

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.log(`  ❌ Error fixing ${file}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`  ✅ Fixed: ${fixedCount} files`);
console.log(`  ❌ Errors: ${errorCount} files`);
console.log(`  📄 Total: ${filesToFix.length} files`);

console.log('\n✨ Done! Next steps:');
console.log('  1. Review changes: git diff');
console.log('  2. Test the application: npm run dev');
console.log('  3. Run linter: npm run lint');
console.log('  4. Commit changes if everything works\n');

