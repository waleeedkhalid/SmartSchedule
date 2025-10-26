#!/usr/bin/env node

/**
 * Documentation Migration Script
 * 
 * Automatically detects and migrates unofficial documentation files
 * into the official /docs directory structure.
 * 
 * Usage:
 *   node scripts/migrate-docs.js [--dry-run] [--auto]
 * 
 * Options:
 *   --dry-run   Show what would be moved without actually moving
 *   --auto      Automatically categorize and move files without prompting
 *   --help      Show this help message
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const ALLOWED_ROOT_FILES = ['README.md', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md'];
const IGNORED_DIRS = ['node_modules', '.git', '.next', 'build', 'dist', 'coverage', '.cursor', '.github', '.vscode', '.windsurf'];

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isAuto = args.includes('--auto');
const showHelp = args.includes('--help');

// Category patterns for automatic classification
const CATEGORY_PATTERNS = {
  'features': [
    /feature/i, /implementation/i, /enhancement/i, /elective/i,
    /faculty/i, /student/i, /committee/i, /registrar/i,
    /dashboard/i, /preference/i
  ],
  'system': [
    /phase/i, /architecture/i, /refactor/i, /migration/i,
    /system/i, /workflow/i, /structure/i
  ],
  'api': [
    /api/i, /endpoint/i, /route/i, /request/i, /response/i
  ],
  'design': [
    /design/i, /color/i, /ui/i, /style/i, /theme/i, /component/i
  ],
  'schema': [
    /schema/i, /database/i, /table/i, /migration/i, /sql/i
  ],
  'root': [
    /quick-start/i, /getting-started/i, /tutorial/i,
    /performance/i, /security/i, /auth/i
  ]
};

// Show help message
if (showHelp) {
  console.log(`
${colors.bright}${colors.cyan}Documentation Migration Script${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/migrate-docs.js [options]

${colors.bright}Options:${colors.reset}
  --dry-run   Show what would be moved without actually moving files
  --auto      Automatically categorize and move files without prompting
  --help      Show this help message

${colors.bright}Examples:${colors.reset}
  # Preview what would be moved
  node scripts/migrate-docs.js --dry-run

  # Interactively migrate files
  node scripts/migrate-docs.js

  # Automatically migrate all files
  node scripts/migrate-docs.js --auto

${colors.bright}Categories:${colors.reset}
  - docs/features/     Feature implementations and enhancements
  - docs/system/       System architecture and workflows
  - docs/api/          API documentation
  - docs/design/       Design system and UI
  - docs/schema/       Database schema
  - docs/              Root-level documentation (performance, auth, etc.)
`);
  process.exit(0);
}

/**
 * Find all markdown files in project root (excluding allowed files)
 */
function findRootMarkdownFiles() {
  const files = fs.readdirSync(PROJECT_ROOT);
  return files.filter(file => {
    if (!file.endsWith('.md')) return false;
    if (ALLOWED_ROOT_FILES.includes(file)) return false;
    
    const fullPath = path.join(PROJECT_ROOT, file);
    const stat = fs.statSync(fullPath);
    return stat.isFile();
  });
}

/**
 * Find markdown files in unofficial documentation directories
 */
function findUnofficialDocs() {
  const unofficialDocs = [];
  
  // Check for common unofficial doc locations
  const checkDirs = [
    'src/docs',
    'openspec',
    'documentation',
    'wiki'
  ];
  
  checkDirs.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      const files = findMarkdownFilesRecursive(fullPath);
      files.forEach(file => {
        unofficialDocs.push({
          file: path.relative(PROJECT_ROOT, file),
          fullPath: file
        });
      });
    }
  });
  
  return unofficialDocs;
}

/**
 * Recursively find markdown files in a directory
 */
function findMarkdownFilesRecursive(dir) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !IGNORED_DIRS.includes(file)) {
        results = results.concat(findMarkdownFilesRecursive(fullPath));
      } else if (stat.isFile() && file.endsWith('.md')) {
        results.push(fullPath);
      }
    });
  } catch (err) {
    // Ignore errors (permission denied, etc.)
  }
  
  return results;
}

