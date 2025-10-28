# Production Deployment Guide

## Overview

This guide covers the requirements, checklist, and procedures for deploying SmartSchedule V2 to production.

## Pre-Deployment Requirements

### 1. Environment Configuration

Create a `.env.local` file (or configure environment variables in your hosting platform):

```bash
# Production Mode
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Feature Flags
ENABLE_DEMO_MODE=false  # MUST be false in production
```

### 2. Database Requirements

**Minimum Data Required:**

| Resource | Minimum Count | Recommended | Critical? |
|----------|--------------|-------------|-----------|
| Courses | 10+ | 30+ | ✅ Yes |
| Instructors | 5+ | 10+ | ✅ Yes |
| Rooms | 5+ | 15+ | ✅ Yes |
| Sections | 5+ | 50+ | ⚠️ Warn |
| Student Groups | 1+ | 4+ | ✅ Yes |
| Exams | 0+ | Any | ℹ️ Optional |

**Data Quality Checks:**
- ✅ All courses have credits and weekly hours set
- ✅ All instructors have valid email addresses
- ✅ All rooms have capacity information
- ✅ All sections have assigned instructors and rooms
- ✅ No conflicting time slots in sections
- ✅ Student groups exist for each level

### 3. Production Readiness Validation

Use the built-in validation utility:

```typescript
import { checkProductionReadiness } from '@/lib/utils/production-check';

const result = await checkProductionReadiness();
console.log(result.ready); // true/false
console.log(result.warnings); // Array of warnings
console.log(result.critical_missing); // Array of missing critical data
console.log(result.data_counts); // Counts for each resource
```

## Deployment Checklist

### Phase 1: Data Preparation

- [ ] **Import Initial Data**
  - Run seed script: `pnpm db:seed` (with enhanced data)
  - Or import production data via Import/Export UI
  - Verify data counts meet minimum requirements

- [ ] **Validate Database**
  - Check all courses have valid data
  - Verify instructor information is complete
  - Ensure room capacities are set
  - Validate student group configurations

- [ ] **Generate Initial Schedule** (if applicable)
  - Run schedule generation for current semester
  - Verify no conflicts detected
  - Review section assignments

### Phase 2: Configuration

- [ ] **Environment Variables**
  - Set `NODE_ENV=production`
  - Configure Supabase connection
  - Set `ENABLE_DEMO_MODE=false`
  - Configure application URL

- [ ] **Supabase Project**
  - Apply all migrations to production database
  - Enable Row Level Security on all tables
  - Verify RLS policies are active
  - Test authentication flow

- [ ] **Security**
  - Rotate service role key if needed
  - Verify API endpoints are protected
  - Test role-based access control
  - Check for exposed secrets

### Phase 3: Testing

- [ ] **Empty State Testing**
  - Test student view with no schedule data (should show empty state)
  - Test exam view with no exam data (should show empty state)
  - Verify helpful messages are displayed

- [ ] **Data Flow Testing**
  - Login as admin → Import data → Verify data appears
  - Login as registrar → Generate schedule → Verify sections created
  - Login as student → View schedule → Verify data displays correctly
  - Login as faculty → View schedule → Verify assignments visible

- [ ] **Role-Based Access**
  - Test admin access to all features
  - Test registrar access to course management
  - Test faculty access to their assignments
  - Test student access to their schedule

- [ ] **Production Validation**
  - Run production readiness check
  - Verify all critical data is present
  - Review and address any warnings
  - Confirm `ready: true` status

### Phase 4: Deployment

- [ ] **Build Verification**
  - Run `pnpm build` locally
  - Fix any build errors or warnings
  - Test production build locally
  - Verify no console errors

- [ ] **Deploy to Hosting Platform**
  - Deploy to Vercel/Netlify/other platform
  - Configure environment variables
  - Set up custom domain
  - Enable HTTPS

- [ ] **Post-Deployment Verification**
  - Test authentication flow
  - Verify database connectivity
  - Test all major user flows
  - Check performance and load times

### Phase 5: User Onboarding

- [ ] **Create Initial Users**
  - Create admin user accounts
  - Create registrar accounts
  - Set up faculty accounts
  - Configure student accounts

