# Student Counts Feature - Quick Start Guide

## Overview
The Student Counts feature provides comprehensive enrollment tracking and capacity planning tools for the scheduling committee.

## Accessing the Feature

### Navigation Path
1. Log in as a committee member
2. Go to **Committee Dashboard**
3. Click **Scheduler** in the sidebar
4. Select **Student Counts**

### Direct URL
```
/committee/scheduler/student-counts
```

## Main Features

### 1. By Course View (Default)
**Purpose**: Detailed enrollment data for each course

**Key Information**:
- Course code and name
- Level and type (Required/Elective)
- Total student slots
- Enrolled students
- Sections needed
- Capacity utilization

**Filters Available**:
- 🔍 Search by course code or name
- 📊 Filter by level (3, 4, 5, 6, 7, 8)
- 📚 Filter by type (Required, Elective)
- ⚡ Filter by capacity status:
  - **Under-utilized**: Less than 70% capacity
  - **Near Capacity**: 90-100% capacity
  - **Over Capacity**: More than 100% capacity

**Actions**:
- Export data to CSV
- View elective preference rankings

### 2. By Level View
**Purpose**: Student distribution across academic levels

**Shows**:
- Total students per level
- Required courses per level
- Elective selections per level
- Visual distribution charts

**Use Cases**:
- Level-based workload planning
- Identifying uneven level distribution
- Resource allocation by level

### 3. By Type View
**Purpose**: Compare Required vs Elective courses

**Shows**:
- Course count by type
- Total enrollments
- Average students per course
- Distribution percentage
- Automatic insights

**Use Cases**:
- Curriculum balance analysis
- Elective vs required workload comparison
- Strategic elective planning

## Understanding the Data

### Capacity Status Indicators

| Icon | Status | Meaning | Action Needed |
|------|--------|---------|---------------|
| 🔴 | Over Capacity | >100% enrolled | **Urgent**: Add sections or increase capacity |
| 🟡 | Near Capacity | 90-100% enrolled | **Warning**: Monitor closely, prepare to add sections |
| 🟢 | Normal | 50-90% enrolled | **OK**: Capacity is adequate |
| ⚪ | Under-utilized | <50% enrolled | **Review**: Consider reducing sections |

### Elective Preferences

When viewing elective courses, you'll see preference rankings:

```
#1: 45  #2: 32  #3: 28  #4: 15  #5: 8
```

This shows:
- 45 students selected this course as their 1st choice
- 32 students selected it as their 2nd choice
- And so on...

**Use this to**:
- Determine which electives to offer
- Estimate realistic enrollment
- Plan section capacities for popular electives

## Common Tasks

### Task 1: Export Enrollment Data
1. Navigate to "By Course" tab
2. Apply any desired filters
3. Click **Export CSV** button
4. File downloads automatically with format: `student-counts-{term}-{timestamp}.csv`

### Task 2: Find Over-Capacity Courses
1. Go to "By Course" tab
2. Set capacity filter to **"Over Capacity"**
3. Review courses with 🔴 icon
4. Plan to add sections or increase capacity

### Task 3: Identify Under-Utilized Courses
1. Go to "By Course" tab
2. Set capacity filter to **"Under-utilized"**
3. Review courses with ⚪ icon
4. Consider reducing sections or investigating low enrollment

### Task 4: Plan Elective Offerings
1. Go to "By Course" tab
2. Set type filter to **"Elective"**
3. Review preference rankings in the "Elective Preferences" section
4. Focus on courses with high 1st-choice preferences
5. Consider capacity for 2nd and 3rd choice preferences

### Task 5: Analyze Level Distribution
1. Go to "By Level" tab
2. Review student count per level
3. Check the visual distribution chart
4. Identify levels needing more or fewer resources

### Task 6: Compare Course Types
1. Go to "By Type" tab
2. Review Required vs Elective statistics
3. Read the automatic insights
4. Use for curriculum balance discussions

## Statistics Explained

### Total Student Slots
The sum of all available seats across all courses (capacity × sections)

### Students Enrolled
The actual number of students enrolled in courses

