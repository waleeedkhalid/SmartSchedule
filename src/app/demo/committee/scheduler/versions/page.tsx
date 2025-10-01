"use client";
import React from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Schedule Version History"
        description="View and compare different versions of the schedule"
      >
        <committee.scheduler.VersionTimeline versions={[]} />
      </PageContainer>
    </>
  );
}
