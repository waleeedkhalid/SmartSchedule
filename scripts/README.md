# SmartSchedule Scripts

This directory contains utility scripts for the SmartSchedule project.

---

## Documentation Scripts


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
| **Generate Docs** | `npm run docs:generate` | Auto-generate documentation |
| **Check Colors** | `npx tsx scripts/analyze-colors.ts` | Analyze color usage |
| **Check RLS Performance** | `psql -f scripts/check-rls-performance.sql` | Check RLS performance issues |

---

**Last Updated:** October 26, 2025

