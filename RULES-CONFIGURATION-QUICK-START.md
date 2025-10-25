# Rules Configuration - Quick Start Guide

## Overview

This guide will help you quickly set up and use the Rules Configuration system for automated schedule generation.

## Prerequisites

- Committee member access
- Active term code (e.g., "2025-1")
- Database migration applied

## Quick Setup (5 Minutes)

### Step 1: Apply Database Migration

```bash
# Navigate to project root
cd /path/to/SmartSchedule

# Apply migration
supabase migration up

# Verify
supabase db diff
```

### Step 2: Access Rules Configuration

1. Log in as a committee member
2. Navigate to: **Committee Dashboard** → **Rules & Settings** → **Configure Rules**
3. Or go directly to: `/committee/scheduler/rules?term=2025-1`

### Step 3: Review Default Configuration

On first visit, you'll see:
- ℹ️ "Using Default Config" badge
- Default rules for all categories
- Default priority weights (all at 0.15-0.2)

These defaults are safe for most use cases!

## Common Configuration Tasks

### Task 1: Adjust Break Times

**Goal:** Change lunch break from 12:00-13:00 to 13:00-14:00

1. Go to **Scheduling Rules** tab
2. Find **Time Constraints** section
3. Click **Edit** on "Earliest Class Time"
4. Change to `08:00`
5. Click **Save Changes** (top right)

### Task 2: Increase Section Capacity

**Goal:** Allow up to 40 students per section

1. Go to **Scheduling Rules** tab
2. Find **Section Constraints** section
3. Click **Edit** on "Max Students Per Section"
4. Change value to `40`
5. Enable "Allow Section Overflow" if needed
6. Click **Save Changes**

### Task 3: Prioritize Elective Preferences

**Goal:** Make student elective choices more important

1. Go to **Priority Weights** tab
2. Increase "Elective Preference" slider to `0.30`
3. Adjust other weights so total = 1.0
   - Or click **Normalize** to auto-adjust
4. Click **Apply Changes**

### Task 4: Test Rules Against Current Schedule

**Goal:** Check for violations before generating schedules

1. Configure rules as needed
2. Click **Save Configuration**
3. Click **Test Rules Against Current Schedule**
4. Wait for results (usually 10-30 seconds)
5. Review **Test Results** tab
6. Address any critical/error violations

## Rule Categories Explained

### 🕐 Time Constraints
Controls when classes can be scheduled
- **Most Important:** `earliest_class_time`, `latest_class_time`
- **Typical Values:** 08:00 to 18:00

### 📅 Weekly Constraints
Controls weekly patterns
- **Most Important:** `max_weekly_hours`
- **Typical Values:** 18-21 hours

### 👥 Section Constraints
Controls class sizes
- **Most Important:** `max_students_per_section`, `min_students_per_section`
- **Typical Values:** 15-35 students

### 👨‍🏫 Faculty Constraints
Controls faculty schedules
- **Most Important:** `respect_faculty_availability`
- **Always Recommended:** Enable this!

### 📝 Exam Constraints
Controls exam scheduling
- **Most Important:** `min_days_between_exams`, `avoid_exam_conflicts`
- **Typical Values:** 2-3 days minimum

### ⭐ Elective Preferences
Controls student choice respect
- **Most Important:** `honor_elective_preferences`
- **Recommendation:** Always enable

### 🏢 Room Constraints
Controls room assignments
- **Most Important:** `respect_room_capacity`
- **Always Recommended:** Enable this!

## Priority Weights Quick Reference

| Weight | Purpose | Recommended Range |
|--------|---------|-------------------|
| Time Preference | Preferred time slots | 0.15 - 0.25 |
| Faculty Preference | Faculty availability | 0.15 - 0.25 |
| Elective Preference | Student choices | 0.10 - 0.30 |
| Minimize Gaps | Reduce gaps | 0.10 - 0.20 |
| Room Optimization | Room efficiency | 0.10 - 0.20 |
| Load Balancing | Faculty balance | 0.10 - 0.20 |

**Remember:** All weights must sum to exactly 1.0!

## Testing Workflow

### Best Practices

1. **Start with Defaults**
   - Test default configuration first
   - Only modify what's necessary

2. **Test After Each Change**
   - Save configuration
   - Run tests
   - Review results
   - Iterate

3. **Address Critical Issues First**
   - Fix critical violations immediately
   - Handle errors next
   - Review warnings last
   - Info items are optional

4. **Document Your Changes**
   - Note why you changed each rule
   - Keep track of what works
   - Share insights with team

### Common Test Results

**✅ All Passed**
```
✓ Break time compliance
✓ Daily hours limit compliance
✓ Room capacity compliance
✓ No time conflicts
✓ Section size compliance
```
**Action:** You're ready to generate schedules!

