# Exam Scheduling Quick Start Guide 🚀

**Quick guide to test the new Exam Scheduling features**

---

## 📍 Access the Page

Navigate to: **`http://localhost:3000/committee/scheduler/exams`**

Or from the scheduler dashboard, click on the **"Exams"** menu item.

---

## 🎯 Quick Test Scenarios

### Scenario 1: Create Your First Exam

1. **Select Term:** Choose "Fall 2024" from the dropdown
2. **Click "Add Exam"** button in the Exam Schedule tab
3. **Fill in the form:**
   - Course: Select from dropdown (e.g., SWE101)
   - Type: Midterm
   - Date: Pick a future date
   - Time: 09:00
   - Duration: 120 minutes
   - Room: CCIS 1A101
4. **Click "Create"**
5. **Verify:** Exam appears in the table and stats update

---

### Scenario 2: Create a Conflict

**Purpose:** Test conflict detection

1. **Create first exam:**
   - Course: SWE101
   - Date: 2024-11-15
   - Time: 09:00
   - Room: CCIS 1A101

2. **Create second exam (same time/room):**
   - Course: SWE102
   - Date: 2024-11-15
   - Time: 09:00
   - Room: CCIS 1A101

3. **Switch to "Conflicts" tab**
4. **Verify:** 
   - Conflict counter shows "1" (red)
   - Room conflict appears in list
   - Suggestions are displayed

---

### Scenario 3: View Calendar

1. **Switch to "Calendar View" tab**
2. **Observe:**
   - Dates with exams are highlighted
   - Selected date panel shows exam details
3. **Click on a date with exams**
4. **Verify:**
   - Modal opens with exam details
   - Exam information is correct

---

### Scenario 4: Edit an Exam

1. **In Table View, click the pencil icon** on any exam
2. **Modify:**
   - Change time to 14:00
   - Change room to CCIS 1A102
3. **Click "Update"**
4. **Verify:**
   - Exam updates in table
   - Calendar reflects changes
   - Success message appears

---

### Scenario 5: Delete an Exam

1. **Click the trash icon** on any exam
2. **Confirm** the deletion dialog
3. **Verify:**
   - Exam removed from table
   - Stats update
   - Calendar updates

---

## 🧪 Test Different Exam Types

Create one of each type to test color coding:

```
Midterm  → Blue badge
Midterm2 → Purple badge  
Final    → Orange badge
```

---

## 🔍 Conflict Types to Test

### 1. Time Overlap
```
Exam A: SWE101, 2024-11-15, 09:00
Exam B: SWE102, 2024-11-15, 09:00
→ Critical conflict
```

### 2. Room Conflict
```
Exam A: SWE101, 2024-11-15, 09:00, CCIS 1A101
Exam B: SWE102, 2024-11-15, 09:00, CCIS 1A101
→ Critical conflict
```

### 3. Heavy Exam Day
```
Create 4+ exams on the same date
→ Warning conflict
```

### 4. Missing Room
```
Create exam without selecting a room
→ Warning conflict
```

---

## 📊 Statistics Dashboard

After creating exams, verify the stats cards update:
- **Total Exams:** Count of all exams
- **Midterm:** Count of midterm exams (blue)
- **Midterm 2:** Count of midterm2 exams (purple)
- **Final:** Count of final exams (orange)
- **Conflicts:** Count with red (conflicts) or green (no conflicts)

---

## 🎨 Visual Features to Verify

### Table View
- ✅ Sortable columns
- ✅ Color-coded exam type badges
- ✅ Formatted dates (e.g., "Mon, Nov 15, 2024")
- ✅ Formatted times (e.g., "9:00 AM")
- ✅ Room display or "TBD"
- ✅ Edit/Delete action buttons

### Calendar View
- ✅ Month navigation (prev/next buttons)
- ✅ Highlighted dates with exams
- ✅ Selected date panel
- ✅ Exam cards with details
- ✅ Click to view full details

