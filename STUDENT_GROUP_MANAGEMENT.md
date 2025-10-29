# Student Group Management Guide

## Overview
Student groups are organizational units used for efficient course scheduling. They are **NOT** automatically created during student registration. Instead, they are managed by the **Scheduling Committee** as part of the schedule preparation process.

## When to Create Student Groups

Student groups should be created **before** generating the course schedule, typically:
1. After student registration period closes
2. Before running the scheduling algorithm
3. When you know how many students are enrolled per level

## How Student Groups Work

### Purpose
- Batch students by academic level (e.g., Level 1, Level 2, etc.)
- Enable conflict-free scheduling within groups
- Optimize classroom and instructor allocation

### Key Points
- One student group per level (can have multiple groups per level if needed)
- Groups are semester-specific
- Students are assigned to groups by the scheduling committee
- Group assignment affects which required course sections students are enrolled in

## Creating Student Groups

### Option 1: Via Dashboard Setup Page
Navigate to **Dashboard → Setup** and use the "Student Groups" section to:
1. Create groups for each level (1-8)
2. Set initial group sizes
3. The system will automatically assign students to balance group sizes

### Option 2: Via Schedule Generator
When you click "Generate Schedule":
1. The system checks for existing student groups
2. If groups don't exist for a level, it prompts you to create them
3. Students are automatically assigned to groups to balance sizes
4. Schedule generation proceeds with grouped students

### Option 3: Manual via API
Use the student groups API endpoints:
```typescript
// Create a group
POST /api/student-groups
{
  "level": 1,
  "name": "Level 1 - Group A"
}

// Assign students to groups (auto-balance)
POST /api/student-groups/auto-assign
{
  "level": 1
}
```

## Student Registration Flow (New)

### What Changed
**Before**: Students were auto-assigned to groups during account registration
- ❌ Caused errors if groups didn't exist
- ❌ Groups created before knowing total enrollment numbers
- ❌ Confusing for students who saw group assignments immediately

**Now**: Students register without group assignment
- ✅ Registration completes successfully without groups
- ✅ Scheduling committee creates groups when ready
- ✅ Groups sized appropriately based on actual enrollment
- ✅ Students assigned during schedule preparation

### Current Flow
1. **Student Registration** (Students)
   - Create account
   - Complete onboarding (select level)
   - Profile saved WITHOUT group assignment
   - Can view available courses but not assigned sections yet

2. **Group Creation** (Scheduling Committee)
   - Review enrollment numbers per level
   - Create appropriate number of groups per level
   - Assign students to groups (manually or auto-balance)

3. **Schedule Generation** (Scheduling Committee)
   - Run scheduling algorithm
   - Algorithm creates sections for each group
   - Students automatically see their schedule based on group

4. **Student Access** (Students)
   - View assigned schedule
   - Register for elective sections
   - See required courses from their group's sections

## Best Practices

### Timing
- Create groups after registration period closes
- Before running schedule generation
- When you have final enrollment counts

### Group Sizing
- Recommended: 25-35 students per group
- Minimum: 15 students per group
- Balance group sizes evenly within each level

### Naming Convention
- Format: "Level {X} - Group {A/B/C}"
- Example: "Level 1 - Group A", "Level 2 - Group B"
- Helps identify groups quickly in reports

## Troubleshooting

### "No student groups found for level X"
**Solution**: Create student groups before generating schedule
- Go to Dashboard → Setup
- Create groups for the missing level
- Assign students to groups
- Retry schedule generation

### "Student not assigned to any group"
**Solution**: 
- Check if groups exist for student's level
- Use auto-assign feature to assign unassigned students
- Or manually assign students to specific groups

### "Group sizes are unbalanced"
**Solution**:
- Use the "Rebalance Groups" feature in Setup page
- Or recreate groups and re-assign students
- System will distribute students evenly

## Migration Notes

### For Existing Systems
If you're upgrading from a version that auto-created groups:
- Existing group assignments are preserved
- New students won't be auto-assigned
- You can continue using existing groups or recreate them

### Database Changes
- `user_roles.student_group_id` is now optional (can be NULL)
- Students can complete onboarding without group assignment
- Group assignment happens separately via scheduling committee actions

## Related Documentation
- See `STUDENT_GROUPS_AUTO_SYNC.md` for database function details
- See `PRD.md` section 7 "Student Groups for Batching"
- See `DATA_MODEL_IMPLEMENTATION_SUMMARY.md` for data model

