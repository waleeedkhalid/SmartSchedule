# TimePickerLite Integration

## Overview

Replaced native HTML time input with custom TimePickerLite component in ExamTable for better UX and consistency.

**Date:** October 1, 2025

## Changes Made

### 1. Created TimePickerLite Component

**Location:** `/src/components/ui/time-picker-lite.tsx`

**Features:**

- 24-hour or 12-hour format support (configurable)
- Minute step intervals (5, 10, 15, 30 minutes)
- Dropdown selection interface with scrollable columns
- Smooth scrolling to active selection
- Click-outside and ESC key to close
- Accessible ARIA labels
- Styled with inline JSX styles for isolation

**Props:**

```typescript
{
  value?: string;         // "HH:mm" or "h:mm a" if use12Hours
  onChange?: (v: string) => void;
  minuteStep?: number;    // default: 15
  use12Hours?: boolean;   // default: false
  placeholder?: string;   // default: "Select time"
  className?: string;
  width?: number;         // default: 160px
}
```

### 2. Updated ExamTable Component

**Location:** `/src/components/committee/scheduler/ExamTable.tsx`

**Changes:**

- Added import: `import TimePickerLite from "@/components/ui/time-picker-lite";`
- Replaced native `<Input type="time" />` with `<TimePickerLite />`
- Updated label from "Time" to "Time (24h)" for clarity
- Configured with 15-minute intervals, 24-hour format, 130px width

**Before:**

```tsx
<Input
  type="time"
  value={draft.time}
  onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
/>
```

**After:**

```tsx
<TimePickerLite
  value={draft.time}
  onChange={(time) => setDraft((d) => ({ ...d, time }))}
  minuteStep={15}
  use12Hours={false}
  placeholder="Select time"
  width={130}
/>
```

## Benefits

### User Experience

1. **Consistent UX:** Custom component matches application design system
2. **Better Selection:** Dropdown with scrollable columns vs. native browser input
3. **Preset Intervals:** 15-minute steps prevent invalid time selections
4. **Visual Feedback:** Active selection highlighting with smooth scroll
5. **Keyboard Support:** ESC to close, smooth navigation

### Developer Experience

1. **Reusable Component:** Can be used throughout the application
2. **Type-Safe:** Full TypeScript support with proper types
3. **Configurable:** Easy to adjust minute steps, format, width
4. **Self-Contained:** Inline styles prevent CSS conflicts
5. **Accessible:** Proper ARIA attributes and keyboard handling

### Technical Advantages

1. **Cross-Browser Consistency:** Native time inputs vary by browser
2. **Format Control:** Guaranteed "HH:mm" format output
3. **Validation:** Time values are always valid (no manual entry errors)
4. **Performance:** Lightweight with React hooks optimization
5. **No Dependencies:** Pure React component with no external libs

## Usage Example

```tsx
// 24-hour format with 15-minute intervals
<TimePickerLite
  value="14:30"
  onChange={(time) => console.log(time)} // "14:30"
  minuteStep={15}
  use12Hours={false}
/>

// 12-hour format with 5-minute intervals
<TimePickerLite
  value="2:30 PM"
  onChange={(time) => console.log(time)} // "2:30 PM"
  minuteStep={5}
  use12Hours={true}
/>
```

## Component Architecture

### State Management

- `hour`, `minute`, `period` - Current selection state
- `open` - Dropdown visibility
- Uses `useMemo` for efficient list generation
- Parses incoming value with regex for validation

### User Interactions

1. Click trigger button → Opens dropdown
2. Select hour → Updates state
3. Select minute → Updates state + auto-commits + closes dropdown
4. Click outside or ESC → Closes dropdown
5. Value is formatted and passed to `onChange` callback

### Accessibility

- `role="listbox"` for dropdown
- `aria-label` for columns
- `aria-haspopup` and `aria-expanded` for trigger
- Keyboard navigation support (ESC to close)
- Focus-visible outline on trigger

## Future Enhancements

Potential improvements for future iterations:

1. **Keyboard Navigation:**

   - Arrow keys to navigate hours/minutes
   - Enter to select and close
   - Tab to move between columns

2. **Quick Time Selection:**

   - "Now" button to set current time
   - Common time presets (9:00, 12:00, 14:00, etc.)

3. **Time Range Validation:**

   - Min/max time constraints
   - Disable invalid time slots

4. **Visual Enhancements:**

   - Animation on open/close
   - Custom color schemes
   - Icons for time periods

5. **Format Options:**
   - Accept multiple input formats
   - Custom output format string
   - Locale-aware formatting

## Integration Points

This component can be used in:

- ✅ **ExamTable** - Exam scheduling (implemented)
- **Section Meetings** - Meeting time selection
- **Faculty Availability** - Availability time slots
- **External Courses** - Course time entry
- **Time Conflict Detection** - Manual time override

## Testing Checklist

- [x] Component renders correctly
- [x] Dropdown opens/closes properly
- [x] Time selection updates parent state
- [x] 24-hour format works correctly
- [ ] 12-hour format works correctly (not used in exam table)
- [x] Click outside closes dropdown
- [x] ESC key closes dropdown
- [x] Active selection scrolls into view
- [ ] Keyboard navigation (future enhancement)
- [ ] Multiple instances on same page work independently

## Notes

- **Format:** Currently uses 24-hour format for exams (standard academic scheduling)
- **Intervals:** 15-minute steps align with typical exam scheduling practices
- **Width:** 130px fits well in the exam dialog form grid
- **Validation:** Time is required field - validated in submit function
- **Browser Compatibility:** Works consistently across all modern browsers (no native time input quirks)
