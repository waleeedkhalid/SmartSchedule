# Student Elective Selection - Quick Start Guide

## 🚀 Access the Demo

Visit: **`/demo/student/electives`**

## 🔑 Test Credentials

Try any of these:

| Student ID  | Password     | Name               | Level | Completed Courses |
| ----------- | ------------ | ------------------ | ----- | ----------------- |
| `test`      | `test`       | Test Student       | 6     | Basic courses     |
| `441000001` | `student123` | Ahmed Al-Rashid    | 6     | 10 courses        |
| `441000002` | `student123` | Fatimah Al-Zahrani | 7     | 13 courses        |

## 📋 Complete User Journey

### Step 1: Login

1. Enter student ID and password
2. Optionally check "Remember me"
3. Click "Login"
4. Wait for authentication (~1 second)

### Step 2: Browse & Select Courses

1. **Search**: Use the search bar to find courses by code or name
2. **Filter**: Click on package badges to filter by category
3. **View Details**: Hover over course cards to see more information
4. **Select**: Click "Select Course" button on eligible courses
5. **Track Progress**: Watch the selection panel on the right update in real-time

### Step 3: Rank Your Preferences

1. **Reorder**: Use up/down arrows to change course priority
2. **Remove**: Click X icon to remove a course
3. **Monitor Requirements**: Check package completion status
4. **Validate**: Ensure all package requirements are met (green checkmarks)

### Step 4: Review & Submit

1. Click "Review & Submit" button
2. Review the summary dialog:
   - Total courses and credits
   - Package requirements status
   - Ranked course list
3. Complete the confirmation checklist:
   - ✅ Understand these are preferences
   - ✅ Courses are ranked correctly
   - ✅ Prerequisites reviewed
4. Click "Submit Preferences"

### Step 5: Confirmation

1. View submission success screen
2. Note your submission ID
3. Review what happens next
4. Download receipt (optional)
5. Return to dashboard

## 🎯 Key Features to Try

### Search & Filter

- Type "SWE" to see all software engineering courses
- Type "Islamic" to find Islamic studies courses
- Click "University Requirements" badge to filter
- Clear filters with "Clear filter" button

### Selection Management

- Select multiple courses from different packages
- Try to exceed the selection limit (10 courses)
- Try to select ineligible courses (prerequisites not met)
- Reorder courses to change priorities

### Validation

- Try to submit with incomplete packages (warnings appear)
- Complete all packages (green checkmarks)
- Watch real-time progress updates

### Package Requirements

The system validates:

- **University Requirements**: 4 credit hours (4-0 range)
- **Math and Statistics**: 6 credit hours (6-0 range)
- **General Science**: 3 credit hours (3-0 range)
- **Department Electives**: 9 credit hours (9-0 range)

## 🎨 UX Features

### Visual Feedback

- 🟢 **Green**: Eligible courses, completed packages
- 🟡 **Yellow**: Incomplete packages, prerequisites missing
- 🔵 **Blue**: Selected courses, active filters
- **Border**: Selected courses have primary border

### Loading States

- Login: "Logging in..." with spinner
- Submission: "Submitting..." with spinner
- Success: Checkmark animation

### Responsive Design

- **Desktop**: Two-column layout (courses + selection panel)
- **Tablet**: Single column with floating selection
- **Mobile**: Full-width cards, bottom sheet panel

## 🔧 Technical Details

### Components

```typescript
import {
  StudentLoginForm, // Authentication
  ElectiveBrowser, // Main selection interface
  CourseCard, // Individual course display
  SelectionPanel, // Sidebar with selections
  ReviewSubmitDialog, // Confirmation modal
  SubmissionSuccess, // Success screen
} from "@/components/student/electives";
```

### API Routes

```typescript
// Login
POST /api/auth/student
{ studentId: string, password: string }

// Submit
POST /api/electives/submit
{ studentId: string, selections: Array<...> }

// Get submissions
GET /api/electives/submit?studentId=xxx
```

### State Management

```typescript
// Login state
const [studentSession, setStudentSession] = useState<StudentSession | null>(
  null
);

// Selection state
const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);

// Flow control
const [flowStep, setFlowStep] = useState<"login" | "selection" | "success">(
  "login"
);
```

## 🐛 Troubleshooting

### Issue: Login fails

- **Check**: Are you using correct credentials? (see table above)
- **Try**: Use `test` / `test` for simplest login
- **Check**: Browser console for error messages

### Issue: Can't select course

- **Check**: Is the course showing "Not eligible"?
- **Reason**: Missing prerequisites
- **Solution**: Review prerequisite requirements on card

### Issue: Can't submit

- **Check**: Are all package requirements complete? (green checkmarks)
- **Solution**: Add more courses to incomplete packages
- **Check**: Have you checked all confirmation boxes?

### Issue: Reordering not working

- **Check**: Are you clicking the up/down arrows?
- **Try**: Click directly on arrow buttons (not the course card)
- **Note**: First course can't move up, last can't move down

## 📱 Mobile Testing

1. Open Chrome DevTools
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Test the complete flow
5. Verify:
   - Touch targets are easy to tap
   - Selection panel is accessible
   - Forms are easy to fill

## 🎓 Learning Objectives

By testing this system, you'll experience:

1. **User-Centered Design**: Intuitive, step-by-step flow
2. **Real-Time Validation**: Immediate feedback on actions
3. **Progressive Disclosure**: Information revealed when needed
4. **Error Prevention**: System prevents invalid actions
5. **Clear Communication**: Status always visible
6. **Confirmation Patterns**: Review before commit

## 📊 Expected Behavior

### Successful Flow

```
Login (1s) → Browse (2-5min) → Select (2-3min) → Review (1min) → Submit (1s) → Success
Total time: 6-10 minutes
```

### Package Completion Example

```
✅ University Requirements: 4/4 hours (2 courses)
✅ Math and Statistics: 6/6 hours (2 courses)
✅ General Science: 3/3 hours (1 course)
✅ Department Electives: 9/9 hours (3 courses)

Total: 8 courses, 22 credit hours
Status: Ready to submit ✓
```

## 🔗 Related Documentation

- **Full UX Design**: `docs/UX-STUDENT-ELECTIVE-FLOW.md`
- **Implementation Guide**: `docs/STUDENT-ELECTIVE-IMPLEMENTATION.md`
- **API Documentation**: Inline comments in API route files
- **Component Props**: TypeScript definitions in component files

## 💡 Tips for Best Experience

1. **Use Chrome or Firefox** for best compatibility
2. **Enable JavaScript** (required)
3. **Allow cookies** for "Remember me" feature
4. **Use desktop for first try** to see full layout
5. **Test mobile after** to appreciate responsiveness

## 🎉 Success Indicators

You'll know it's working when you see:

- ✅ Smooth transitions between steps
- ✅ Instant feedback on selections
- ✅ Clear progress indicators
- ✅ No confusion about next steps
- ✅ Submission ID displayed at end

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review console errors (F12)
3. Try different test credentials
4. Restart with fresh login

---

**Enjoy exploring the student elective selection system!** 🚀

_Built with ❤️ using Next.js, TypeScript, and shadcn/ui_
