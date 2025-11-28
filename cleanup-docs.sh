#!/bin/bash
# SmartSchedule Documentation Cleanup Script
# Purpose: Archive old status documents and keep only essential docs

echo "🧹 SmartSchedule Documentation Cleanup"
echo "======================================="
echo ""

# Create archive directory
echo "Creating archive directory..."
mkdir -p docs/archive/old-status-reports

# Archive status documents
echo "Archiving status documents..."
mv PHASE-*.md docs/archive/old-status-reports/ 2>/dev/null
mv MEGA-SESSION*.md docs/archive/old-status-reports/ 2>/dev/null
mv IMPLEMENTATION-*.md docs/archive/old-status-reports/ 2>/dev/null
mv TEST-*.md docs/archive/old-status-reports/ 2>/dev/null
mv *-COMPLETE.md docs/archive/old-status-reports/ 2>/dev/null
mv DELIVERY-SUMMARY.md docs/archive/old-status-reports/ 2>/dev/null
mv VERIFICATION-REPORT.md docs/archive/old-status-reports/ 2>/dev/null
mv TDD-IMPLEMENTATION-STATUS.md docs/archive/old-status-reports/ 2>/dev/null

# Archive performance and feature reports
echo "Archiving performance reports..."
mv AVAILABILITY-DOUBLE-LOADING-FIX.md docs/archive/old-status-reports/ 2>/dev/null
mv DASHBOARD-PERFORMANCE-FIX.md docs/archive/old-status-reports/ 2>/dev/null
mv FACULTY-*.md docs/archive/old-status-reports/ 2>/dev/null
mv NAVIGATION-*.md docs/archive/old-status-reports/ 2>/dev/null
mv NO-LOADING-STATES.md docs/archive/old-status-reports/ 2>/dev/null
mv SHADCN-UI-ENHANCEMENTS.md docs/archive/old-status-reports/ 2>/dev/null

# Archive test and coverage reports
echo "Archiving test reports..."
mv COMPREHENSIVE-*.md docs/archive/old-status-reports/ 2>/dev/null
mv FEATURE-TEST-*.md docs/archive/old-status-reports/ 2>/dev/null

# Move PLAN.md to archive (replaced by new documents)
echo "Archiving old plan..."
mv PLAN.md docs/archive/old-status-reports/ 2>/dev/null

# Keep essential documents
echo ""
echo "✅ Essential documents (kept in root):"
echo "   - START-HERE.md (your entry point)"
echo "   - SYSTEM-ANALYSIS.md (what works/doesn't work)"
echo "   - CRITICAL-GAPS-DETAILED.md (detailed gaps)"
echo "   - PRD-SIMPLIFIED-MVP.md (simplified plan)"
echo "   - README.md (project overview)"
echo ""

# Count archived files
ARCHIVED_COUNT=$(find docs/archive/old-status-reports -type f 2>/dev/null | wc -l)
echo "📦 Archived $ARCHIVED_COUNT old status documents"
echo ""

# List what's still in root
echo "📄 Current root documentation:"
ls -1 *.md 2>/dev/null | grep -v node_modules | head -20
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Read START-HERE.md"
echo "2. Choose Path A (simple) or Path B (AI)"
echo "3. Start implementation"

