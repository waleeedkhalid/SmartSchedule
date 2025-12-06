/**
 * API Endpoints Mapping Tests
 *
 * Tests to validate API endpoint configuration
 */

import { API_ENDPOINTS } from "@/app/mobile/lib/api/endpoints";

describe("API Endpoints Configuration", () => {
  describe("Endpoint Structure", () => {
    it("should have all required authentication endpoints", () => {
      expect(API_ENDPOINTS.AUTH).toBeDefined();
      expect(API_ENDPOINTS.AUTH.LOGIN).toBeDefined();
      expect(API_ENDPOINTS.AUTH.LOGOUT).toBeDefined();
      expect(API_ENDPOINTS.AUTH.ME).toBeDefined();
    });

    it("should have all required academic term endpoints", () => {
      expect(API_ENDPOINTS.ACADEMIC_TERMS).toBeDefined();
      expect(API_ENDPOINTS.ACADEMIC_TERMS.LIST).toBeDefined();
      expect(API_ENDPOINTS.ACADEMIC_TERMS.DETAIL).toBeDefined();
    });

    it("should have all required course endpoints", () => {
      expect(API_ENDPOINTS.COURSES).toBeDefined();
      expect(API_ENDPOINTS.COURSES.LIST).toBeDefined();
      expect(API_ENDPOINTS.COURSES.DETAIL).toBeDefined();
    });

    it("should have all required section endpoints", () => {
      expect(API_ENDPOINTS.SECTIONS).toBeDefined();
      expect(API_ENDPOINTS.SECTIONS.LIST).toBeDefined();
      expect(API_ENDPOINTS.SECTIONS.DETAIL).toBeDefined();
      expect(API_ENDPOINTS.SECTIONS.CHECK_CONFLICTS).toBeDefined();
    });

    it("should have all required enrollment endpoints", () => {
      expect(API_ENDPOINTS.ENROLLMENTS).toBeDefined();
      expect(API_ENDPOINTS.ENROLLMENTS.LIST).toBeDefined();
      expect(API_ENDPOINTS.ENROLLMENTS.CREATE).toBeDefined();
      expect(API_ENDPOINTS.ENROLLMENTS.DELETE).toBeDefined();
    });

    it("should have all required schedule endpoints", () => {
      expect(API_ENDPOINTS.SCHEDULES).toBeDefined();
      expect(API_ENDPOINTS.SCHEDULES.ME).toBeDefined();
      expect(API_ENDPOINTS.SCHEDULES.LIST).toBeDefined();
      expect(API_ENDPOINTS.SCHEDULES.GENERATE).toBeDefined();
    });
  });

  describe("Endpoint URL Format", () => {
    it("should have proper base URL in all endpoints", () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toContain("/api/v1");
      expect(API_ENDPOINTS.COURSES.LIST).toContain("/api/v1");
      expect(API_ENDPOINTS.ENROLLMENTS.LIST).toContain("/api/v1");
    });

    it("should have parameterized endpoints for detail views", () => {
      const courseId = "123";
      const detailUrl = API_ENDPOINTS.COURSES.DETAIL(courseId);
      expect(detailUrl).toContain(courseId);
    });
  });

  describe("Endpoint Consistency", () => {
    it("should have consistent API versioning in main endpoints", () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toContain("/api/v1");
      expect(API_ENDPOINTS.COURSES.LIST).toContain("/api/v1");
      expect(API_ENDPOINTS.ENROLLMENTS.LIST).toContain("/api/v1");
      expect(API_ENDPOINTS.SCHEDULES.ME).toContain("/api/v1");
    });
  });
});
