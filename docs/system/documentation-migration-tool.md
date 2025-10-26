# Documentation Migration Tool

> **Created:** October 25, 2025  
> **Script:** `scripts/migrate-docs.js`  
> **Purpose:** Automatically migrate unofficial documentation to official `/docs` structure

---

## Overview

The documentation migration tool automatically detects markdown files in unofficial locations and helps migrate them to the proper `/docs` directory structure.

---

## Quick Start

### Preview What Would Be Moved (Safe)

```bash
npm run docs:migrate:dry
```

This shows what files would be moved **without actually moving them**.

### Interactive Migration (Recommended)

```bash
npm run docs:migrate
```

This mode lets you choose the destination for each file.

### Automatic Migration

```bash
npm run docs:migrate:auto
```

This automatically categorizes and moves files based on their names.

---

## Usage

### Command Line Options

```bash
node scripts/migrate-docs.js [options]

Options:
  --dry-run   Show what would be moved without actually moving files
  --auto      Automatically categorize and move files without prompting
  --help      Show help message
```

### NPM Scripts

```bash
# Interactive migration (prompts for each file)
npm run docs:migrate

# Dry run (preview only, no changes)
npm run docs:migrate:dry

# Automatic migration (no prompts)
npm run docs:migrate:auto
```

---

## What It Does

### 1. Scans for Unofficial Documentation

The tool searches for `.md` files in:

**✅ Allowed in root:**
- `README.md`
- `LICENSE.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`

**❌ Not allowed (will be detected):**
- Any other `.md` files in project root
- Files in `src/docs/`
- Files in `openspec/`
- Files in `documentation/`
- Files in `wiki/`

### 2. Categorizes Files

Automatically suggests categories based on filename:

| Category | Keywords | Destination |
|----------|----------|-------------|
| **features/** | feature, implementation, enhancement, faculty, student, elective | `docs/features/` |
| **system/** | phase, architecture, refactor, workflow, system | `docs/system/` |
| **api/** | api, endpoint, route, request, response | `docs/api/` |
| **design/** | design, color, ui, style, theme, component | `docs/design/` |
| **schema/** | schema, database, table, migration, sql | `docs/schema/` |
| **root** | quick-start, performance, security, auth | `docs/` |

### 3. Moves Files

- Creates destination directories if needed
- Preserves file names
- Checks for conflicts (won't overwrite existing files)
- Provides detailed feedback

---

## Interactive Mode

### How It Works

1. **Scan**: Tool finds all unofficial documentation
2. **Review**: Shows list of files to migrate
3. **Categorize**: For each file:
   - Shows filename
   - Suggests destination category
   - Prompts for confirmation or alternative
4. **Move**: Moves file to chosen category
5. **Summary**: Shows migration results

### Example Session

```bash
$ npm run docs:migrate

╔════════════════════════════════════════════════════╗
║   SmartSchedule Documentation Migration Tool       ║
╚════════════════════════════════════════════════════╝

Scanning for unofficial documentation...

Found:
  3 markdown file(s) in project root
  0 file(s) in unofficial directories
  3 total file(s) to migrate

Files to migrate:
  1. FACULTY-GUIDE.md
  2. API-CHANGES.md
  3. PERFORMANCE-TIPS.md

Interactive Migration Mode

For each file, choose a destination category:

  1. features/  - Feature implementations
  2. system/    - System architecture
  3. api/       - API documentation
  4. design/    - Design system
  5. schema/    - Database schema
  6. root       - Root docs directory
  s. skip       - Skip this file
  q. quit       - Exit migration

File: FACULTY-GUIDE.md
Suggested: docs/features/FACULTY-GUIDE.md

Choose destination (1-6, s=skip, q=quit) [suggested]: 1

  ✓ Moved: FACULTY-GUIDE.md
       to: docs/features/FACULTY-GUIDE.md

File: API-CHANGES.md
Suggested: docs/api/API-CHANGES.md

Choose destination (1-6, s=skip, q=quit) [suggested]: 3

  ✓ Moved: API-CHANGES.md
       to: docs/api/API-CHANGES.md

═══════════════════════════════════════════════════

Migration Summary

  ✓ Moved:   2 file(s)
  ⊘ Skipped: 1 file(s)
  Total:    3 file(s)

✓ Migration complete!

Next steps:
  1. Update docs/index.md with links to new docs
  2. Review migrated files for any needed updates
  3. Commit changes: git add docs/ && git commit -m "docs: migrate documentation"
```

---

## Automatic Mode

### How It Works

Uses filename patterns to automatically categorize files:

```bash
$ npm run docs:migrate:auto

Automatic Migration Mode

File: FACULTY-DASHBOARD-UPDATE.md
Category: features

  ✓ Moved: FACULTY-DASHBOARD-UPDATE.md
       to: docs/features/FACULTY-DASHBOARD-UPDATE.md

File: SCHEMA-CHANGES.md
Category: schema

  ✓ Moved: SCHEMA-CHANGES.md
       to: docs/schema/SCHEMA-CHANGES.md

Migration Summary

  ✓ Moved:   2 file(s)
  ⊘ Skipped: 0 file(s)
  Total:    2 file(s)
```

---

## Dry Run Mode

### Preview Changes Without Making Them

```bash
$ npm run docs:migrate:dry

⚠  DRY RUN MODE - No files will be moved

Found:
  2 markdown file(s) in project root

Files to migrate:
  1. NEW-FEATURE.md
  2. BUG-FIXES.md

File: NEW-FEATURE.md
Category: features

  Would move: NEW-FEATURE.md
        to: docs/features/NEW-FEATURE.md

DRY RUN - No files were actually moved

  ✓ Moved:   2 file(s)  [would be moved]
  ⊘ Skipped: 0 file(s)
  Total:    2 file(s)
```

---

## Category Decision Guide

### When to use each category:

#### `docs/features/`
Use for:
- Feature implementation details
- User guides for specific features
- Feature enhancements and updates
- Role-specific documentation (faculty, student, committee)

Examples:
- `FACULTY-AVAILABILITY-GUIDE.md`
- `ELECTIVE-PREFERENCES-IMPLEMENTATION.md`
- `STUDENT-DASHBOARD-UPDATE.md`

#### `docs/system/`
Use for:
- System architecture
- Development phases
- Refactoring summaries
- Workflows
- Implementation history

Examples:
- `PHASE-9-IMPLEMENTATION.md`
- `ARCHITECTURE-UPDATE.md`
- `REFACTORING-SUMMARY.md`

#### `docs/api/`
Use for:
- API endpoint documentation
- Request/response formats
- API changes and updates
- Integration guides

Examples:
- `NEW-ENDPOINTS.md`
- `API-BREAKING-CHANGES.md`
- `WEBHOOK-INTEGRATION.md`

#### `docs/design/`
Use for:
- Design system updates
- UI component documentation
- Color schemes and theming
- Style guides

Examples:
- `COMPONENT-LIBRARY.md`
- `DESIGN-TOKENS.md`
- `UI-PATTERNS.md`

#### `docs/schema/`
Use for:
- Database schema changes
- Migration guides
- Table documentation
- Database optimization

Examples:
- `SCHEMA-UPDATE-V2.md`
- `NEW-TABLES.md`
- `MIGRATION-GUIDE.md`

#### `docs/` (root)
Use for:
- Cross-cutting concerns
- Performance guides
- Security documentation
- Authentication
- Quick start guides

Examples:
- `PERFORMANCE-OPTIMIZATION.md`
- `SECURITY-BEST-PRACTICES.md`
- `QUICK-START.md`

---

## After Migration

### Required Steps

1. **Update `docs/index.md`**
   ```bash
   # Add links to newly migrated documentation
   ```

2. **Review Migrated Files**
   - Check for broken links
   - Update any outdated content
   - Ensure formatting is correct

3. **Commit Changes**
   ```bash
   git add docs/
   git commit -m "docs: migrate unofficial documentation to /docs"
   ```

### Optional Steps

- Update README.md if needed
- Notify team of new documentation
- Archive old documentation location references

---

## Troubleshooting

### File Already Exists

**Problem:** Destination file already exists

**Solution:**
```bash
# Option 1: Rename the new file before migrating
mv OLD-FILE.md OLD-FILE-NEW.md
npm run docs:migrate

# Option 2: Manually merge content
cat OLD-FILE.md >> docs/category/EXISTING-FILE.md
rm OLD-FILE.md
```

### Wrong Category

**Problem:** File moved to wrong category

**Solution:**
```bash
# Move to correct location
mv docs/wrong-category/FILE.md docs/correct-category/FILE.md
```

### Permission Denied

**Problem:** Cannot move files

**Solution:**
```bash
# Check file permissions
ls -la FILE.md

# Fix permissions if needed
chmod 644 FILE.md
```

---

## Best Practices

### When Creating New Documentation

1. **Always create in `/docs`** from the start
2. **Choose appropriate category** using guide above
3. **Update `docs/index.md`** with links
4. **Follow naming conventions:**
   - Use kebab-case: `feature-name.md`
   - Be descriptive: `student-elective-preferences.md`
   - Avoid generic names: `guide.md`, `docs.md`

### When You Find Unofficial Docs

1. **Run dry run first**: `npm run docs:migrate:dry`
2. **Review the list** of files to be moved
3. **Use interactive mode** for better control
4. **Update index** after migration
5. **Commit immediately** to avoid conflicts

---

## Examples

### Example 1: Migrate All Phase Documentation

```bash
# Preview
npm run docs:migrate:dry

# If looks good, migrate interactively
npm run docs:migrate

# Choose "2" (system/) for each PHASE-*.md file
```

### Example 2: Migrate Feature Documentation

```bash
# Automatically migrate (features will go to docs/features/)
npm run docs:migrate:auto

# Review results
ls -la docs/features/

# Update index
nano docs/index.md

# Commit
git add docs/
git commit -m "docs: migrate feature documentation"
```

### Example 3: Clean Up Root Directory

```bash
# See what's in root
ls -1 *.md

# Preview migration
npm run docs:migrate:dry

# Migrate
npm run docs:migrate

# Verify root is clean (only README.md should remain)
ls -1 *.md
```

---

## Configuration

### Allowed Root Files

Edit `scripts/migrate-docs.js` to change allowed root files:

```javascript
const ALLOWED_ROOT_FILES = [
  'README.md',
  'LICENSE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md'
];
```

### Category Patterns

Edit `CATEGORY_PATTERNS` to customize automatic categorization:

```javascript
const CATEGORY_PATTERNS = {
  'features': [/feature/i, /implementation/i],
  'system': [/phase/i, /architecture/i],
  // ... add your patterns
};
```

---

## Related Documentation

- [Documentation Hub](../index.md)
- [Documentation Cleanup Summary](../DOCUMENTATION-CLEANUP.md)
- [Documentation System Guide](../DOCUMENTATION-SYSTEM.md)

---

## Maintenance

### When to Use This Tool

**Use regularly:**
- After creating temporary documentation
- Before major releases
- During code reviews
- When you notice `.md` files in project root

**Run weekly:**
```bash
npm run docs:migrate:dry
```

**Run as git hook (optional):**
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for unofficial documentation
node scripts/migrate-docs.js --dry-run | grep "file(s) to migrate"
if [ $? -eq 0 ]; then
  echo "⚠️  Found unofficial documentation. Run 'npm run docs:migrate'"
  exit 1
fi
```

---

## Support

If you encounter issues with the migration tool:

1. Check this documentation
2. Run with `--help` flag for usage
3. Try dry run mode first
4. Contact the documentation maintainer

---

**Last Updated:** October 25, 2025  
**Script Version:** 1.0  
**Maintainer:** Development Team