/**
 * Automatically categorize a file based on its name and content
 */
function categorizeFile(filename) {
  const lowerName = filename.toLowerCase();
  
  // Check each category pattern
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(lowerName))) {
      return category;
    }
  }
  
  // Default to root if no match
  return 'root';
}

/**
 * Get suggested destination path for a file
 */
function getSuggestedPath(filename, category) {
  if (category === 'root') {
    return path.join(DOCS_DIR, filename);
  }
  return path.join(DOCS_DIR, category, filename);
}

/**
 * Create a readline interface for user input
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user a question and get response
 */
function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

/**
 * Move a file to the docs directory
 */
function moveFile(sourcePath, destPath, dryRun = false) {
  const destDir = path.dirname(destPath);
  
  if (dryRun) {
    console.log(`  ${colors.blue}Would move:${colors.reset} ${sourcePath}`);
    console.log(`  ${colors.green}        to:${colors.reset} ${destPath}`);
    return true;
  }
  
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Check if destination already exists
    if (fs.existsSync(destPath)) {
      console.log(`  ${colors.yellow}⚠ Warning:${colors.reset} ${destPath} already exists`);
      return false;
    }
    
    // Move the file
    fs.renameSync(sourcePath, destPath);
    console.log(`  ${colors.green}✓ Moved:${colors.reset} ${path.relative(PROJECT_ROOT, sourcePath)}`);
    console.log(`  ${colors.green}     to:${colors.reset} ${path.relative(PROJECT_ROOT, destPath)}`);
    return true;
  } catch (err) {
    console.log(`  ${colors.red}✗ Error:${colors.reset} ${err.message}`);
    return false;
  }
}

/**
 * Interactive mode - prompt user for each file
 */
async function interactiveMode(files) {
  const rl = createInterface();
  
  console.log(`\n${colors.bright}${colors.cyan}Interactive Migration Mode${colors.reset}\n`);
  console.log('For each file, choose a destination category:\n');
  console.log('  1. features/  - Feature implementations');
  console.log('  2. system/    - System architecture');
  console.log('  3. api/       - API documentation');
  console.log('  4. design/    - Design system');
  console.log('  5. schema/    - Database schema');
  console.log('  6. root       - Root docs directory');
  console.log('  s. skip       - Skip this file');
  console.log('  q. quit       - Exit migration\n');
  
  let movedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const suggestedCategory = categorizeFile(file);
    const suggestedPath = getSuggestedPath(file, suggestedCategory);
    
    console.log(`\n${colors.bright}File:${colors.reset} ${colors.yellow}${file}${colors.reset}`);
    console.log(`${colors.bright}Suggested:${colors.reset} ${path.relative(PROJECT_ROOT, suggestedPath)}`);
    
    const answer = await question(rl, '\nChoose destination (1-6, s=skip, q=quit) [suggested]: ');
    
    if (answer.toLowerCase() === 'q') {
      console.log(`\n${colors.yellow}Migration cancelled by user${colors.reset}`);
      break;
    }
    
    if (answer.toLowerCase() === 's' || answer === '') {
      console.log(`  ${colors.yellow}⊘ Skipped${colors.reset}`);
      skippedCount++;
      continue;
    }
    
    let category;
    switch (answer) {
      case '1': category = 'features'; break;
      case '2': category = 'system'; break;
      case '3': category = 'api'; break;
      case '4': category = 'design'; break;
      case '5': category = 'schema'; break;
      case '6': category = 'root'; break;
      default:
        console.log(`  ${colors.red}Invalid choice${colors.reset}`);
        skippedCount++;
        continue;
    }
    
    const sourcePath = path.join(PROJECT_ROOT, file);
    const destPath = getSuggestedPath(file, category);
    
    if (moveFile(sourcePath, destPath, isDryRun)) {
      movedCount++;
    } else {
      skippedCount++;
    }
  }
  
  rl.close();
  
  return { movedCount, skippedCount };
}

/**
 * Automatic mode - move files based on automatic categorization
 */
