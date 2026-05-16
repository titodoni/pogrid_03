"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/app/generated/prisma/browser";

interface RoleActionPanelProps {
  role: UserRole;
}

export function RoleActionPanel({ role }: RoleActionPanelProps) {
  const isOperator = role.toString().startsWith("OPERATOR");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Aksi untuk {role.toLowerCase()}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Panel aksi akan muncul di sini sesuai role pengguna.
        </p>
        <div className="space-y-2">
          {role === "ADMIN" && (
            <Button variant="outline" size="sm" className="w-full">
              Override Progress
            </Button>
          )}
          {isOperator && (
            <Button variant="outline" size="sm" className="w-full">
              Update Progress
            </Button>
          )}
          {role === "QC" && (
            <>
              <Button variant="outline" size="sm" className="w-full">
                Pass QC
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Minor Defect
              </Button>
              <Button variant="destructive" size="sm" className="w-full">
                Major Defect
              </Button>
            </>
          )}
          {role === "DELIVERY" && (
            <Button variant="outline" size="sm" className="w-full">
              Konfirmasi Delivery
            </Button>
          )}
          {role === "FINANCE" && (
            <>
              <Button variant="outline" size="sm" className="w-full">
                Tandai Invoiced
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Tandai Paid
              </Button>
            </>
          )}
          {role === "DRAFTER" && (
            <>
              <Button variant="outline" size="sm" className="w-full">
                Setujui Gambar
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Minta Revisi
              </Button>
            </>
          )}
          {role === "PURCHASING" && (
            <Button variant="outline" size="sm" className="w-full">
              Update Milestone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}