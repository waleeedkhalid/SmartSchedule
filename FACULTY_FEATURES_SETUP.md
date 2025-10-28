# Faculty Features Setup Guide

## Quick Start

### 1. Apply the Database Migration

The migration needs to be applied to update the `schedule_comment` table and add helper functions.

```bash
# Reset local database (applies all migrations)
cd /Users/waleedkhalid/Documents/Projects/SSv2
pnpm db:reset
```

**What this does:**
- Renames `schedule_comment.student_id` → `author_id`
- Updates RLS policies to allow all roles to comment
- Adds helper functions for faculty validation
- Creates new indexes for performance

### 2. Regenerate TypeScript Types

After the migration, regenerate types to match the new schema:

```bash
pnpm db:types
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Test the Features

#### As Faculty User:

1. **Login** with a faculty account
2. **Navigate** to `/dashboard/faculty`
3. You should see:
   - Enabled "Update Availability" button
   - Enabled "Submit Feedback" button
   - New "Schedule Feedback Summary" card

#### Test Availability:
1. Click **"Update Availability"** or go to `/dashboard/faculty/availability`
2. Select a mode (Preferred or Unavailable)
3. Click/drag on the time grid to mark times
4. Click **"Save Preferences"**
5. Verify success toast appears

#### Test Feedback:
1. Click **"Submit Feedback"** or go to `/dashboard/faculty/feedback`
2. Try the three tabs:
   - **Submit Feedback**: Create a new comment
   - **My Comments**: View submitted comments
   - **My Sections**: See assigned teaching sections
3. Submit both general and section-specific feedback
4. Edit an unresolved comment
5. Delete a comment

## Important Notes

### Faculty Must Have Instructor Profile

For faculty features to work, the faculty user must be linked to an `instructor` record:

```sql
-- Check if user has instructor profile
SELECT * FROM instructor WHERE email = 'faculty@example.com';

-- If no instructor exists, the pages will show a helpful error message
-- directing the user to contact administration
```

### Test Data Setup

If you need to create test data:

```sql
-- Create a faculty user role (if not exists)
INSERT INTO user_roles (user_id, role, name, email)
VALUES ('your-user-id', 'faculty', 'Dr. Test Faculty', 'faculty@test.com');

-- Create instructor record
INSERT INTO instructor (name, email, max_load_per_week)
VALUES ('Dr. Test Faculty', 'faculty@test.com', 12);

-- Assign a section to test section-specific comments
UPDATE section
SET instructor_id = (SELECT id FROM instructor WHERE email = 'faculty@test.com')
WHERE id = 'some-section-id';
```

## Verification Checklist

- [ ] Migration applied successfully
- [ ] Types regenerated
- [ ] Server starts without errors
- [ ] Faculty dashboard loads
- [ ] Availability page accessible
- [ ] Time grid is interactive
- [ ] Preferences save successfully
- [ ] Feedback page accessible
- [ ] Can submit general feedback
- [ ] Can submit section-specific feedback (if sections assigned)
- [ ] Comments appear in "My Comments" tab
- [ ] Can edit unresolved comments
- [ ] Can delete unresolved comments
- [ ] Dashboard shows correct statistics

## Troubleshooting

### "Instructor profile not found" Error
**Cause**: User doesn't have a linked instructor record  
**Solution**: Create instructor record with matching email

### "You can only comment on sections you are assigned to" Error
**Cause**: Faculty trying to comment on unassigned section  
**Solution**: Either comment generally or select an assigned section

### Time grid not showing selections
**Cause**: JavaScript not loading or browser console errors  
**Solution**: Check browser console for errors, verify page loaded completely

### Changes not saving
**Cause**: API route authentication or database RLS policy issues  
**Solution**: Check browser network tab, verify user is authenticated

## Next Steps

After successful testing:

1. **Push to Remote** (if using remote Supabase):
   ```bash
   supabase db push
   ```

2. **Deploy Frontend**: Push changes to your deployment platform

3. **Test in Production**: Verify all features work in production environment

4. **User Training**: Share this documentation with faculty users

## Support

For issues or questions:
- Check `FACULTY_FEATURES_IMPLEMENTATION.md` for detailed implementation info
- Review inline code comments in components and API routes
- Check browser console and network tab for errors
- Verify database migration applied correctly

---

**Setup Time**: ~5 minutes  
**Status**: Ready to test  
**Documentation**: See FACULTY_FEATURES_IMPLEMENTATION.md for full details

