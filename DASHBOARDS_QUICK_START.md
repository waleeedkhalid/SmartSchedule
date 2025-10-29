# Dashboards Quick Start Guide

## 🎯 Overview

SmartSchedule includes two analytics dashboards built with **Chart.js** for comprehensive data visualization and insights.

**Status**: ✅ Fully Implemented and Working

---

## 📊 Available Dashboards

### 1. Level Overview Dashboard
**URL**: `/dashboard/level-overview`

**What it shows**:
- Course and section distribution across levels 1-8
- Instructor workload by level
- Scheduling conflicts per level
- Section-to-course ratios

**Use cases**:
- Identify which levels need more instructors
- Detect scheduling bottlenecks
- Balance workload across levels
- Monitor conflict resolution progress

---

### 2. Course Overview Dashboard
**URL**: `/dashboard/course-overview`

**What it shows**:
- Overall course statistics
- Section assignment completion rates
- Top courses by section count
- Elective vs Required distribution
- Detailed course search and filtering

**Use cases**:
- Track scheduling progress
- Identify resource-heavy courses
- Monitor section utilization
- Find courses needing attention

---

## 🚀 Quick Access

### From Navigation Menu
1. Log in to SmartSchedule
2. Click **Dashboards** in the sidebar
3. Select:
   - **Level Overview** - for level-based analytics
   - **Course Overview** - for course-based analytics

### Direct URLs
```
https://your-app-url/dashboard/level-overview
https://your-app-url/dashboard/course-overview
```

---

## 📈 Dashboard Features

### Level Overview Dashboard

#### Summary Cards (Top)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│Total Courses│Total Section│  Active     │  Conflicts  │
│     45      │     120     │ Instructors │      2      │
│             │             │     28      │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Tab 1: Distribution
- **Bar Chart**: Courses & Sections by Level
- **Doughnut Chart**: Instructor Distribution

#### Tab 2: Efficiency
- **Line Chart**: Average Sections per Course
- **Detail Cards**: Individual level statistics

#### Tab 3: Workload
- **Interactive**: Click level to see instructor credits
- **Sorted**: Highest workload first

#### Tab 4: Conflicts
- **Bar Chart**: Conflicts per level (color-coded)
- **Alert**: Summary of total conflicts

---

### Course Overview Dashboard

#### Summary Cards (Top)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│Total Courses│Total Section│ Completion  │   Status    │
│     45      │     120     │    Rate     │ Draft/Rel   │
│             │             │     85%     │  90 / 30    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Tab 1: Overview
- **Doughnut Chart**: Course Distribution (Elective/Required)
- **Line Chart**: Completion Rate by Level

#### Tab 2: Top Courses
- **Bar Chart**: Courses with most sections

#### Tab 3: Utilization
- **Doughnut Chart**: Assignment status
- **Metrics**: Detailed utilization breakdown

#### Tab 4: Course Details
- **Search Bar**: Filter by code or name
- **List View**: All courses with:
  - Code, Name, Level, Type
  - Section counts
  - Instructor assignments
  - Completion percentage

---

## 💡 How to Use

### For Scheduling Committee
1. **Start with Level Overview**
   - Check for conflicts (Conflicts tab)
   - Review workload distribution (Workload tab)
   - Identify levels needing attention

2. **Then Course Overview**
   - Monitor completion rate
   - Find unassigned sections (Utilization tab)
   - Review top courses for resource allocation

### For Teaching Load Committee
1. **Use Workload Tab** in Level Overview
   - Review instructor credit hours
   - Identify overloaded instructors
   - Suggest redistributions

### For Registrar
1. **Course Details Tab** in Course Overview
   - Search for specific courses
   - Check section availability
   - Monitor enrollment capacity

---

## 🔧 Technical Details

### Data Updates
- **Real-time**: Data fetches on page load
- **Refresh**: Reload page to get latest data
- **Caching**: Client-side caching for performance

### Chart Interactions
- **Hover**: Show detailed values
- **Legend**: Click to toggle data series
- **Responsive**: Works on all screen sizes

### Performance
- **Load Time**: < 2 seconds
- **Data Points**: Handles 1000+ efficiently
- **Optimization**: Server-side aggregation

---

## 📱 Mobile Support

All dashboards are fully responsive:
- **Desktop**: Full layout with all charts
- **Tablet**: Stacked charts, full functionality
- **Mobile**: Optimized single-column layout

---

## 🎨 Chart Types

### Bar Charts
**Used for**: Distribution comparisons, conflicts
**Features**: 
- Compare multiple metrics
- Color-coded bars
- Horizontal labels

### Line Charts
**Used for**: Trends, completion rates
**Features**:
- Smooth curves
- Filled areas
- Grid lines for precision

### Doughnut Charts
**Used for**: Distribution breakdowns
**Features**:
- Percentage views
- Color-coded segments
- Legend for clarity

---

## 🔍 Sample Insights

### Level Overview Insights
```typescript
// Example data you might see:

Level 4:
- Courses: 8
- Sections: 24
- Avg Sections/Course: 3.0
- Instructors: 6
- Conflicts: 0 ✅

Level 5:
- Courses: 12
- Sections: 30
- Avg Sections/Course: 2.5
- Instructors: 8
- Conflicts: 2 ⚠️
```

### Course Overview Insights
```typescript
// Top courses by sections:

1. SWE401 - Software Engineering Fundamentals - 8 sections
2. SWE402 - Database Systems - 6 sections
3. SWE403 - Web Development - 5 sections
4. SWE404 - Data Structures - 5 sections
5. SWE405 - Algorithms - 4 sections
```

---

## ❓ Troubleshooting

### Dashboard Shows "No Data"
- Check if courses/sections exist in database
- Verify you have proper permissions
- Try refreshing the page

### Charts Not Rendering
- Clear browser cache
- Check browser console for errors
- Ensure JavaScript is enabled

### Slow Loading
- Check network connection
- Verify Supabase connection
- Contact admin if persistent

---

## 🔗 Related Documentation

- [DASHBOARD_IMPLEMENTATION_SUMMARY.md](DASHBOARD_IMPLEMENTATION_SUMMARY.md) - Technical details
- [PRD.md](PRD.md) - Product requirements (Section 8)
- [timeline.md](timeline.md) - Development history

---

## 🎯 Key Metrics (PRD)

✅ **M3**: Dashboard loads in ≤2 seconds  
✅ **Visualization**: Chart.js implementation  
✅ **Responsiveness**: All screen sizes supported  
✅ **Data Accuracy**: Real-time from database  

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review [DASHBOARD_IMPLEMENTATION_SUMMARY.md](DASHBOARD_IMPLEMENTATION_SUMMARY.md)
3. Contact development team

---

**Last Updated**: October 29, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

