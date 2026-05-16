"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-muted-foreground">
          {icon || <Inbox className="h-10 w-10" />}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {action && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}