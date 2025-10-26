#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/academic/events/[id]/route.ts',
  'src/app/api/academic/terms/route.ts',
  'src/app/api/academic/events/route.ts',
  'src/app/api/academic/timeline/[term_code]/route.ts',
  'src/app/api/student/electives/route.ts',
  'src/app/api/student/electives/submit/route.ts',
  'src/app/api/student/electives/draft/route.ts',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix: Update import
  const oldImport = /import\s*{\s*createServerClient\s*}\s*from\s*["']@\/lib\/supabase["'];?/g;
  if (content.match(oldImport)) {
    content = content.replace(
      oldImport,
      'import { createServerClient } from "@/lib/supabase/server";'
    );
    modified = true;
  }
  
  // Remove cookies import if only used once
  const cookiesUsageCount = (content.match(/cookies\(\)/g) || []).length;
  if (cookiesUsageCount <= 1) {
    content = content.replace(
      /import\s*{\s*cookies\s*}\s*from\s*["']next\/headers["'];?\n/g,
      ''
    );
    modified = true;
  }
  
  // Replace patterns
  content = content.replace(
    /const\s+cookieStore\s*=\s*await\s+cookies\(\);?\s*\n/g,
    ''
  );
  
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

console.log('🔧 Fixing remaining files...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${file}: ${error.message}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount}/${filesToFix.length} files\n`);

