# Complete Database Reset Guide: Supabase Local + Prisma

This guide provides a step-by-step process to completely wipe and rebuild your local Supabase database using Prisma as the single source of truth.

---

## Phase 1: Environment Reset

### 1. Stop and Reset Supabase Local

**Windows PowerShell:**
```powershell
# Stop Supabase (if running)
npx supabase stop

# Reset Supabase completely (removes all data)
npx supabase db reset

# Start Supabase fresh
npx supabase start
```

**Alternative: Complete Nuclear Reset**
```powershell
# Stop Supabase
npx supabase stop

# Remove Supabase data directory (WARNING: This deletes everything)
Remove-Item -Recurse -Force .\supabase\.temp

# Start fresh
npx supabase start
```

### 2. Verify Connection String

After starting Supabase, you'll see connection details. Update your `.env` file:

**For Supabase Local (Direct Connection):**
```env
# Direct connection to PostgreSQL (port 54322)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Optional: For migrations (transaction pooler on port 6543)
# DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

**Important Notes:**
- **Port 54322**: Direct PostgreSQL connection (use this for Prisma)
- **Port 6543**: Transaction pooler (not needed for local dev)
- Default credentials: `postgres` / `postgres`
- Database name: `postgres`

**Verify Connection:**
```powershell
# Test connection (optional)
npx prisma db pull
```

---

## Phase 2: Schema Application

### 3. Delete Existing Migrations

**Windows PowerShell:**
```powershell
# Navigate to project root
cd D:\0projects\SSv2

# Remove existing migrations (start fresh)
Remove-Item -Recurse -Force .\prisma\migrations

# Keep only migration_lock.toml if it exists, or let Prisma recreate it
```

**Alternative (if you want to keep migration history):**
```powershell
# Just create a new migration instead
npx prisma migrate dev --name init --create-only
```

### 4. Apply Schema to Fresh Database

```powershell
# Generate Prisma Client first (required)
npx prisma generate

# Create and apply initial migration
npx prisma migrate dev --name init
```

**What this does:**
- Creates a new migration from your `schema.prisma`
- Applies it to the database
- Generates Prisma Client

**Expected Output:**
```
✔ Generated Prisma Client
✔ Created migration `20240101000000_init`
✔ Applied migration `20240101000000_init`
```

---

## Phase 3: Seeding

### 5. Install Dependencies (if not already installed)

```powershell
npm install
```

This will install:
- `@prisma/client` - Prisma Client
- `@prisma/adapter-pg` - PostgreSQL adapter for Prisma 7
- `prisma` - Prisma CLI
- `tsx` - TypeScript executor for seed script
- `postgres` - PostgreSQL driver

### 6. Run Seed Script

```powershell
# Run seed directly
npm run db:seed

# OR using Prisma's built-in seed command
npx prisma db seed
```

**Expected Output:**
```
🌱 Starting database seed...

📝 Creating UserRoles...
✅ UserRoles created

👨‍🎓 Creating StudentProfile...
✅ StudentProfile created

👨‍🏫 Creating FacultyProfile...
✅ FacultyProfile created

📅 Creating AcademicSemester...
✅ AcademicSemester created

📚 Creating Courses...
✅ Courses created

📖 Creating CourseOfferings...
✅ CourseOfferings created

🏫 Creating Rooms...
✅ Rooms created

👥 Creating StudentGroup...
✅ StudentGroup created and linked

📋 Creating Sections...
✅ Sections created

⏰ Creating TimeGridConfig...
✅ TimeGridConfig created

🎉 Database seed completed successfully!
```

---

## Complete Reset Command (All-in-One)

For a complete reset in one go:

```powershell
# 1. Reset Supabase
npx supabase db reset

# 2. Remove old migrations
Remove-Item -Recurse -Force .\prisma\migrations

# 3. Generate Prisma Client
npx prisma generate

# 4. Create and apply migration
npx prisma migrate dev --name init

# 5. Seed database
npm run db:seed
```

**Or use the convenience script:**
```powershell
npm run db:reset
```

---

## Verification

### Check Database State

```powershell
# Open Prisma Studio to view data
npx prisma studio
```

This opens a web UI at `http://localhost:5555` where you can:
- Browse all tables
- Verify seed data
- Check relationships

### Verify via Prisma Client

```powershell
# Create a test script (test-db.ts)
npx tsx -e "import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.userRole.count().then(c => console.log('UserRoles:', c)).finally(() => prisma.\$disconnect())"
```

---

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```powershell
npx prisma generate
```

### Issue: "Connection refused" or "ECONNREFUSED"

**Solution:**
1. Verify Supabase is running: `npx supabase status`
2. Check `.env` has correct `DATABASE_URL`
3. Verify port 54322 is not blocked

### Issue: "Migration already exists"

**Solution:**
```powershell
# Remove migrations folder
Remove-Item -Recurse -Force .\prisma\migrations

# Create fresh migration
npx prisma migrate dev --name init
```

### Issue: "Foreign key constraint violation"

**Solution:**
The seed script handles dependencies correctly. If you see this:
1. Ensure seed script runs completely (don't interrupt)
2. Check that UserRole is created before StudentProfile
3. Verify all UUIDs are valid

### Issue: "Schema drift detected"

**Solution:**
```powershell
# Reset completely
npx supabase db reset
Remove-Item -Recurse -Force .\prisma\migrations
npx prisma migrate dev --name init
```

---

## Seed Script Details

The `prisma/seed.ts` script creates:

1. **UserRoles (4)**
   - Student (test student)
   - Faculty (test faculty)
   - Registrar (test registrar)
   - Scheduling (test scheduler)

2. **StudentProfile (1)**
   - Linked to student UserRole
   - Level 3, Software Engineering

3. **FacultyProfile (1)**
   - Linked to faculty UserRole
   - Default availability settings

4. **AcademicSemester (1)**
   - FALL2024
   - Active semester

5. **Courses (3)**
   - CS101 (Introduction to Computer Science)
   - CS201 (Data Structures)
   - CS301 (Advanced Algorithms)

6. **CourseOfferings (2)**
   - CS101 for FALL2024
   - CS201 for FALL2024

7. **Rooms (2)**
   - A101 (Lecture)
   - LAB101 (Lab)

8. **StudentGroup (1)**
   - Level 3 - Group A
   - Linked to student profile

9. **Sections (2)**
   - CS101-01 (with instructor, room, schedule)
   - CS201-01 (with instructor, room, schedule)

10. **TimeGridConfig (1)**
    - Default scheduling configuration

**All seed data uses fixed UUIDs for consistency and idempotency.**

---

## Next Steps

After successful reset and seed:

1. **Verify in Prisma Studio:**
   ```powershell
   npx prisma studio
   ```

2. **Test your application:**
   ```powershell
   npm run dev
   ```

3. **Create additional seed data** by modifying `prisma/seed.ts`

---

## Maintenance

### Regular Reset (Development)

```powershell
npm run db:reset
```

### Add New Seed Data

Edit `prisma/seed.ts` and add new `upsert` operations. The script is idempotent and can be re-run safely.

### Update Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Re-seed if needed: `npm run db:seed`

---

## Notes

- **Idempotency**: The seed script uses `upsert` operations, so it can be safely re-run
- **Foreign Keys**: All dependencies are handled in the correct order
- **UUIDs**: Fixed UUIDs ensure consistent test data
- **Clean Slate**: The reset process assumes a clean database (Supabase reset ensures this)


