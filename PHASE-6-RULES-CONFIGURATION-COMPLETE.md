# Phase 6: Rules Configuration - Implementation Complete

## Overview

Phase 6 implements a comprehensive Rules Configuration system that allows scheduling committee members to define, test, and manage scheduling constraints and priority weights for automated schedule generation.

## Completed Features

### 1. API Routes

#### Rules CRUD Operations (`/api/committee/scheduler/rules`)
- **GET**: Retrieve rules configuration for a specific term
  - Returns default configuration if none exists
  - Supports active/inactive rule sets
- **POST**: Create or update rules configuration
  - Validates rules constraints
  - Ensures priority weights sum to 1.0
  - One active configuration per term
- **DELETE**: Deactivate rules configuration

#### Rules Testing (`/api/committee/scheduler/rules/test`)
- **POST**: Test rules against current schedule data
  - Break time violations
  - Daily hours limits
  - Room capacity checks
  - Time conflicts detection
  - Section size compliance
  - Returns detailed violation reports with severity levels

### 2. Database Schema

#### New Table: `scheduling_rules_config`
```sql
- id (UUID)
- term_code (TEXT)
- rules (JSONB) - All scheduling constraint rules
- priority_weights (JSONB) - Priority weights (must sum to 1.0)
- is_active (BOOLEAN)
- created_by (UUID)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**Constraints:**
- Only one active configuration per term
- RLS policies for committee member access

### 3. Rules Configuration Page

**Location:** `/committee/scheduler/rules`

**Features:**
- Tab-based interface for rules, weights, and test results
- Real-time validation feedback
- Unsaved changes indicator
- Default configuration warning
- Test rules against current schedule

**Tabs:**
1. **Scheduling Rules** - View and edit all constraint rules
2. **Priority Weights** - Configure optimization priorities
3. **Test Results** - View rule violation reports

### 4. Components

#### RulesTable
- Displays all scheduling rules organized by category
- Categories: Time, Weekly, Section, Faculty, Exam, Elective, Room
- Filter by category
- Visual status indicators
- Edit individual rules
- Read-only mode support

#### RuleForm
- Modal dialog for editing individual rules
- Supports multiple input types:
  - Number inputs with validation
  - Time pickers
  - Boolean switches
  - Percentage sliders
- Real-time validation
- Min/max constraints
- Unit display

#### PriorityWeightsEditor
- Visual weight distribution chart
- Interactive sliders for each weight
- Real-time validation (must sum to 1.0)
- Auto-normalize functionality
- Reset to defaults
- Color-coded categories

#### RuleTestResults
- Summary cards with violation counts
- Violations grouped by type and severity
- Detailed violation information
- Affected entities display
- Resolution suggestions
- Auto-resolvable indicators
- Accordion interface for organized viewing

## Scheduling Rules Supported

### Time Constraints
- `max_daily_hours` - Maximum hours per day (1-12)
- `min_gap_between_classes` - Minimum break time (0-120 min)
- `max_gap_between_classes` - Maximum gap allowed (60-360 min)
- `earliest_class_time` - Earliest start time (HH:MM)
- `latest_class_time` - Latest end time (HH:MM)

### Weekly Constraints
- `max_weekly_hours` - Maximum credit hours per week (12-30)
- `preferred_days_off` - Days with no classes
- `allow_back_to_back` - Allow classes with no gap

### Section Constraints
- `max_students_per_section` - Maximum capacity (15-50)
- `min_students_per_section` - Minimum enrollment (5-30)
- `allow_section_overflow` - Allow capacity overflow
- `overflow_percentage` - Maximum overflow percentage (0-20%)

### Faculty Constraints
- `respect_faculty_availability` - Honor faculty preferences
- `max_faculty_daily_hours` - Maximum teaching hours (2-10)
- `min_gap_between_faculty_classes` - Minimum break time (10-60 min)

### Exam Constraints
- `min_days_between_exams` - Minimum spacing (0-7 days)
- `avoid_exam_conflicts` - Prevent overlapping exams
- `max_exams_per_day` - Maximum exams per student (1-4)

### Elective Preferences
- `honor_elective_preferences` - Respect student choices
- `min_preference_rank_to_honor` - Top N preferences (1-5)

### Room Constraints
- `require_room_assignment` - All sections need rooms
- `respect_room_capacity` - Enforce capacity limits

## Priority Weights

Configurable weights for schedule optimization (must sum to 1.0):

- `time_preference` (0.0-1.0) - Preferred time slots
- `faculty_preference` (0.0-1.0) - Faculty availability
- `elective_preference` (0.0-1.0) - Student elective choices
- `minimize_gaps` (0.0-1.0) - Reduce gaps between classes
- `room_optimization` (0.0-1.0) - Efficient room utilization
- `load_balancing` (0.0-1.0) - Balanced faculty loads

**Default Weights:**
```json
{
  "time_preference": 0.2,
  "faculty_preference": 0.2,
  "elective_preference": 0.15,
  "minimize_gaps": 0.15,
  "room_optimization": 0.15,
  "load_balancing": 0.15
}
```

## Conflict Detection

### Severity Levels
- **Critical** - Must be resolved (e.g., room double-booking)
- **Error** - Should be fixed (e.g., capacity exceeded)
- **Warning** - Review recommended (e.g., under-enrollment)
- **Info** - Informational notices

### Conflict Types
- Time overlap
- Exam overlap
- Capacity exceeded
- Prerequisite violation
- Room conflict
- Faculty conflict
- Constraint violation
- Elective unavailable
- Excessive daily/weekly load
- Large gaps
- Faculty unavailable
- Missing required course

## User Experience Features

### Visual Indicators
- ✅ Active rules - Green checkmark
- ⚠️ Inactive rules - Warning icon
- 📊 Visual weight distribution chart
- 🎯 Important rules highlighted
- 📈 Real-time validation feedback

### Helpful Features
- Default configuration provided
- Unsaved changes warning
- Auto-normalize weights
- Reset to defaults
- Test before applying
- Detailed error messages
- Resolution suggestions

## Navigation

Access from Scheduler Dashboard:
```
Committee Dashboard → Rules & Settings → Configure Rules
```

Or direct URL:
```
/committee/scheduler/rules?term=2025-1
```

## Testing Workflow

1. **Configure Rules** - Set scheduling constraints
2. **Adjust Weights** - Prioritize optimization criteria
3. **Test Rules** - Validate against current schedule
4. **Review Results** - Check violations and suggestions
5. **Save Configuration** - Apply to schedule generation

## Technical Implementation

### File Structure
```
src/
├── app/
│   ├── api/committee/scheduler/rules/
│   │   ├── route.ts                    # CRUD operations
│   │   └── test/route.ts               # Testing endpoint
│   └── committee/scheduler/rules/
│       └── page.tsx                    # Main rules page
├── components/committee/scheduler/rules/
│   ├── RulesTable.tsx                  # Rules display
│   ├── RuleForm.tsx                    # Rule editor
│   ├── PriorityWeightsEditor.tsx       # Weights config
│   ├── RuleTestResults.tsx             # Test results
│   └── index.ts                        # Exports
└── supabase/migrations/
    └── 20250128_scheduling_rules.sql   # Database schema