### Sections Needed
Calculated as: `⌈total_students ÷ standard_capacity⌉`

Standard capacity is typically:
- Required courses: 35-40 students
- Elective courses: 30-35 students

### Average Utilization
Formula: `(enrolled_students ÷ total_students) × 100`

**Healthy range**: 75-90%
- Below 75%: May have too many sections
- Above 90%: May need additional sections

## Best Practices

### Daily Tasks
- [ ] Check for over-capacity courses (🔴)
- [ ] Monitor near-capacity warnings (🟡)
- [ ] Review new enrollment changes

### Weekly Tasks
- [ ] Export enrollment report
- [ ] Analyze level distribution
- [ ] Review elective preference trends
- [ ] Identify courses needing attention

### Before Schedule Generation
- [ ] Ensure no critical over-capacity issues
- [ ] Verify sections needed align with capacity
- [ ] Review all filter combinations
- [ ] Export baseline data for comparison
- [ ] Check elective preference satisfaction potential

### After Adding/Removing Sections
- [ ] Refresh the page to see updated data
- [ ] Verify capacity changes reflected
- [ ] Re-check utilization percentages
- [ ] Export updated report

## Troubleshooting

### Issue: No Data Showing
**Causes**:
- No active term set
- No enrollment data for current term
- Database connection issue

**Solutions**:
1. Verify an active term exists
2. Check if students have enrolled
3. Refresh the page
4. Contact system administrator

### Issue: Incorrect Statistics
**Causes**:
- Cached data
- Recent enrollment changes not reflected
- Database sync delay

**Solutions**:
1. Refresh the page (Ctrl+R / Cmd+R)
2. Clear browser cache
3. Wait a few minutes and try again

### Issue: Export Not Working
**Causes**:
- Browser popup blocker
- No data to export
- Browser download restrictions

**Solutions**:
1. Allow popups for this site
2. Ensure filters return results
3. Try different browser
4. Check browser downloads folder

### Issue: Filters Not Working
**Causes**:
- Browser JavaScript error
- Component state issue

**Solutions**:
1. Refresh the page
2. Clear all filters and reapply
3. Try different filter combination
4. Clear browser cache

## Tips & Tricks

### Efficient Workflow
1. **Start Broad**: Begin with "By Level" to get overall picture
2. **Drill Down**: Move to "By Course" for specific courses
3. **Filter Smart**: Use capacity filters to find problem areas quickly
4. **Export Often**: Keep regular snapshots for trend analysis

### Search Tips
- Type course code exactly: `SWE363`
- Type partial name: `software` finds "Software Engineering"
- Search is case-insensitive
- Searches both code and name simultaneously

### Reading Utilization Bars
- **Green bar, full**: Perfect utilization (90-95%)
- **Green bar, half**: Room for more students (50-75%)
- **Yellow bar**: Approaching capacity (90-95%)
- **Red bar**: Over capacity (>100%)

### Planning Sections
General formula:
```
If enrolled_students > capacity × 0.9:
  Consider adding another section

If enrolled_students < capacity × 0.5:
  Consider reducing a section
```

## Integration with Other Features

### Course Management
After reviewing student counts:
1. Navigate to **Course Management**
2. Use **Section Manager** to adjust capacities
3. Add or remove sections as needed

### Schedule Generation
Before generating schedules:
1. Review student counts
2. Ensure adequate capacity
3. Note elective preferences
4. Then go to **Generate Schedule**

### Reports & Analytics (Future)
Student count data will feed into:
- Historical trend analysis
- Predictive enrollment models
- Capacity recommendations

## Support & Feedback

### Getting Help
- Check this guide first
- Review `PHASE-8-STUDENT-PREFERENCE-INTEGRATION.md` for technical details
- Contact scheduling committee admin
- Submit issue to development team

### Providing Feedback
- Report bugs with specific steps to reproduce
- Suggest improvements based on workflow needs
- Share success stories

---

**Last Updated**: October 25, 2025  
**Version**: 1.0  
**Phase**: 8 - Student Preference Integration

