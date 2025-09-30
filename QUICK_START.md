# 🚀 SmartSchedule Quick Start Guide

Get the SmartSchedule SWE Department scheduling system running in 5 minutes!

---

## Prerequisites

- **Node.js** 18+ and npm
- **Git** (optional, for cloning)
- REST client (curl, Postman, or Thunder Client)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Start Development Server

```bash
npm run dev
```

The app starts at `http://localhost:3000`

✅ **Seed data auto-loads** with 8 SWE courses, 2 instructors, 6 rooms, and sample data.

---

## Step 3: Test the APIs

### Option A: Use the Test Script

```bash
chmod +x test-apis.sh
./test-apis.sh
```

### Option B: Manual Testing

Open a new terminal and try these:

```bash
# Get all courses
curl http://localhost:3000/api/courses

# Get elective courses only
curl http://localhost:3000/api/courses?type=ELECTIVE

# Get all rules
curl http://localhost:3000/api/rules

# Check for conflicts
curl http://localhost:3000/api/conflicts

# Get instructor load overview
curl http://localhost:3000/api/load/overview
```

---

## Step 4: View Demo Pages

Open your browser:

- **Committee Scheduler**: http://localhost:3000/demo/committee/scheduler
- **Student Preferences**: http://localhost:3000/demo/student/preferences
- **Registrar Irregular Students**: http://localhost:3000/demo/registrar/irregular

---

## Step 5: Explore the Code

### Key Files

```
src/
├── lib/
│   ├── types.ts           # All entity types
│   ├── data-store.ts      # CRUD service layer
│   ├── rules-engine.ts    # Conflict detection
│   └── seed-data.ts       # Sample data
│
├── app/api/
│   ├── sections/          # Section CRUD
│   ├── exams/             # Exam CRUD
│   ├── preferences/       # Student preferences
│   └── conflicts/         # Conflict checking
```

### Make Your First Change

1. **Add a new course** in `src/lib/seed-data.ts`:

```typescript
courseService.create({
  code: "SWE499",
  name: "Senior Project",
  credits: 3,
  level: 400,
  type: "REQUIRED",
  hasLab: false,
  department: "SWE",
});
```

2. **Restart the server** (Ctrl+C, then `npm run dev`)
3. **Test it**: `curl http://localhost:3000/api/courses | grep SWE499`

---

## Step 6: Create a Section via API

```bash
# Get a course ID
COURSE_ID=$(curl -s http://localhost:3000/api/courses | jq -r '.[0].id')

# Create a section
curl -X POST http://localhost:3000/api/sections \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$COURSE_ID\",
    \"index\": 1,
    \"capacity\": 30
  }"
```

Check the **terminal console** - you'll see the log!

---

## Step 7: Check for Conflicts

```bash
curl http://localhost:3000/api/conflicts | jq
```

If there are no sections scheduled yet, you'll see:

```json
{
  "isValid": true,
  "conflicts": []
}
```

---

## Common Tasks

### Add More Seed Data

Edit `src/lib/seed-data.ts` and restart the server.

### View All API Endpoints

See `docs/api-reference.md` for complete documentation.

### Reset Data

Just restart the server - data re-seeds automatically.

### Check Task Progress

See `docs/plan.md` for what's done and what's next.

---

## Troubleshooting

### Port 3000 already in use

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### TypeScript errors

```bash
# Clean build
rm -rf .next
npm run build
```

### Can't see seed data

Check terminal for "Data seeding completed!" message. If not there, check `src/app/layout.tsx` has the seed import.

---

## What's Next?

1. **Build UI Components** - Create forms and tables for each persona
2. **Connect to APIs** - Use SWR or React Query
3. **Add Validation** - Zod schemas for forms
4. **Test** - Unit tests with Vitest
5. **Deploy** - Vercel or similar

---

## Need Help?

- **API Docs**: `docs/api-reference.md`
- **Architecture**: `docs/BACKEND_IMPLEMENTATION.md`
- **Progress**: `docs/plan.md`
- **Scope**: `docs/PHASE3_SCOPE.md`

---

## Quick Reference

### Available Courses (Seed Data)

- SWE211 - Data Structures and Algorithms
- SWE312 - Software Architecture
- SWE314 - Database Systems
- SWE321 - Web Development
- SWE333 - Mobile App Development
- SWE381 - Artificial Intelligence
- SWE434 - Cloud Computing
- SWE444 - Cybersecurity

### Mock Users

- **Student**: `student-1`
- **Faculty**: `instructor-1`
- **Committee**: `user-1`
- **Registrar**: `registrar-1`

### Rules Enforced

1. Break Time (12:00-13:00)
2. Midterm Window (Mon/Wed 12:00-14:00)
3. Lab Continuous Block (2 hours)
4. Elective Multi-Level Access
5. Prerequisite Co-Schedule
6. Balanced Distribution

---

**Happy Coding!** 🎉

For detailed implementation notes, see `docs/IMPLEMENTATION_SUMMARY.md`