```

### Data Flow
1. User loads rules page
2. Fetch current/default configuration
3. User modifies rules or weights
4. Client-side validation
5. Test rules against schedule (optional)
6. Save configuration to database
7. Configuration used in schedule generation

## Integration Points

### Schedule Generator
- Reads active rules configuration for term
- Applies constraints during generation
- Uses priority weights for optimization
- Reports violations during generation

### Conflict Checker
- Validates schedules against rules
- Detects constraint violations
- Generates detailed conflict reports

### Student Schedules
- Individual schedules respect rules
- Elective preferences honored per configuration
- Time constraints enforced

## Security

### Authentication
- Requires authenticated user
- Committee member role required

### Authorization
- RLS policies enforce role-based access
- Only committee members can view/modify
- User tracked on create/update

### Validation
- Server-side validation of all inputs
- Constraint checks on rules
- Weight sum validation
- SQL injection protection via Supabase

## Performance Considerations

- JSONB storage for flexible rule definitions
- Indexed queries for fast retrieval
- Single active config per term constraint
- Efficient conflict checking algorithms
- Caching of test results

## Future Enhancements

1. **Custom Rules Builder**
   - Visual rule builder interface
   - Complex constraint composition
   - Custom validation logic

2. **Rule Templates**
   - Save and reuse rule sets
   - Share configurations between terms
   - Import/export functionality

3. **Advanced Testing**
   - Schedule simulation
   - What-if analysis
   - Historical comparison
   - Performance metrics

4. **Rule Versioning**
   - Track rule changes over time
   - Rollback capability
   - Audit trail

5. **Machine Learning Integration**
   - Suggest optimal weights
   - Learn from past schedules
   - Predict conflicts

## Migration Instructions

### Database Setup
```bash
# Apply migration
supabase migration up

# Or for local development
psql -f supabase/migrations/20250128_scheduling_rules.sql
```

### Verify Installation
1. Navigate to `/committee/scheduler/rules`
2. Verify default configuration loads
3. Test rule editing
4. Test weights adjustment
5. Run rules test against schedule

## Support

For issues or questions:
- Check conflict resolution suggestions
- Review default configuration
- Test rules incrementally
- Consult system logs for API errors

## Success Metrics

- ✅ All API endpoints functional
- ✅ Database schema created
- ✅ UI components responsive
- ✅ Validation working correctly
- ✅ Testing functionality operational
- ✅ No linting errors
- ✅ Integration with scheduler dashboard
- ✅ Documentation complete

## Conclusion

Phase 6 provides a robust, user-friendly system for configuring scheduling rules. Committee members can now:
- Define comprehensive scheduling constraints
- Prioritize optimization criteria
- Test rules before applying
- Resolve conflicts proactively
- Ensure high-quality schedule generation

The system is production-ready and fully integrated with the automated schedule generator.

