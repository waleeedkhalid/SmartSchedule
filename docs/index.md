# SmartSchedule Documentation

> **Last Updated:** 2025-10-24 (Auto-generated)

Welcome to the comprehensive documentation for **SmartSchedule** - An intelligent academic scheduling system for universities and educational institutions.

---

## 📖 Quick Navigation

### [Database Schema](./schema/overview.md)
Complete database schema documentation including:
- All tables, columns, and constraints
- Relationships and foreign keys
- Row-level security policies
- Triggers and functions
- Sample data

**Auto-synced with:** `src/data/main.sql`

---

### [API Reference](./api/overview.md)
Full API endpoint documentation including:
- Authentication endpoints
- Student endpoints
- Faculty endpoints
- Committee endpoints
- Request/response formats
- Authentication & authorization

**Auto-synced with:** `src/app/api/**/route.ts`

---

### [Features Overview](./features/overview.md)
Comprehensive feature documentation organized by persona:
- 🎓 Student features (dashboard, electives, schedule, feedback)
- 👨‍🏫 Faculty features (availability, teaching schedule)
- 🏛️ Committee features (scheduling, teaching load, registrar)
- 🔄 Shared features (auth, navigation, UI components)
- Feature maturity matrix
- Access control matrix

**Auto-synced with:** `src/app/` and `src/components/`

---

### [System Architecture](./system/architecture.md)
High-level system design and architecture:
- Technology stack
- System components
- Data flow diagrams
- Integration points
- Security model

---

### [Workflows](./system/workflows.md)
End-to-end workflow documentation:
- Schedule generation workflow
- Student elective selection workflow
- Faculty assignment workflow
- Exam scheduling workflow

---

### [Design System](./design/color-system.md)
Complete design system documentation:
- **[Color System Guide](./design/color-system.md)** - Comprehensive color token reference
- **[Quick Reference](./design/COLOR-SYSTEM-QUICK-REFERENCE.md)** - TL;DR guide for developers
- **[Audit Report](./design/COLOR-SYSTEM-AUDIT-REPORT.md)** - Before/after analysis
- WCAG AA compliant color palette
- Theme customization guide
- Accessibility standards

**New:** v2.0 - 100% WCAG AA compliant with explicit hover states

---

### [Legacy Documentation](./system/legacy/)
Archived documentation from previous versions:
- Migration guides
- Refactoring summaries
- Historical architecture documents
- Deprecated features

---

## 🏗️ Project Overview

**SmartSchedule** is a Next.js-based web application designed to automate and optimize academic scheduling for universities. It serves three primary user personas:

### 👥 User Personas

1. **Students**
   - View class schedules
   - Select elective preferences
   - Provide feedback on schedules
   - View exam schedules

2. **Faculty**
   - Set availability preferences
   - View teaching assignments
   - Manage personal schedule

3. **Committee Members**
   - **Scheduling Committee**: Generate and manage course schedules
   - **Teaching Load Committee**: Assign faculty to courses
   - **Registrar**: Manage exam schedules and academic calendar

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Context + Local Storage

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **ORM/Client:** Supabase Client Library

### DevOps & Tools
- **Testing:** Vitest
- **Linting:** ESLint
- **Package Manager:** npm
- **Version Control:** Git

---

## 📊 Key Metrics

- **API Endpoints:** 11 routes
- **Database Tables:** 12 tables
- **User Roles:** 5 roles
- **Features:** 20+ major features
- **UI Components:** 39+ reusable components

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
PostgreSQL database (or Supabase account)
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd SmartSchedule

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# (Apply main.sql to your database)

# Start development server
npm run dev
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📂 Repository Structure

```
SmartSchedule/
├── docs/                      # 📚 This documentation
│   ├── index.md              # Root documentation hub
│   ├── schema/               # Database schema docs
│   ├── api/                  # API reference docs
│   ├── features/             # Features documentation
│   └── system/               # System architecture & workflows
│       └── legacy/           # Archived documentation
│
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── (auth)/          # Authentication pages
│   │   ├── api/             # API routes
│   │   ├── student/         # Student pages
│   │   ├── faculty/         # Faculty pages
│   │   └── committee/       # Committee pages
│   │
│   ├── components/          # React components
│   │   ├── auth/           # Auth components
│   │   ├── student/        # Student components
│   │   ├── faculty/        # Faculty components
│   │   ├── committee/      # Committee components
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI library components
│   │
│   ├── lib/                # Utilities & business logic
│   │   ├── api/           # API helpers
│   │   ├── auth/          # Auth utilities
│   │   ├── schedule/      # Schedule generation logic
│   │   ├── supabase/      # Supabase clients
│   │   └── validations/   # Zod schemas
│   │
│   ├── types/             # TypeScript type definitions
│   └── data/              # Database schemas & seed data
│
├── tests/                 # Test files
├── supabase/             # Supabase migrations
└── public/               # Static assets
```

---

## 🔄 Documentation Maintenance

This documentation system is designed to **automatically stay synchronized** with the codebase.

### Auto-Generation Triggers

The documentation regenerates when:
1. Database schema changes (`src/data/main.sql`)
2. API routes are added/modified (`src/app/api/**/route.ts`)
3. Features are added/removed (`src/app/`, `src/components/`)

### Manual Regeneration

To regenerate all documentation:
```bash
npm run docs:generate
```

To regenerate specific sections:
```bash
npm run docs:generate -- --schema
npm run docs:generate -- --api
npm run docs:generate -- --features
```

### Timestamp Updates

The "Last Updated" timestamp in this file is automatically updated whenever any documentation is regenerated.

---

## 📝 Contributing

### Documentation Guidelines

1. **Do not manually edit auto-generated docs** in:
   - `docs/schema/overview.md`
   - `docs/api/overview.md`
   - `docs/features/overview.md`

2. **Safe to edit manually**:
   - `docs/system/architecture.md`
   - `docs/system/workflows.md`
   - This file (`docs/index.md`) - but timestamp will be auto-updated

3. **Adding new documentation**:
   - Place custom docs in `docs/system/`
   - Update this index with links

---

## 🐛 Troubleshooting

### Common Issues

**Documentation out of sync?**
```bash
npm run docs:generate
```

**Missing database tables?**
```bash
# Re-run main.sql against your database
psql -d your_database -f src/data/main.sql
```

**API endpoints not documented?**
- Ensure route files are named `route.ts`
- Verify they export HTTP method functions (GET, POST, etc.)
- Regenerate docs

---

## 📚 Additional Resources

### Related Documentation Files
- [PRD.md](../PRD.md) - Product Requirements Document
- [PLAN.md](../PLAN.md) - Development Plan
- [README.md](../README.md) - Repository README
- [DATABASE-QUICK-START.md](../DATABASE-QUICK-START.md) - Database setup guide

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review [Legacy Documentation](./system/legacy/)
3. Check the [GitHub Issues](../../issues)

---

## 📄 License

See [LICENSE](../LICENSE) file for details.

---

*This documentation hub is maintained automatically. Last generated: 2025-10-24*

