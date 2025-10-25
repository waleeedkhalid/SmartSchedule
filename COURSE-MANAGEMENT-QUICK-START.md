# Course Management Quick Start Guide

## 🚀 Getting Started with Course Management

### Access the Course Management Page
1. Log in as a scheduling committee member
2. Navigate to the Scheduler Dashboard
3. Click the "Manage Courses" card
4. Or go directly to `/committee/scheduler/courses`

---

## 📚 Managing SWE Courses

### View All Courses
The default view shows all SWE-managed courses with:
- Course code and name
- Level and credits
- Type (Required/Elective)
- Number of sections
- Enrollment statistics
- Utilization rates

### Search and Filter
**Search:**
- Type in the search box to find courses by code or name
- Results update instantly

**Filter by Level:**
- Click the "All Levels" dropdown
- Select a specific level (3-8)
- Or select "All Levels" to see everything

**Filter by Type:**
- Click the "All Types" dropdown
- Select "Required" or "Elective"
- Or "All Types" for everything

### Switch Views
**Table View (Default):**
- Detailed information in rows
- Expandable to show section details
- Best for data analysis

**Card View:**
- Visual cards for each course
- Quick overview with stats
- Best for browsing

**Toggle between views:**
- Click the grid/list icon in the top right

---

## 🔧 Managing Sections

### Open Section Manager
1. Find the course you want to manage
2. Click the "Manage" button (or "Manage Sections" in card view)
3. The Section Manager dialog opens

### Create a New Section

**Step 1: Open the Form**
- Click "Add Section" button

**Step 2: Fill in Details**
- **Section ID** (required): e.g., "SWE411-01"
- **Capacity** (required): Number of students (e.g., 50)
- **Instructor ID** (optional): Faculty member UUID
- **Room Number** (optional): e.g., "C-201"

**Step 3: Add Time Slots** (at least one required)
1. Click "Add Time Slot"
2. Select day of week (SUNDAY - SATURDAY)
3. Set start time (e.g., 08:00)
4. Set end time (e.g., 09:00)
5. Repeat for multiple time slots

**Step 4: Save**
- Click "Save Section"
- Review any conflict warnings
- Section appears in the list

### Edit an Existing Section

1. Click "Edit" button on a section
2. Modify any fields:
   - Capacity
   - Instructor ID
   - Room Number
3. Add, remove, or modify time slots
4. Click "Save Section"

### Delete a Section

1. Click the trash icon on a section
2. Confirm deletion
3. **Note:** Cannot delete sections with enrolled students

---

## 🏢 Viewing External Courses

### Access External Courses
1. Click the "External Courses" tab
2. View courses from partner departments

### Features
- **Search:** Find courses by code, name, or department
- **Filter:** Select specific departments
- **Grouped Display:** Courses organized by department
- **Read-Only:** Information only, no editing

### Use Cases
- Reference for student elective planning
- Cross-department course visibility
- Understanding full course catalog

---

## 📊 Understanding the Data

### Enrollment Statistics
**Format:** `X / Y`
- X = Currently enrolled students
- Y = Section capacity

**Progress Bar:**
- Shows utilization rate as percentage
- Green indicates healthy enrollment
- Helps identify over/under-subscribed sections

### Course Types
**Required (Blue Badge):**
- Mandatory courses for the program
- All students at that level must take

**Elective (Gray Badge):**
- Optional courses
- Students choose based on preferences

---

## ⚠️ Common Scenarios

### Creating Multiple Sections for High-Demand Courses
1. Open Section Manager for the course
2. Create first section (e.g., SWE411-01)
3. After saving, click "Add Section" again
4. Create second section (e.g., SWE411-02)
5. Assign different time slots to avoid conflicts
6. Repeat as needed

### Handling Time Conflicts
**If you see a conflict warning:**
1. Review the conflicting time slots
2. Edit the section
3. Adjust time slots to different days/times
4. Save again

**Common conflicts:**
- Same instructor teaching at same time
- Room double-booked
- Violates scheduling rules

### Adding Sections for a New Term
1. Ensure the active term is set correctly
2. Navigate to Course Management
3. For each course needing sections:
   - Open Section Manager
   - Create sections with appropriate term code
   - Configure time slots
   - Assign instructors and rooms

---

## 💡 Tips and Best Practices

### Section ID Naming
**Recommended format:** `COURSE-SECTION`
- Example: `SWE411-01`, `SWE411-02`
- Consistent numbering helps organization
- Include leading zeros for sorting