**⚠️ Some Warnings**
```
⚠ 3 sections under-enrolled
⚠ 2 large gaps between classes
```
**Action:** Review and decide if acceptable

**❌ Critical Errors**
```
✗ 5 room conflicts
✗ 2 faculty conflicts
```
**Action:** Must resolve before generating schedules

## Common Scenarios

### Scenario 1: New Term Setup

**Goal:** Set up rules for Fall 2025

1. Go to rules page with `?term=2025-3`
2. Review default configuration
3. Adjust for Fall schedule patterns
4. Save configuration
5. Test rules
6. Generate schedules

**Time Required:** 10-15 minutes

### Scenario 2: Increasing Enrollment

**Goal:** Accommodate 20% more students

1. Increase `max_students_per_section` by 20%
2. Enable `allow_section_overflow`
3. Set `overflow_percentage` to `10`
4. Test rules to check room capacity
5. Save configuration

**Time Required:** 5 minutes

### Scenario 3: Faculty Constraints

**Goal:** Ensure faculty availability is respected

1. Enable `respect_faculty_availability`
2. Set `max_faculty_daily_hours` to `6`
3. Set `min_gap_between_faculty_classes` to `15` minutes
4. Increase `faculty_preference` weight to `0.25`
5. Reduce other weights proportionally
6. Test rules

**Time Required:** 10 minutes

### Scenario 4: Exam Scheduling

**Goal:** Prevent exam conflicts

1. Enable `avoid_exam_conflicts`
2. Set `min_days_between_exams` to `3`
3. Set `max_exams_per_day` to `2`
4. Test against exam schedule
5. Adjust as needed

**Time Required:** 10 minutes

## Troubleshooting

### Issue: "Priority weights must sum to 1.0"

**Solution:**
1. Click **Normalize** button
2. Or manually adjust weights
3. Check total in badge (should show 1.000)

### Issue: Too many violations

**Solution:**
1. Relax constraints gradually
2. Test after each change
3. Focus on critical issues first
4. Consider increasing capacities

### Issue: Can't save configuration

**Solution:**
1. Check authentication
2. Verify committee member role
3. Check browser console for errors
4. Refresh page and try again

### Issue: Test takes too long

**Solution:**
1. Check number of sections in database
2. Ensure database indexes exist
3. Try with smaller dataset first
4. Contact support if persistent

## Tips & Best Practices

### ✅ Do's

- **Do** test after major changes
- **Do** start with defaults
- **Do** document your changes
- **Do** review violations carefully
- **Do** adjust weights gradually
- **Do** save frequently

### ❌ Don'ts

- **Don't** set extreme values without testing
- **Don't** ignore critical violations
- **Don't** forget to save changes
- **Don't** make too many changes at once
- **Don't** disable important rules arbitrarily
- **Don't** forget to normalize weights

## Integration with Schedule Generation

Rules are automatically applied when generating schedules:

```
1. Configure Rules → 2. Save Configuration → 3. Generate Schedule
                                                      ↓
                                            Rules Applied Automatically
                                                      ↓
                                             Schedules Respect Rules
```

## API Integration

For programmatic access:

```typescript
// Get rules configuration
const response = await fetch('/api/committee/scheduler/rules?term_code=2025-1');
const { data } = await response.json();

// Update rules
await fetch('/api/committee/scheduler/rules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    term_code: '2025-1',
    rules: data.rules,
    priority_weights: data.priority_weights
  })
});

// Test rules
await fetch('/api/committee/scheduler/rules/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    term_code: '2025-1',
    rules_config: data
  })
});
```

## Next Steps

After configuring rules:

1. ✅ Rules configured
2. ✅ Tests passed
3. 🔄 Generate schedules
4. 🔍 Review generated schedules
5. 🔧 Adjust rules if needed
6. ♻️ Iterate until optimal

## Getting Help

- **Documentation:** See `PHASE-6-RULES-CONFIGURATION-COMPLETE.md`
- **Test Results:** Review violation details and suggestions
- **Default Config:** Safe to use if unsure
- **Support:** Contact scheduling committee lead

## Success Checklist

- [ ] Database migration applied
- [ ] Can access rules page
- [ ] Default configuration loads
- [ ] Can edit individual rules
- [ ] Can adjust priority weights
- [ ] Can save configuration
- [ ] Can test rules
- [ ] Test results display correctly
- [ ] No critical violations
- [ ] Ready to generate schedules

**Estimated Total Time:** 30-45 minutes for first-time setup

## Quick Commands

```bash
# Apply migration
supabase migration up

# Check status
supabase db diff

# View logs
supabase logs

# Reset to defaults (if needed)
# Simply delete the configuration and reload the page
```

## Conclusion

You're now ready to use the Rules Configuration system! Start with defaults, test frequently, and adjust gradually for best results.

Happy scheduling! 🎓