- [ ] **User Testing**
  - Have each role test their features
  - Collect feedback on any issues
  - Verify all permissions work correctly
  - Test notification system

## Data Import Methods

### Method 1: Seed Script (Development/Staging)

```bash
# Clear existing data and seed
pnpm db:seed:clear && pnpm db:seed
```

### Method 2: Import/Export UI (Production)

1. Login as admin or registrar
2. Navigate to Dashboard → Import/Export
3. Upload JSON file with production data
4. Verify import success
5. Check data counts

### Method 3: Manual Entry (Small Datasets)

Use the UI to manually create:
- Courses (Dashboard → Courses)
- Instructors (Dashboard → Instructors)
- Rooms (Dashboard → Rooms)
- Student Groups (Dashboard → Student Groups)

## Common Issues & Solutions

### Issue: Students See "No Schedule Available"

**Cause**: No sections exist in database

**Solution**:
1. Login as registrar
2. Navigate to Schedule Generator
3. Generate schedule for current semester
4. Verify sections are created
5. Students should now see their schedules

### Issue: "Student level not set" Error

**Cause**: Student user role doesn't have a level assigned

**Solution**:
1. Admin updates user_roles table
2. Set appropriate level (1-4) for the student
3. Student refreshes and should see schedule

### Issue: Production Readiness Check Fails

**Cause**: Missing critical data in database

**Solution**:
1. Run `checkProductionReadiness()` to see what's missing
2. Import missing data via seed script or Import UI
3. Verify data counts meet minimum requirements
4. Re-run readiness check

## Monitoring

### Key Metrics to Monitor

- **User Authentication**: Track login success/failure rates
- **Data Operations**: Monitor create/update/delete operations
- **Schedule Generation**: Track generation time and success rate
- **Conflict Detection**: Monitor conflicts reported
- **API Response Times**: Track performance of key endpoints

### Logging

Key events to log:
- User authentication events
- Schedule generation operations
- Data import/export operations
- Permission errors
- Database query errors

## Rollback Plan

If issues are encountered post-deployment:

1. **Immediate**: Revert to previous deployment
2. **Database**: Restore from latest backup
3. **Investigation**: Review logs for root cause
4. **Fix**: Address issues in development environment
5. **Re-deploy**: Deploy fix with proper testing

## Security Considerations

### Before Going Live

- [ ] All RLS policies are enabled
- [ ] API routes check authentication
- [ ] Sensitive operations check roles
- [ ] No mock data endpoints are accessible
- [ ] Service role key is not exposed
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (if applicable)

### Regular Security Audits

- Run security advisors: `mcp_supabase_get_advisors`
- Review RLS policies quarterly
- Monitor failed authentication attempts
- Keep dependencies updated

## Performance Optimization

### Database

- Indexes are created for foreign keys
- Complex queries are optimized
- Connection pooling is configured
- Query response times are monitored

### Application

- Static assets are optimized
- Images use Next.js Image component
- Server components used where possible
- Code splitting is implemented

## Support & Maintenance

### User Support

- Document common user flows
- Create FAQ for students/faculty
- Provide contact information
- Set up help desk procedures

### Ongoing Maintenance

- Regular database backups
- Security updates
- Bug fixes
- Feature enhancements
- Performance monitoring

## Related Documentation

- [LOCAL_DEVELOPMENT.md](mdc:src/docs/LOCAL_DEVELOPMENT.md) - Local development setup
- [ROLE_IMPLEMENTATION_SUMMARY.md](mdc:src/docs/ROLE_IMPLEMENTATION_SUMMARY.md) - Role-based access control
- [RLS_FIX_SUMMARY.md](mdc:src/docs/RLS_FIX_SUMMARY.md) - Row Level Security details
- [SUPABASE_CLI_GUIDE.md](mdc:SUPABASE_CLI_GUIDE.md) - Supabase CLI usage
- [README.md](mdc:README.md) - Project overview

## Contact & Support

For deployment issues or questions:
- Review this documentation
- Check existing issues
- Contact the development team

---

**Last Updated**: October 28, 2025
**Version**: 1.0
**Status**: Production Ready (after completing checklist)