### Conflicts Tab
- ✅ Summary dashboard (3 cards: critical, warning, info)
- ✅ Expandable conflict items
- ✅ Affected exams list
- ✅ Resolution suggestions
- ✅ Severity color coding

---

## 🚨 Error Scenarios to Test

### 1. Missing Required Fields
Try to create exam without:
- Course code → Should show validation error
- Date → Should show validation error
- Time → Should show validation error

### 2. Invalid Data
- Future date validation
- Time format validation
- Duration minimum (30 minutes)

### 3. Network Errors
- Disconnect internet
- Try to create/update exam
- Verify error message displays

---

## ✅ Acceptance Criteria Checklist

Before marking as complete, verify:

**Basic CRUD:**
- [ ] Can create new exam
- [ ] Can view exam list
- [ ] Can update exam details
- [ ] Can delete exam
- [ ] API calls succeed

**Calendar View:**
- [ ] Calendar displays correctly
- [ ] Can navigate months
- [ ] Exam dates are highlighted
- [ ] Click to view details works

**Conflict Detection:**
- [ ] Time overlaps detected
- [ ] Room conflicts detected
- [ ] Missing rooms flagged
- [ ] Heavy days identified
- [ ] Suggestions provided

**UI/UX:**
- [ ] No console errors
- [ ] Loading states work
- [ ] Success messages appear
- [ ] Error messages clear
- [ ] Responsive on mobile

**Data Integrity:**
- [ ] Stats update correctly
- [ ] Data persists after refresh
- [ ] Updates reflect immediately
- [ ] Deletions cascade properly

---

## 🔗 Quick Links

- **Exam Management Page:** `/committee/scheduler/exams`
- **Scheduler Dashboard:** `/committee/scheduler`
- **API Documentation:** `/docs/api/scheduler-api.md`
- **Full Documentation:** `/PHASE-7-EXAM-SCHEDULING-COMPLETE.md`

---

## 🐛 Common Issues & Solutions

### Issue: "No courses available" in dropdown
**Solution:** Make sure courses exist in the database for the selected term

### Issue: Exams not displaying
**Solution:** 
1. Check term selection
2. Verify API endpoint is accessible
3. Check browser console for errors

### Issue: Conflicts not detected
**Solution:**
1. Click "Refresh" button in Conflicts tab
2. Verify exams have overlapping times/rooms
3. Check API endpoint for conflicts

### Issue: Calendar not showing exams
**Solution:**
1. Verify exam dates are within visible month
2. Check date format (YYYY-MM-DD)
3. Navigate to correct month

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API endpoints are working
3. Check database has required data
4. Review the full documentation

---

## 🎉 Sample Test Data

Here's sample data you can use for quick testing:

```typescript
// Exam 1 - Midterm
{
  course_code: "SWE101",
  term_code: "2024-1",
  exam_type: "MIDTERM",
  exam_date: "2024-11-15",
  start_time: "09:00",
  duration: 120,
  room_number: "CCIS 1A101"
}

// Exam 2 - Midterm 2
{
  course_code: "SWE201",
  term_code: "2024-1",
  exam_type: "MIDTERM2",
  exam_date: "2024-11-22",
  start_time: "14:00",
  duration: 90,
  room_number: "CCIS 1A102"
}

// Exam 3 - Final
{
  course_code: "SWE301",
  term_code: "2024-1",
  exam_type: "FINAL",
  exam_date: "2024-12-15",
  start_time: "10:00",
  duration: 180,
  room_number: "CCIS 2A101"
}

// Exam 4 - Conflict Test (same time as Exam 1)
{
  course_code: "SWE102",
  term_code: "2024-1",
  exam_type: "MIDTERM",
  exam_date: "2024-11-15",
  start_time: "09:00",
  duration: 120,
  room_number: "CCIS 1A103"
}
```

---

**Happy Testing! 🎓**

*If everything works as expected, Phase 7 is ready for production! 🚀*

