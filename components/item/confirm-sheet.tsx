"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  destructive = false,
  loading = false,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={destructive ? "destructive" : "default"} 
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}