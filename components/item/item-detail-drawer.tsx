"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Item, ItemProgress, Department, Problem } from "@/app/generated/prisma/browser";
import { ProgressSnapshot } from "./progress-snapshot";
import { DepartmentProgressRow } from "./department-progress-row";
import { LineagePill } from "./lineage-pill";
import { ProblemBadge } from "./problem-badge";

interface ItemDetailDrawerProps {
  item?: Item & {
    productionOrder: {
      internalPoNumber: string;
      client: { name: string };
      dueDate?: Date | null;
      manualUrgencyLevel?: string | null;
    };
    progress: (ItemProgress & { department: Department })[];
    problems: Problem[];
    requiredDepartments: Department[];
    parentItem?: { name: string } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailDrawer({ item, open, onOpenChange }: ItemDetailDrawerProps) {
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:max-w-lg sm:h-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{item.name}</SheetTitle>
          <SheetDescription className="text-left">
            {item.productionOrder.internalPoNumber} • {item.productionOrder.client.name}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="ringkasan" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="masalah">Masalah</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ringkasan" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Informasi Item</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>{item.status}</span>
                </div>
              </div>
            </div>
            
            {item.isRework && item.parentItem && (
              <LineagePill type="REWORK" parentName={item.parentItem.name} />
            )}
            {item.isReturn && item.parentItem && (
              <LineagePill type="RETURN" parentName={item.parentItem.name} />
            )}
          </TabsContent>
          
          <TabsContent value="progress">
            <ProgressSnapshot 
              progress={item.progress} 
              requiredDepartments={item.requiredDepartments} 
            />
            <div className="mt-4 space-y-1">
              {item.progress.map((p) => (
                <DepartmentProgressRow
                  key={p.id}
                  progress={p}
                  hasProblem={item.problems.some(prob => !prob.isResolved)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="masalah">
            {item.problems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Tidak ada masalah.</p>
            ) : (
              <div className="space-y-2">
                {item.problems.map((problem) => (
                  <div key={problem.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{problem.category.replace(/_/g, ' ')}</span>
                      <ProblemBadge count={problem.isResolved ? 0 : 1} hasProblem={!problem.isResolved} />
                    </div>
                    {problem.note && (
                      <p className="text-xs text-muted-foreground mt-1">{problem.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}