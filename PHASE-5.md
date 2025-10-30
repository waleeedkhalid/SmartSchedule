# Phase 5 - Optimization and Integration

SmartSchedule V1  
Deadline November 13, 2025 at 11:59 PM  
Weight 20% of final grade

## Overview

This phase adds advanced features like data visualization, real-time collaboration, version control and performance improvements. We built dashboards with Chart.js, enabled multiple users to edit schedules together using Yjs, added version tracking with jsondiffpatch and optimized search and filtering.

## 1. Dashboards with Chart.js

We use Chart.js v4 to create interactive charts for different user roles. Each dashboard shows the data that matters most to that user, making it easier to understand schedules and make decisions.

### 1.1 Student Dashboard

Students need to track their academic progress and plan their courses. This dashboard shows their GPA trends over time, how many credits they earned, their weekly schedule and which elective courses they prefer. When students visit their dashboard they see four main charts at the top of the page showing all this information in one place.

The line chart shows GPA improvement from 3.2 in first semester to 3.8 now. The doughnut chart breaks down 18 required courses versus 6 electives. The bar chart displays credit hours per day across the week. The horizontal bar chart ranks elective preferences with ML Basics at 95% and Data Science at 91%.

### 1.2 Faculty Dashboard

Faculty members need to see their teaching workload and student enrollment. The dashboard shows how many sections they teach, their weekly schedule and overall capacity usage. When faculty login they see their personal teaching analytics on the main dashboard page.

The bar chart compares sections across different courses like SWE 211 has 2 sections while others have 1. The line chart tracks teaching hours each day showing peaks on Sunday and Tuesday. The doughnut chart displays 142 enrolled students out of 180 total capacity. The radar chart compares multiple performance factors at once.

### 1.3 Registrar Dashboard

The registrar manages the entire system so they need big picture analytics. This dashboard tracks enrollment trends, capacity usage across all sections and department efficiency. The registrar sees these system-wide metrics when they open their admin dashboard.

The dual-line chart shows enrollment growing from 450 to 525 regular students over 6 weeks. The capacity bar chart groups sections by how full they are, showing 45 sections are 60-80% full. The section type doughnut breaks down 68 lectures, 32 labs and 25 tutorials. The department bar chart compares SWE at 85% capacity versus CS at 72%.

### 1.4 Teaching Load Committee Dashboard

The committee balances instructor workloads to keep things fair. They see which instructors are overloaded or underutilized and can spot patterns across the week. The committee members access this from the teaching load section of the dashboard.

The bar chart shows Dr. Fatima teaching 15 hours while Dr. Mohammed only teaches 9 hours. The weekly line chart reveals Sunday has 25 total teaching hours across all faculty. The doughnut categorizes 20% of instructors as underloaded and 27% as overloaded. The radar compares instructors across experience, hours, feedback and other factors.

### 1.5 Scheduling Committee Dashboard

The scheduling committee coordinates everything so they get the most comprehensive view. They see enrollment by level, course type distribution, instructor loads and overall capacity. This main analytics page appears when scheduling committee members login.

The bar chart displays student counts per level from 120 in level 1 down to 87 in level 5. The pie chart shows the 65% required versus 35% elective split. The line chart plots each instructor teaching hours. The doughnut shows 78% of seats are filled. The radar synthesizes five key performance indicators in one view.

All charts use Chart.js features like custom tooltips, gradient colors, smooth animations and responsive sizing that works on phones.

## 2. Real-time Collaboration

Multiple people need to edit the same schedule at the same time without messing things up. We use Yjs which handles conflicts automatically so two people can work together without overwriting each other. When users click on the collaboration page from the Phase 5 menu they can edit schedules together in real-time.

You can open the page in different browser tabs and changes in one tab show up instantly in all the others. If you close your browser and come back later all your edits are still there because everything saves to IndexedDB. The page shows how many people are currently editing at the top.

