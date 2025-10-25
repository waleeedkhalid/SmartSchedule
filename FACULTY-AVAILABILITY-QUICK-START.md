# Faculty Availability - Quick Start Guide

## 🚀 What's New

Faculty members can now submit their preferred teaching time slots! The scheduling committee will use this information to optimize course assignments.

## 📍 Key Route

- **Availability Management**: `/faculty/availability`

## 🔑 API Endpoints

```bash
# Get saved availability
GET /api/faculty/availability

# Save/update availability
POST /api/faculty/availability
Body: { "availability": { "Sunday-08:00 [8AM]": true, ... } }
```

## 🔐 Access Control

### During Scheduling Phase (`schedule_published = false`)
- ✅ Can submit/update availability
- ✅ All time slots interactive
- ✅ Save button enabled

### After Schedule Published (`schedule_published = true`)
- ❌ Availability locked (read-only)
- ❌ Time slots disabled
- ❌ Save button disabled
- ℹ️ Lock message displayed

## 🧪 Quick Test

### 1. Setup Test Faculty
```sql
-- Ensure active term exists with schedule NOT published
UPDATE academic_term
SET schedule_published = false
WHERE is_active = true;

-- Login as faculty user
```

### 2. Access Availability Page
```
Navigate to: /faculty/availability
```

### 3. Submit Availability
1. Click time slots to mark as available (turns green)
2. Use "Select All" for bulk selection
3. Click "Save Availability"
4. Verify success message appears

### 4. Check Dashboard
```
Navigate to: /faculty/dashboard
```
- Look for "Teaching Availability" card
- Should show "Submitted" badge
- Displays slot count and last updated date

### 5. Test Phase Lock
```sql
-- Publish schedule
UPDATE academic_term
SET schedule_published = true
WHERE is_active = true;
```
- Refresh availability page
- Verify all controls are disabled
- Lock message should appear

## 📊 Dashboard Features

The faculty dashboard now includes an **Availability Status Card**:

- **Submitted State**:
  - Green "Submitted" badge
  - Shows total available slots
  - Displays last updated date
  - "Update Availability" button

- **Pending State**:
  - Gray "Pending" badge
  - Prompt to submit availability
  - "Submit Availability" button

## 🎨 UI Features

### Time Grid
- **Days**: Sunday through Thursday
- **Hours**: 8:00 AM - 8:00 PM
- **Total Slots**: 65 time slots
- **Visual**: Green = Available, Gray = Unavailable

### Interactions
- **Single Click**: Toggle individual slot
- **Select All**: Mark all 65 slots as available
- **Clear All**: Unmark all slots
- **Hover**: Tooltip shows day and time

### Feedback
- **Loading**: Spinner while fetching data
- **Saving**: Spinner with "Saving..." text
- **Success**: Green checkmark with "Saved successfully" (auto-hides)
- **Error**: Red alert with error message
- **Locked**: Orange alert with lock reason

## 💡 Tips

1. **Save Often**: Changes are only persisted when you click "Save Availability"
2. **Check Phase**: Only available during scheduling phase
3. **Last Saved**: Timestamp shows when last saved
4. **Reload Safety**: Unsaved changes will be lost on page refresh
5. **Committee View**: Scheduling committee can view all faculty availability

## 🐛 Troubleshooting

**Problem**: Cannot access availability page
- **Solution**: Verify you're logged in as faculty role

**Problem**: All slots are disabled
- **Solution**: Check if `schedule_published = true` in active term

**Problem**: Save button doesn't work
- **Solution**: Select at least one time slot before saving

**Problem**: Changes don't persist
- **Solution**: Wait for "Saved successfully" message before leaving page

**Problem**: Dashboard shows "Pending" but I submitted
- **Solution**: Refresh the dashboard page

## 📚 Related Pages

- **Dashboard**: `/faculty/dashboard` - View submission status
- **Courses**: `/faculty/courses` - View assigned courses
- **Schedule**: `/faculty/schedule` - View teaching schedule
- **Feedback**: `/faculty/feedback` - View student feedback

## 🔧 Committee Access

Scheduling committee members can:
- View all faculty availability submissions
- Query `faculty_availability` table directly
- Export data for scheduling software integration

Example query:
```sql
SELECT 
  u.full_name,
  fa.availability_data,
  fa.updated_at
FROM faculty_availability fa
JOIN users u ON fa.faculty_id = u.id
WHERE fa.term_code = 'FALL2025'
ORDER BY u.full_name;
```

## 📊 Data Structure

Availability is stored as JSONB:
```json
{
  "Sunday-08:00 [8AM]": true,
  "Monday-09:00 [9AM]": true,
  "Tuesday-10:00 [10AM]": false,
  "Wednesday-14:00 [2PM]": true
}
```

- **Key Format**: `"${Day}-${Hour}"`
- **Value**: `true` = available, `false` or missing = unavailable

## ✅ Success Indicators

When working correctly, you should see:
- ✅ Time grid loads with saved slots pre-selected
- ✅ Slots toggle on click (color changes immediately)
- ✅ Save shows spinner then success message
- ✅ Dashboard card shows "Submitted" badge
- ✅ Last updated timestamp appears
- ✅ Can update and re-save anytime during scheduling phase

---

**Need Help?** Check the full documentation at `src/docs/features/faculty-features.md`

