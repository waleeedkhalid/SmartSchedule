# Elective Preferences Draft System

## Overview

Enhanced elective preference selection system with auto-save drafts, visual feedback, and beautiful UX using shadcn/ui components.

## Features Implemented

### 1. **Auto-Save Draft System** ✅
- **Automatic saving**: Changes are auto-saved every 2 seconds after user stops making selections
- **Visual indicators**: Real-time status showing "Saving draft...", "Saved 2m ago", etc.
- **Draft persistence**: Students can leave and come back to their draft anytime before survey closes

### 2. **Enhanced Database Schema** ✅
Migration added to `elective_preferences` table:
```sql
- status: TEXT ('DRAFT' | 'SUBMITTED')
- submitted_at: TIMESTAMP WITH TIME ZONE
- Index on (student_id, term_code, status) for performance
```

### 3. **Beautiful UI Components** ✅

#### **DraftStatusIndicator**
- Animated status badge showing:
  - 🔵 "Saving draft..." with spinner
  - 🟢 "Saved 2m ago" with checkmark
  - 🔴 "Failed to save" with error icon
  - ⚪ "Auto-save enabled" when idle

#### **SubmitConfirmationDialog**
- Beautiful modal confirmation before final submission
- Shows:
  - Summary stats (total selections, credits)
  - Package requirements status
  - Ranked course list for review
  - Important notices about survey vs enrollment
- Prevents accidental submissions

#### **Enhanced ElectiveBrowser**
- Status alerts for draft/submitted states
- Clickable course cards (not just buttons)
- Load existing draft/submission on page load
- Disable editing after submission (but allow updates before survey closes)

### 4. **API Endpoints** ✅

#### **PUT /api/student/electives/draft**
Auto-save endpoint for draft preferences:
- Validates course codes and term
- Replaces previous draft (not submitted preferences)
- Max 6 preferences
- Only works when survey is open

#### **GET /api/student/electives**
Enhanced to return:
- `preferenceStatus`: "DRAFT" | "SUBMITTED" | null
- `submittedAt`: timestamp of submission
- `currentPreferences`: existing draft or submitted preferences

#### **POST /api/student/electives/submit**
Updated to:
- Change status from DRAFT to SUBMITTED
- Set submitted_at timestamp
- Allow resubmission (updates existing submission)

## User Flow

### First Time User
1. Opens elective selection page
2. Sees empty selection with "Auto-save enabled" badge
3. Selects courses (clicks card or button)
4. Sees "Saving draft..." → "Saved just now"
5. Can leave and come back anytime
6. Draft loads automatically on return
7. Clicks "Review & Submit" when ready
8. Reviews in beautiful confirmation dialog
9. Confirms submission
10. Sees "✓ Submitted" badge

### Returning User (Draft Exists)
1. Opens page
2. Draft loads automatically with previous selections
3. Sees "Draft Mode: Your changes are being auto-saved" alert
4. Can modify selections
5. Changes auto-save every 2 seconds
6. Submits when ready

### Returning User (Already Submitted)
1. Opens page
2. Previous submission loads automatically
3. Sees green success alert: "Submitted Successfully! Your preferences were submitted on [date]. You can still update them before the survey closes."
4. Can modify and resubmit if survey still open
5. Auto-save is disabled (only saves on explicit submit)

## Technical Details

### Auto-Save Hook
`useDraftAutoSave` custom hook:
- Debounces saves by 2 seconds
- Tracks save status (idle/saving/saved/error)
- Only runs when survey is open and not submitted
- Compares selections to avoid unnecessary API calls

### Status Management
- **DRAFT**: Auto-saved, can be edited freely
- **SUBMITTED**: Final submission, but can be updated until survey closes
- Survey close enforced by `academic_term.electives_survey_open` flag

### Performance Optimizations
- Debounced auto-save prevents excessive API calls
- Indexed database queries for fast draft retrieval
- Memoized components to prevent unnecessary re-renders
- Client-side validation before API calls

## Testing Checklist

- [ ] Auto-save works after 2 seconds of inactivity
- [ ] Draft persists after page reload
- [ ] Status indicator shows correct states
- [ ] Confirmation dialog shows all selections correctly
- [ ] Submitted preferences load on page return
- [ ] Can resubmit (update) existing submission
- [ ] Survey closes properly (no edits when survey closed)
- [ ] Package requirements validation works
- [ ] Mobile responsive design works
- [ ] Dark mode looks good

## Components Created

1. `use-draft-autosave.ts` - Auto-save custom hook
2. `DraftStatusIndicator.tsx` - Status badge component
3. `SubmitConfirmationDialog.tsx` - Confirmation modal
4. Enhanced `ElectiveBrowser.tsx` - Main selection interface
5. `draft/route.ts` - Draft save API endpoint

## Database Migration

File: `add_draft_status_to_elective_preferences`
- Adds `status` column with CHECK constraint
- Adds `submitted_at` timestamp
- Creates performance index
- Includes documentation comments

## Future Enhancements

- [ ] Add drag-and-drop for reordering (using @dnd-kit)
- [ ] Add undo/redo functionality
- [ ] Email notifications when draft saved
- [ ] Show draft age ("Draft from 2 days ago")
- [ ] Add course comparison feature
- [ ] Export selections as PDF

