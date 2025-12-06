/**
 * Error Handler Tests
 *
 * Tests for centralized error handling and response formatting
 */

import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  ErrorCodes,
  ApiException,
} from "@/lib/api/error-handler";

describe("Error Handler", () => {
  describe("createSuccessResponse", () => {
    it("should return success response with data", () => {
      const data = { id: "1", name: "Test" };
      const response = createSuccessResponse(data, 200);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );
    });

    it("should handle custom status codes", () => {
      const response = createSuccessResponse({ created: true }, 201);
      expect(response.status).toBe(201);
    });
  });

  describe("createErrorResponse", () => {
    it("should return error response with proper format", () => {
      const response = createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid input"
      );

      expect(response.status).toBe(400);
    });

    it("should include error details when provided", () => {
      const details = { field: "email", reason: "invalid format" };
      const response = createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Validation failed",
        details
      );

      expect(response.status).toBe(400);
    });

    it("should handle different error codes", () => {
      const testCodes = [
        { code: ErrorCodes.AUTH_REQUIRED, status: 401 },
        { code: ErrorCodes.FORBIDDEN, status: 403 },
        { code: ErrorCodes.NOT_FOUND, status: 404 },
      ];

      testCodes.forEach(({ code, status }) => {
        const response = createErrorResponse(status, code, "Error message");
        expect(response.status).toBe(status);
      });
    });
  });

  describe("ApiException", () => {
    it("should create exception with proper properties", () => {
      const error = new ApiException(
        401,
        ErrorCodes.AUTH_REQUIRED,
        "Unauthorized"
      );

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe(ErrorCodes.AUTH_REQUIRED);
      expect(error.message).toBe("Unauthorized");
    });

    it("should be instanceof Error", () => {
      const error = new ApiException(
        500,
        ErrorCodes.INTERNAL_ERROR,
        "Server error"
      );
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("handleApiError", () => {
    it("should handle ApiException", () => {
      const apiError = new ApiException(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid"
      );
      const response = handleApiError(apiError);

      expect(response.status).toBe(400);
    });

    it("should handle Error objects", () => {
      const error = new Error("Test error");
      const response = handleApiError(error);

      expect(response.status).toBe(500);
    });

    it("should handle unknown errors", () => {
      const response = handleApiError("unknown error");
      expect(response.status).toBe(500);
    });
  });
});
