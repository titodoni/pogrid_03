"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Coba Lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
}