# Student Number System

## Overview

Every student receives a unique 8-digit student number after completing onboarding. The student number is automatically generated based on:

- The Hijri year when they first enroll in a term
- A unique sequence number

## Format

**Format:** `{last_3_digits_of_hijri_year}{sequence}` = 8 digits total

- **Year Prefix:** 3 digits (000-999) - Last 3 digits of the Hijri enrollment year
- **Sequence:** 5 digits (00001-99999) - Unique sequence number
- **Note:** Gender and Level are NOT included in the student number format

**Examples:**

- Student enrolled in 1447H → Last 3 digits = 447 → Student number: `44700001`
- Student enrolled in 1550H → Last 3 digits = 550 → Student number: `55000001`
- Student enrolled in 1445H → Last 3 digits = 445 → Student number: `44500001`

## Generation Flow

### 1. During Onboarding

When a student completes onboarding:

1. Student profile is created with `level` and `department`
2. Database trigger `trigger_auto_generate_student_number` fires
3. Trigger calls `get_current_term_hijri_year()` to get the current active term's year
4. Student number is generated using:
   - Current active term's Hijri year (or current year if no active term)
   - Student's level
   - Next available sequence number

### 2. On First Enrollment

When a student enrolls in their first term:

1. Enrollment is created in `student_enrollment` table
2. Trigger `trigger_update_student_number_on_enrollment` fires
3. Trigger gets the actual term's Hijri year from the enrollment
4. If the enrollment year differs from the onboarding year, the student number is updated
5. This ensures the student number reflects the actual first-term enrollment year

## Database Functions

### `generate_student_number(p_user_id, p_level, p_enrollment_year)`

Generates a unique 8-digit student number.

**Parameters:**

- `p_user_id`: Student's user ID
- `p_level`: Academic level (1-8)
- `p_enrollment_year`: Hijri year (optional, defaults to current year or from profile)

**Returns:** 8-digit student number string

**Logic:**

1. Gets enrollment year (from parameter, profile, or current year)
2. Extracts last 3 digits: `enrollment_year % 1000`
3. Pads year prefix to 3 digits (000-999) - already 3 digits, but ensures padding
4. Finds next sequence number for year prefix combination
5. Formats: `{last_3_digits_of_hijri_year}{5-digit-sequence}`

### `get_current_term_hijri_year()`

Gets the Hijri year from the current active academic term (draft or released).

**Returns:** Hijri year integer

### `get_enrollment_year_from_first_term(p_student_id)`

Gets the Hijri year from the first term a student enrolled in.

**Parameters:**

- `p_student_id`: Student's user ID

**Returns:** Hijri year integer or NULL

## Database Triggers

### `trigger_auto_generate_student_number`

**Table:** `student_profile`  
**Event:** BEFORE INSERT OR UPDATE  
**Condition:** `student_number IS NULL AND level IS NOT NULL`

**Action:**

- Gets current term's Hijri year
- Generates student number using `generate_student_number()`
- Sets `enrollment_year` and `student_number` fields

### `trigger_update_student_number_on_enrollment`

**Table:** `student_enrollment`  
**Event:** AFTER INSERT  
**Condition:** `status = 'registered'`

**Action:**

- Gets the term's Hijri year from the enrollment
- If student doesn't have a number, generates one
- If enrollment year differs from profile's enrollment_year, updates the number

## Constraints

1. **Uniqueness:** Student numbers are unique across all students
2. **Format:** Exactly 8 digits, numeric only
3. **Validation:** Database constraint ensures format: `^[0-9]{8}$`
4. **Sequence:** Sequence numbers increment per year combination (max 99999)

## Examples

### Example 1: New Student in Current Term

- **Enrollment Year:** 1447H
- **Last 3 digits:** 447
- **Student Number:** `44700001`

### Example 2: Student Enrolled in Different Year

- **Enrollment Year:** 1550H
- **Last 3 digits:** 550
- **Student Number:** `55000001`

### Example 3: Multiple Students Same Year

- **Student 1:** Year 1447H (447) → `44700001`
- **Student 2:** Year 1447H (447) → `44700002`
- **Student 3:** Year 1447H (447) → `44700003`

### Example 4: Different Years

- **Student 1:** Year 1445H (445) → `44500001`
- **Student 2:** Year 1447H (447) → `44700001`
- **Student 3:** Year 1550H (550) → `55000001`

## Year Prefix Calculation

The year prefix is simply the last 3 digits of the Hijri enrollment year:

```
year_prefix = enrollment_year % 1000
year_prefix_padded = LPAD(year_prefix, 3, '0')  -- Ensure 3 digits
```

**No calculation needed** - just take the last 3 digits directly from the Hijri year.

**Examples:**

- Enrollment year: 1447H → Last 3 digits = 447 → Student number: `44700001`
- Enrollment year: 1550H → Last 3 digits = 550 → Student number: `55000001`
- Enrollment year: 1445H → Last 3 digits = 445 → Student number: `44500001`
- Enrollment year: 1500H → Last 3 digits = 500 → Student number: `50000001`

## Migration History

1. **`add_student_number_field`** - Added `student_number` and `enrollment_year` fields
2. **`update_student_number_generation_with_enrollment_year`** - Added enrollment year tracking
3. **`improve_student_number_generation_with_current_term`** - Use current term year during onboarding
4. **`fix_student_number_format_8_digits`** - Changed from 10 to 8 digits (removed gender component)
5. **`fix_student_number_format_year_first`** - Format: year first, then sequence
6. **`fix_student_number_sequence_uniqueness`** - Fix sequence extraction

## Testing

To test student number generation:

```sql
-- Test generation
SELECT generate_student_number(
  'test-user-id'::uuid,
  4,  -- level
  1447 -- enrollment year
);

-- Should return: 44700001 (8 digits)
```

## Notes

- Student numbers are automatically generated - no manual input required
- Numbers are immutable once assigned (except on first enrollment if year changes)
- The system ensures uniqueness through database constraints and sequence tracking
- Gender is no longer part of the student number format