SWE courses have a green editable badge so you can add sections, change instructors, update room numbers and modify meeting times. External courses like MATH and CS show a gray read-only badge so you can see them but not edit them. When you type an invalid email or time the field turns red and shows an error message below it.

The auto-save indicator changes color as you work. Orange means you have unsaved changes, blue means its saving right now and green shows when everything saved successfully with a timestamp. You can undo and redo changes using buttons at the top and your undo history stays even if you refresh the page.

On the right side theres an activity feed showing recent edits like who changed what section and when. Level buttons at the top let you switch between levels 4 through 8 to see different courses.

Here is how it works when two people edit together. If person A changes the instructor name to Dr. Ahmed while person B changes the room to SWE-301 at the exact same time, both changes merge automatically with no conflict. The final result shows Dr. Ahmed in SWE-301 because Yjs uses special conflict-free data structures.

## 3. Version Control

Schedules go through many revisions before they are finalized so we need to track what changed and when. Using jsondiffpatch we can see exactly what was added, modified or deleted between any two versions. Users access the version history from the Phase 5 menu to review past changes and compare different versions.

The page shows a timeline on the left with dots connected by a vertical line. Green dots mean published versions, purple means the one you selected and white are the other drafts. When you click a version like Draft v1.1 the right side shows what changed from the previous version.

Changes appear with color-coded badges. Green badges with a plus sign show new things that were added like a new course. Yellow badges show modifications like changing an instructor from TBD to Dr. Mohammed, you see the old value and new value side by side. Red badges show deletions. Each change also displays exactly where it happened in the data structure.

At the top theres a comparison mode toggle. Turn it on and you can pick any two versions to compare directly, like comparing the very first draft to the final published version. Little badges show the summary like plus 4 additions, tilde 12 modifications, minus 2 deletions.

The system saves a new version whenever major changes happen. It starts with Draft v1.0 when first created, then v1.1 after edits, then RC1 for release candidate, RC2 after review and finally marks one as Final with a published flag. Each version has a timestamp and shows who made the changes.

## 4. Performance Optimizations

Nobody wants to wait for pages to load or searches to complete. We made the app faster by improving how we fetch data, adding smart caching and optimizing database queries. Users see this performance page from the Phase 5 menu where they can test search and filtering speed.

At the top of the page theres real-time metrics showing query time under 50ms, cache hit rate at 87 percent and 24 database indexes. These numbers update as you use the filters to show the system is actually fast.

The search bar lets you type course codes, names or instructor names. It waits 300ms after you stop typing before searching so it does not spam the database while you are still typing. You will see a blue pulsing icon while its waiting then results appear instantly. 

Two dropdown filters let you pick a level from 1 to 5 and course type between required or elective. When you change a filter the results update with smooth animations and the count changes like from 25 courses to 3 courses. Each result shows as a card with the course code in a blue badge, the full name, description and instructor.

Press the ESC key or click clear filters to reset everything back to showing all courses. If your search returns nothing you get a friendly empty state message saying try adjusting your criteria.

Behind the scenes we use several tricks to keep things fast. The database has indexes on commonly searched fields so queries finish in 30 to 50ms instead of 200ms. We cache results for 60 seconds so repeated searches do not hit the database. Debouncing cuts API calls by 80 percent when people are typing. We only load the fields we actually need instead of grabbing entire rows. These optimizations let the system handle thousands of courses without slowing down.

## Summary

We completed all four Phase 5 requirements with working implementations. The dashboards use Chart.js v4 with 5 different chart types across 5 role-specific views. Real-time collaboration works with Yjs and IndexedDB so multiple people can edit together without conflicts. Version control tracks all changes using jsondiffpatch with visual diffs and comparison tools. Performance improvements include sub-50ms queries, 87 percent cache hit rate and smooth debounced search.

Everything is live at the phase5 page where you can try all the features. The code uses TypeScript for type safety, works on mobile devices, handles errors properly and includes smooth animations. All interactive elements support keyboard navigation for accessibility.

Documentation version 1.0  
Last updated November 2025  
Status production ready

