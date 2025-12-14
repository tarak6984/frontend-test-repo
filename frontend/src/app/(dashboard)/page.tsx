"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ComplianceChart } from "@/components/dashboard/compliance-chart";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Loader2 } from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/skeletons/card-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useViewport,
  adaptiveLayout,
  getResponsiveSpacing,
  getCardLayout,
} from "@/lib/responsive-helpers";
import { cn } from "@/lib/utils";
import { normalizeApiResponse } from "@/lib/data-helpers";
import { Fund } from "@/types";

export default function DashboardPage() {
  const viewport = useViewport();
  const layoutClasses = adaptiveLayout(viewport);
  const spacingClasses = getResponsiveSpacing(viewport);
  const cardLayout = getCardLayout(viewport);

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["documents-all"],
    queryFn: async () => {
      const { data } = await api.get("/documents");
      return data;
    },
  });

  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ["funds-all"],
    queryFn: async () => {
      const { data } = await api.get("/funds");
      return normalizeApiResponse(data) as any as Fund[];
    },
  });

  if (docsLoading || fundsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        
        <div className={cn(layoutClasses, viewport.isMobile && "flex-col")}>
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className={cn("w-full", spacingClasses)}>
      <div
        className={cn(
          "flex gap-2",
          cardLayout,
          viewport.isMobile
            ? "flex-col"
            : "sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back to Audit Vault.
          </p>
        </div>
      </div>

      <div className={cn(layoutClasses, viewport.isMobile && "flex-col")}>
        <StatsCards documents={documents || []} funds={funds || []} />
      </div>

      <ComplianceChart documents={documents || []} />

      <div
        className={cn(
          "grid gap-6",
          viewport.isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}
      >
        <UpcomingDeadlines />
      </div>

      <RecentActivity documents={documents || []} />
    </div>
  );
}
