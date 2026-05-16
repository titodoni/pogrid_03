"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ type = "card" }: { type?: "card" | "list" | "detail" }) {
  if (type === "list") {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4 space-y-3">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[140px]" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Skeleton className="h-4 w-[160px]" />
        <Skeleton className="h-3 w-[100px]" />
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>
  );
}