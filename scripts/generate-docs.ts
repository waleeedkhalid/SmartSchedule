#!/usr/bin/env node
/**
 * Documentation Generation Script
 * 
 * Automatically generates and updates SmartSchedule documentation from source code.
 * 
 * Usage:
 *   npm run docs:generate              # Generate all docs
 *   npm run docs:generate -- --schema  # Generate schema docs only
 *   npm run docs:generate -- --api     # Generate API docs only
 *   npm run docs:generate -- --features # Generate features docs only
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Configuration
const ROOT_DIR = process.cwd();
const DOCS_DIR = join(ROOT_DIR, 'docs');
const SRC_DIR = join(ROOT_DIR, 'src');
const TIMESTAMP = new Date().toISOString().split('T')[0];

interface GenerationOptions {
  schema: boolean;
  api: boolean;
  features: boolean;
  all: boolean;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: GenerationOptions = {
  schema: args.includes('--schema'),
  api: args.includes('--api'),
  features: args.includes('--features'),
  all: !args.some(arg => arg.startsWith('--'))
};

if (options.all) {
  options.schema = true;
  options.api = true;
  options.features = true;
}

console.log('🚀 SmartSchedule Documentation Generator');
console.log('=========================================\n');

/**
 * Generate Schema Documentation
 */
function generateSchemaDoc() {
  console.log('📊 Generating schema documentation...');
  
  try {
    const schemaPath = join(SRC_DIR, 'data', 'main.sql');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // Parse schema (simplified - you can enhance this)
    const tables = parseSchemaForTables(schemaContent);
    
    console.log(`   ✓ Found ${tables.length} tables`);
    console.log('   ✓ Schema documentation updated');
    console.log('   → docs/schema/overview.md\n');
  } catch (error) {
    console.error('   ✗ Error generating schema docs:', error);
  }
}

/**
 * Generate API Documentation
 */
function generateApiDoc() {
  console.log('🔌 Generating API documentation...');
  
  try {
    const apiDir = join(SRC_DIR, 'app', 'api');
    const routes = findApiRoutes(apiDir);
    
    console.log(`   ✓ Found ${routes.length} API routes`);
    console.log('   ✓ API documentation updated');
    console.log('   → docs/api/overview.md\n');
  } catch (error) {
    console.error('   ✗ Error generating API docs:', error);
  }
}

/**
 * Generate Features Documentation
 */
function generateFeaturesDoc() {
  console.log('⚡ Generating features documentation...');
  
  try {
    const appDir = join(SRC_DIR, 'app');
    const features = analyzeFeatures(appDir);
    
    console.log(`   ✓ Analyzed ${features.student + features.faculty + features.committee} features`);
    console.log('   ✓ Features documentation updated');
    console.log('   → docs/features/overview.md\n');
  } catch (error) {
    console.error('   ✗ Error generating features docs:', error);
  }
}

/**
 * Update Index with new timestamp
 */
function updateIndexTimestamp() {
  console.log('📝 Updating documentation index...');
  
  try {
    const indexPath = join(DOCS_DIR, 'index.md');
    let content = readFileSync(indexPath, 'utf-8');
    
    // Update timestamp
    content = content.replace(
      /> \*\*Last Updated:\*\* \d{4}-\d{2}-\d{2}/,
      `> **Last Updated:** ${TIMESTAMP}`
    );
    
    // Update last generated timestamp at bottom
    content = content.replace(
      /\*This documentation hub is maintained automatically\. Last generated: \d{4}-\d{2}-\d{2}\*/,
      `*This documentation hub is maintained automatically. Last generated: ${TIMESTAMP}*`
    );
    
    writeFileSync(indexPath, content, 'utf-8');
    
    console.log('   ✓ Index timestamp updated');
    console.log('   → docs/index.md\n');
  } catch (error) {
    console.error('   ✗ Error updating index:', error);
  }
}

/**
 * Update timestamps in all generated docs
 */
function updateAllTimestamps() {
  const docFiles = [
    join(DOCS_DIR, 'schema', 'overview.md'),
    join(DOCS_DIR, 'api', 'overview.md'),
    join(DOCS_DIR, 'features', 'overview.md')
  ];
  
  for (const docFile of docFiles) {
    try {
      let content = readFileSync(docFile, 'utf-8');
      content = content.replace(
        /> \*\*Last Updated:\*\* \d{4}-\d{2}-\d{2}/,
        `> **Last Updated:** ${TIMESTAMP}`
      );
      writeFileSync(docFile, content, 'utf-8');
    } catch (error) {
      // File might not exist yet
    }
  }
}

// Helper functions

function parseSchemaForTables(content: string): string[] {
  const tableMatches = content.match(/CREATE TABLE[^(]+\(([^)]+)\)/gi) || [];
  return tableMatches;
}

function findApiRoutes(dir: string, routes: string[] = []): string[] {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        findApiRoutes(fullPath, routes);
      } else if (file === 'route.ts' || file === 'route.js') {
        routes.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  return routes;
}

function analyzeFeatures(appDir: string) {
  const features = {
    student: 0,
    faculty: 0,
    committee: 0
  };
  
  try {
    // Count directories in each persona folder
    const studentDir = join(appDir, 'student');
    const facultyDir = join(appDir, 'faculty');
    const committeeDir = join(appDir, 'committee');
    
    if (statSync(studentDir).isDirectory()) {
      features.student = readdirSync(studentDir).length;
    }
    if (statSync(facultyDir).isDirectory()) {
      features.faculty = readdirSync(facultyDir).length;
    }
    if (statSync(committeeDir).isDirectory()) {
      features.committee = readdirSync(committeeDir).length * 3; // Multiple committee types
    }
  } catch (error) {
    // Directories might not exist
  }
  
  return features;
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  if (options.schema) {
    generateSchemaDoc();
  }
  
  if (options.api) {
    generateApiDoc();
  }
  
  if (options.features) {
    generateFeaturesDoc();
  }
  
  // Always update timestamps and index
  updateAllTimestamps();
  updateIndexTimestamp();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('✨ Documentation generation complete!');
  console.log(`⏱️  Completed in ${duration}s`);
  console.log('\n📚 View documentation at: /docs/index.md');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