function automaticMode(files) {
  console.log(`\n${colors.bright}${colors.cyan}Automatic Migration Mode${colors.reset}\n`);
  
  let movedCount = 0;
  let skippedCount = 0;
  
  files.forEach(file => {
    const category = categorizeFile(file);
    const sourcePath = path.join(PROJECT_ROOT, file);
    const destPath = getSuggestedPath(file, category);
    
    console.log(`\n${colors.bright}File:${colors.reset} ${colors.yellow}${file}${colors.reset}`);
    console.log(`${colors.bright}Category:${colors.reset} ${category}`);
    
    if (moveFile(sourcePath, destPath, isDryRun)) {
      movedCount++;
    } else {
      skippedCount++;
    }
  });
  
  return { movedCount, skippedCount };
}

/**
 * Update docs/index.md to remind about new files
 */
function updateDocsIndex() {
  if (isDryRun) {
    console.log(`\n${colors.blue}ℹ In real mode, would prompt to update docs/index.md${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.yellow}📝 Remember to update docs/index.md with links to new documentation!${colors.reset}`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════╗
║   SmartSchedule Documentation Migration Tool       ║
╚════════════════════════════════════════════════════╝
${colors.reset}`);
  
  if (isDryRun) {
    console.log(`${colors.yellow}⚠  DRY RUN MODE - No files will be moved${colors.reset}\n`);
  }
  
  // Find unofficial documentation
  console.log(`${colors.bright}Scanning for unofficial documentation...${colors.reset}\n`);
  
  const rootFiles = findRootMarkdownFiles();
  const unofficialDocs = findUnofficialDocs();
  const allFiles = [...rootFiles, ...unofficialDocs.map(d => d.file)];
  
  // Report findings
  console.log(`${colors.bright}Found:${colors.reset}`);
  console.log(`  ${colors.green}${rootFiles.length}${colors.reset} markdown file(s) in project root`);
  console.log(`  ${colors.green}${unofficialDocs.length}${colors.reset} file(s) in unofficial directories`);
  console.log(`  ${colors.green}${allFiles.length}${colors.reset} total file(s) to migrate\n`);
  
  if (allFiles.length === 0) {
    console.log(`${colors.green}✓ No unofficial documentation found!${colors.reset}`);
    console.log(`${colors.green}✓ All documentation is properly organized in /docs${colors.reset}\n`);
    return;
  }
  
  // List files
  console.log(`${colors.bright}Files to migrate:${colors.reset}`);
  allFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${colors.yellow}${file}${colors.reset}`);
  });
  
  // Execute migration
  let results;
  if (isAuto) {
    results = automaticMode(allFiles);
  } else {
    results = await interactiveMode(allFiles);
  }
  
  // Summary
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Migration Summary${colors.reset}\n`);
  
  if (isDryRun) {
    console.log(`${colors.yellow}DRY RUN - No files were actually moved${colors.reset}\n`);
  }
  
  console.log(`  ${colors.green}✓ Moved:${colors.reset}   ${results.movedCount} file(s)`);
  console.log(`  ${colors.yellow}⊘ Skipped:${colors.reset} ${results.skippedCount} file(s)`);
  console.log(`  ${colors.blue}Total:${colors.reset}    ${allFiles.length} file(s)\n`);
  
  if (results.movedCount > 0) {
    updateDocsIndex();
  }
  
  if (!isDryRun && results.movedCount > 0) {
    console.log(`\n${colors.green}✓ Migration complete!${colors.reset}`);
    console.log(`\n${colors.bright}Next steps:${colors.reset}`);
    console.log(`  1. Update ${colors.cyan}docs/index.md${colors.reset} with links to new docs`);
    console.log(`  2. Review migrated files for any needed updates`);
    console.log(`  3. Commit changes: ${colors.cyan}git add docs/ && git commit -m "docs: migrate documentation to official structure"${colors.reset}\n`);
  }
}

// Run the script
main().catch(err => {
  console.error(`${colors.red}Error:${colors.reset}`, err);
  process.exit(1);
});

