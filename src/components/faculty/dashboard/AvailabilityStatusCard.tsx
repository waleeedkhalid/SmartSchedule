"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

interface AvailabilityData {
  hasSubmitted: boolean;
  lastUpdated: string | null;
  totalSlots: number;
}

export function AvailabilityStatusCard() {
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/faculty/availability");
        const result = await response.json();

        if (result.success && result.data) {
          const availabilityData = result.data.availability_data || {};
          const totalSlots = Object.values(availabilityData).filter(
            Boolean
          ).length;

          setAvailability({
            hasSubmitted: totalSlots > 0,
            lastUpdated: result.data.lastUpdated,
            totalSlots,
          });
        } else {
          setAvailability({
            hasSubmitted: false,
            lastUpdated: null,
            totalSlots: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailability({
          hasSubmitted: false,
          lastUpdated: null,
          totalSlots: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  if (loading) {
    return (
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Teaching Availability</CardTitle>
            </div>
          </div>
          <CardDescription>Loading availability status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Teaching Availability</CardTitle>
          </div>
          {availability?.hasSubmitted ? (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Submitted
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage your preferred teaching time slots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability?.hasSubmitted ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Slots</span>
              <span className="font-semibold">{availability.totalSlots}</span>
            </div>
            {availability.lastUpdated && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(availability.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="pt-2">
              <Link href="/faculty/availability">
                <Button variant="outline" className="w-full">
                  Update Availability
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have not submitted your teaching availability yet. Submit your
              preferences to help the scheduling committee.
            </p>
            <Link href="/faculty/availability">
              <Button className="w-full">Submit Availability</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