### Capacity Planning
- Start with standard capacity (e.g., 50 students)
- Monitor enrollment rates
- Adjust capacity based on:
  - Room size
  - Faculty availability
  - Historical enrollment data

### Time Slot Management
- **Lecture sections:** 2-3 hours per week
- **Lab sections:** 2-3 hours in one block
- **Tutorial sections:** 1 hour per week
- Leave gaps between classes for travel time
- Consider student preferences for time slots

### Room Assignment
- Assign rooms based on:
  - Section capacity
  - Required equipment (labs, computers)
  - Accessibility requirements
- Leave room field empty if TBA (To Be Announced)

---

## 🐛 Troubleshooting

### "Failed to fetch courses"
**Solutions:**
- Check your internet connection
- Verify you're logged in
- Refresh the page
- Check browser console for errors

### "Section already exists"
**Solutions:**
- Check if section ID is already used
- Use a different section ID
- Review existing sections in the list

### Cannot delete section
**Reason:** Section has enrolled students
**Solution:**
- Cancel the section instead (set status to CANCELLED)
- Or wait until students are moved to other sections

### Conflict warnings after saving
**This is normal if:**
- Time slots overlap with other sections
- Instructor is double-booked
- Room is already reserved

**Actions:**
- Review the conflict details
- Edit the section to resolve conflicts
- Or accept conflicts if intentional (e.g., optional labs)

---

## 🔄 Workflow Examples

### Example 1: Setting Up Sections for a New Semester

**Scenario:** SWE411 needs 3 sections for 150 students

1. **Navigate to Course Management**
   - Find SWE411 in the list
   - Click "Manage Sections"

2. **Create Section 1**
   - ID: SWE411-01
   - Capacity: 50
   - Instructor: [Faculty A UUID]
   - Room: C-201
   - Time Slots:
     - SUNDAY 08:00-09:00
     - TUESDAY 08:00-09:00
   - Save

3. **Create Section 2**
   - ID: SWE411-02
   - Capacity: 50
   - Instructor: [Faculty B UUID]
   - Room: C-202
   - Time Slots:
     - MONDAY 10:00-11:00
     - WEDNESDAY 10:00-11:00
   - Save

4. **Create Section 3**
   - ID: SWE411-03
   - Capacity: 50
   - Instructor: [Faculty A UUID]
   - Room: C-201
   - Time Slots:
     - TUESDAY 14:00-15:00
     - THURSDAY 14:00-15:00
   - Save

5. **Review All Sections**
   - Check for conflicts
   - Verify time distribution
   - Confirm instructor assignments

### Example 2: Updating Section Capacity

**Scenario:** SWE325 section is oversubscribed

1. **Find the Section**
   - Navigate to SWE325
   - Open Section Manager
   - Identify the oversubscribed section

2. **Check Current Status**
   - Note: 55 enrolled / 50 capacity
   - Room can accommodate 60 students

3. **Update Capacity**
   - Click "Edit" on the section
   - Change capacity from 50 to 60
   - Click "Save Section"

4. **Verify**
   - New display: 55 enrolled / 60 capacity
   - Utilization rate updated
   - Students can now enroll

---

## 📞 Need Help?

### Documentation
- Full implementation details: `PHASE-3-COURSE-MANAGEMENT-IMPLEMENTATION.md`
- API documentation: `docs/api/scheduler-api.md`
- System overview: `docs/features/overview.md`

### Support
- Contact the system administrator
- Report bugs through the issue tracker
- Request features through proper channels

---

## ✅ Quick Reference

### Keyboard Shortcuts
- **Search:** Click search box or tab to it
- **Esc:** Close dialogs
- **Enter:** Submit forms (when focused)

### Status Indicators
- 🟢 Green progress: Good utilization (60-90%)
- 🟠 Orange progress: Underutilized (<60%)
- 🔴 Red progress: Oversubscribed (>90%)

### Common Actions
| Action | Location | Button |
|--------|----------|--------|
| Search courses | Top of list | Search box |
| Filter by level | Top of list | Level dropdown |
| Filter by type | Top of list | Type dropdown |
| Switch view | Top right | Grid/List icon |
| Manage sections | Each course | "Manage" button |
| Add section | Section Manager | "Add Section" |
| Edit section | Section Manager | "Edit" button |
| Delete section | Section Manager | Trash icon |

---

**Last Updated:** October 25, 2025
**Version:** 1.0
**Phase:** 3 - Course Management

