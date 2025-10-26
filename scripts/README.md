# SmartSchedule Scripts

This directory contains utility scripts for the SmartSchedule project.

---

## Documentation Scripts

### `migrate-docs.js` ⭐ NEW

Automatically migrate unofficial documentation to the official `/docs` structure.

**Usage:**
```bash
# Preview what would be moved (safe, no changes)
npm run docs:migrate:dry

# Interactive mode (recommended)
npm run docs:migrate

# Automatic mode
npm run docs:migrate:auto

# Show help
node scripts/migrate-docs.js --help
```

**Features:**
- ✅ Detects `.md` files in wrong locations
- ✅ Smart categorization based on filename
- ✅ Interactive and automatic modes
- ✅ Dry-run support for safe testing
- ✅ Prevents overwriting existing files

**Documentation:** See [docs/system/documentation-migration-tool.md](../docs/system/documentation-migration-tool.md)

---

### `generate-docs.ts`

Generate documentation from codebase (schema, API, features).

**Usage:**
```bash
# Generate all documentation
npm run docs:generate

# Generate specific sections
npm run docs:schema      # Database schema docs
npm run docs:api         # API endpoint docs
npm run docs:features    # Feature docs
```

---

## Other Scripts

### `analyze-colors.ts`

Analyze color usage in the codebase.

**Usage:**
```bash
npx tsx scripts/analyze-colors.ts
```

---

### `fix-supabase-imports.js`

Fix Supabase client import paths (legacy).

---

### `fix-remaining-imports.js`

Fix remaining import issues (legacy).

---

### `check-rls-performance.sql`

SQL script to check RLS performance issues.

**Usage:**
```bash
# Run in Supabase SQL Editor
# or
psql -f scripts/check-rls-performance.sql
```

---

## Script Maintenance

### Adding New Scripts

1. Create script file in `scripts/`
2. Make executable if needed: `chmod +x scripts/your-script.js`
3. Add npm script to `package.json` if appropriate
4. Document in this README
5. Add detailed documentation in `/docs/system/` if complex

### Testing Scripts

Always test with `--dry-run` or similar safe mode first when applicable.

---

## Quick Reference

| Script | Command | Purpose |
|--------|---------|---------|
| **Documentation Migration** | `npm run docs:migrate` | Move unofficial docs to `/docs` |
| **Generate Docs** | `npm run docs:generate` | Auto-generate documentation |
| **Check Colors** | `npx tsx scripts/analyze-colors.ts` | Analyze color usage |

---

**Last Updated:** October 25, 2025

