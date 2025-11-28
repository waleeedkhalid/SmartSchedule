/**
 * Elective Browser Component
 * Browse and register for elective sections
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { getAvailableElectives, getStudentEnrollments } from "@/app/student/register-electives/actions";
import { Search, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ElectiveSection {
  id: string;
  course_code: string;
  capacity: number;
  enrolled_count: number;
  course: {
    code: string;
    name: string;
    description?: string;
    credits: number;
    department?: string;
  };
  section_time?: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
  instructor?: {
    full_name: string;
  };
  room?: {
    number: string;
  };
}

export function ElectiveBrowser() {
  const [sections, setSections] = useState<ElectiveSection[]>([]);
  const [enrolledSectionIds, setEnrolledSectionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // Load sections and enrollments
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch both electives and current enrollments in parallel
      const [electivesResult, enrollmentsResult] = await Promise.all([
        getAvailableElectives(),
        getStudentEnrollments(),
      ]);

      if (electivesResult.success) {
        setSections(electivesResult.data as ElectiveSection[]);
      }

      if (enrollmentsResult.success) {
        const enrolledIds = new Set(
          enrollmentsResult.data.map((e: any) => e.section_id)
        );
        setEnrolledSectionIds(enrolledIds);
      }
    } catch (error) {
      console.error("Error loading electives:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(
      sections.map((s) => s.course.department || "Unknown")
    );
    return Array.from(depts).sort();
  }, [sections]);

  // Filter sections
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCode = section.course.code.toLowerCase().includes(query);
        const matchesName = section.course.name.toLowerCase().includes(query);
        const matchesDesc = section.course.description
          ?.toLowerCase()
          .includes(query);
        if (!matchesCode && !matchesName && !matchesDesc) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== "all") {
        if (section.course.department !== departmentFilter) {
          return false;
        }
      }

      // Availability filter
      if (availabilityFilter === "available") {
        if (section.enrolled_count >= section.capacity) {
          return false;
        }
      } else if (availabilityFilter === "enrolled") {
        if (!enrolledSectionIds.has(section.id)) {
          return false;
        }
      }

      return true;
    });
  }, [sections, searchQuery, departmentFilter, availabilityFilter, enrolledSectionIds]);

  const handleEnrollmentChange = () => {
    // Reload data when enrollment changes
    loadData();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setAvailabilityFilter("all");
  };

  const hasActiveFilters =
    searchQuery || departmentFilter !== "all" || availabilityFilter !== "all";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by code, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
              <SelectItem value="enrolled">My Enrollments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {departmentFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Department: {departmentFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDepartmentFilter("all")}
                />
              </Badge>
            )}
            {availabilityFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {availabilityFilter === "available"
                  ? "Available Only"
                  : "My Enrollments"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setAvailabilityFilter("all")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredSections.length} of {sections.length} elective
        sections
      </div>

      {/* Sections Grid */}
      {filteredSections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No sections found</p>
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear filters to see all sections
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isEnrolled={enrolledSectionIds.has(section.id)}
              onEnrollmentChange={handleEnrollmentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

