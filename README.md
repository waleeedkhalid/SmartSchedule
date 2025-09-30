# SmartSchedule - SWE Department Course Scheduling System

SmartSchedule is a modern web application for managing course schedules, faculty assignments, and student preferences **specifically for the Software Engineering (SWE) Department**. This application is built with Next.js 15, TypeScript, and TailwindCSS.

## Important Scope Note

**This system is designed exclusively for the Software Engineering (SWE) department:**

- ✅ Manages SWE courses only (SWE211, SWE312, SWE314, etc.)
- ✅ Handles SWE faculty assignments and teaching loads
- ✅ Manages SWE student preferences and schedules
- ❌ Cannot schedule or manage courses from other departments (CSC, MATH, etc.)
- ❌ Non-SWE courses are treated as external dependencies only

For non-SWE courses, the system only tracks them as external course offerings that SWE students may take, but does not manage their scheduling.

## Features

- **Role-based Access Control**: Five main user roles - Scheduling Committee, Teaching Load Committee, Faculty, Students, and Registrar
- **Student Portal**: View schedules and submit SWE elective preferences
- **Faculty Portal**: Manage availability and view SWE teaching assignments
- **Committee Portal**: Schedule SWE courses and manage academic terms
- **Teaching Load Management**: Monitor SWE faculty teaching loads and conflicts
- **Registrar Tools**: Manage irregular students requiring SWE courses
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Type Safety**: TypeScript
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/semester-scheduler.git
   cd semester-scheduler
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (for future use)
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
/app
  /api                  # API routes
  /student             # Student portal
  /faculty             # Faculty portal
  /committee           # Committee portal
  /_components         # Reusable UI components
  /_lib                # Shared utilities and hooks
  /styles              # Global styles
  layout.tsx           # Root layout
  page.tsx             # Home page with role selection
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

### Branching Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Message Format

- `feat: <new feature>`
- `fix: <bug fix>`
- `docs: <documentation>`
- `refactor: <code cleanup>`
- `test: <unit or integration tests>`

### Workflow

1. Create a new branch for your changes
2. Make your changes with clear, focused commits
3. Open a Pull Request
4. Get at least one approval before merging

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- [ ] Implement real authentication
- [ ] Add database persistence
- [ ] Enhance AI recommendations
- [ ] Add real-time collaboration
- [ ] Implement versioning for schedules
- [ ] Add comprehensive test coverage

- Multi-user interfaces: student, faculty, committee, load committee
- Scheduling workflows
- Feedback system
- Dashboards
- Notifications
- Version control
- Real-time collaboration

## Advanced Deliverables

- AI recommendations (schedule optimization)
- Mobile app or PWA
- Advanced search/filtering
