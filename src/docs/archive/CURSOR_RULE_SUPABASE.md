# ✅ Supabase CLI Cursor Rule Created

## What Was Created

A new Cursor rule at `.cursor/rules/supabase-cli.mdc` that will automatically help the AI agent when working with:
- Database schema changes
- Migrations
- Backend API development
- Database-related files

## How It Works

### Automatic Application

The rule automatically applies when working with:
- Any files in `supabase/` directory
- Database access layer files in `lib/db/`
- API routes in `app/api/`
- The database types file `lib/types/database.ts`

### Manual Fetch

You can also fetch this rule manually by asking questions like:
- "How do I add a new table?"
- "How do I modify the database schema?"
- "What's the process for creating a migration?"

## What the Rule Covers

### 1. **Migration Workflow**
- Creating new migrations with proper naming
- Writing migration SQL
- Applying migrations locally
- Generating TypeScript types

### 2. **Best Practices**
- Always use migrations (never manual changes)
- Enable RLS on all tables
- Add indexes for performance
- Generate types after schema changes
- Test locally before deploying

### 3. **Code Patterns**
- Table creation templates
- RLS policy patterns
- Helper function examples
- API route integration
- Type-safe database queries

### 4. **Common Commands**
Quick reference for all Supabase CLI commands and npm scripts

### 5. **Troubleshooting**
Solutions for common issues when working with migrations and database

## Updated NPM Scripts

Added two more convenient scripts:

```bash
# Create a new migration
pnpm db:migration add_feature_name

# View database logs
pnpm db:logs
```

## Complete List of Database Scripts

```bash
pnpm db:start          # Start Supabase
pnpm db:stop           # Stop Supabase
pnpm db:reset          # Reset database (reapply all migrations)
pnpm db:migration NAME # Create new migration
pnpm db:types          # Generate TypeScript types
pnpm db:status         # Check what's running
pnpm db:studio         # Open Supabase Studio
pnpm db:seed           # Load sample data
pnpm db:seed:clear     # Clear and reload data
pnpm db:logs           # View database logs
```

## Example Workflow with Cursor

When you ask the AI to implement a feature that requires database changes:

**You say:**
> "Add a notification preferences table where users can configure email and push notifications"

**The AI will automatically:**
1. Create a migration file using `supabase migration new add_notification_preferences`
2. Write proper SQL with RLS policies
3. Apply the migration with `pnpm db:reset`
4. Generate TypeScript types with `pnpm db:types`
5. Create database access functions in `lib/db/`
6. Create API routes if needed
7. Ensure everything is type-safe

## Testing the Rule

Try asking Cursor:

```
"Add a new table called 'favorites' where students can bookmark courses"
```

The AI should follow the complete workflow defined in the rule:
- Create migration
- Add RLS policies
- Generate types
- Create database functions
- Test locally

## Rule Location

- **File**: `.cursor/rules/supabase-cli.mdc`
- **Type**: Auto-applies to database-related files + fetchable by description
- **References**: Links to all relevant documentation files

## Additional Documentation

The rule references these documentation files:
- `SUPABASE_CLI_GUIDE.md` - Complete CLI reference
- `QUICK_SETUP.md` - Quick start guide
- `src/docs/LOCAL_DEVELOPMENT.md` - Local development guide
- `supabase/migrations/` - All existing migrations

## Next Steps

1. The rule is active immediately - no restart needed
2. Try asking Cursor to implement a feature that needs database changes
3. Watch it follow the proper migration workflow
4. The AI will reference the rule automatically when working with database files

---

**The AI will now always use Supabase CLI best practices when working with your database!** 🎉

