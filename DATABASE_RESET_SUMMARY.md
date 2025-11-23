# Database Reset: Complete Guide

## 1. Terminal Commands (Reset & Migrate)

### Complete Reset Sequence

```powershell
# Step 1: Stop and reset Supabase (wipes all data)
npx supabase stop
npx supabase db reset
npx supabase start

# Step 2: Remove existing migrations (start fresh)
Remove-Item -Recurse -Force .\prisma\migrations

# Step 3: Generate Prisma Client
npx prisma generate

# Step 4: Create and apply initial migration
npx prisma migrate dev --name init

# Step 5: Seed the database
npm run db:seed
```

### Alternative: One-Line Reset (after setup)

```powershell
npm run db:reset
```

---

## 2. .env Configuration

### For Supabase Local Development

Create or update your `.env` file in the project root:

```env
# Direct PostgreSQL connection (Supabase Local uses port 54322)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Optional: For Prisma migrations (if using transaction pooler)
# DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

**Connection Details:**
- **Host**: `127.0.0.1` (localhost)
- **Port**: `54322` (Supabase Local direct PostgreSQL port)
- **User**: `postgres`
- **Password**: `postgres` (default Supabase Local password)
- **Database**: `postgres`

**Note**: After running `npx supabase start`, the connection string is displayed in the terminal. Use that exact string if it differs.

---

## 3. `prisma/seed.ts`

The complete seed script is located at `prisma/seed.ts`. It includes:

- ✅ Proper dependency order (UserRole → StudentProfile/FacultyProfile)
- ✅ Idempotent `upsert` operations (safe to re-run)
- ✅ Fixed UUIDs for consistent test data
- ✅ Complete seed data for all major entities

**Key Features:**
- Creates 4 UserRoles (Student, Faculty, Registrar, Scheduling)
- Creates StudentProfile and FacultyProfile with proper foreign keys
- Creates AcademicSemester, Courses, CourseOfferings
- Creates Rooms, Sections, StudentGroup
- Creates TimeGridConfig

**See `prisma/seed.ts` for the full implementation.**

---

## 4. `package.json` Update

The following has been added to `package.json`:

### Scripts Section:
```json
"scripts": {
  "db:seed": "tsx prisma/seed.ts",
  "db:reset": "npx prisma migrate reset --force && npm run db:seed"
}
```

### Dependencies:
```json
"dependencies": {
  "@prisma/client": "latest",
  "@prisma/adapter-pg": "latest",
  "postgres": "latest"
}
```

### DevDependencies:
```json
"devDependencies": {
  "prisma": "latest",
  "tsx": "^4.7.0"
}
```

### Prisma Seed Configuration:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

**Install dependencies:**
```powershell
npm install
```

---

## Quick Start Checklist

- [ ] Run `npx supabase db reset` to wipe database
- [ ] Verify `.env` has correct `DATABASE_URL`
- [ ] Run `npx prisma generate` to generate Prisma Client
- [ ] Run `npx prisma migrate dev --name init` to apply schema
- [ ] Run `npm run db:seed` to seed initial data
- [ ] Verify with `npx prisma studio` (opens at http://localhost:5555)

---

## Verification

After completing the reset:

```powershell
# Open Prisma Studio to view seeded data
npx prisma studio
```

You should see:
- 4 UserRoles
- 1 StudentProfile
- 1 FacultyProfile
- 1 AcademicSemester
- 3 Courses
- 2 CourseOfferings
- 2 Rooms
- 1 StudentGroup
- 2 Sections
- 1 TimeGridConfig


