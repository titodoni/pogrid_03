-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'OWNER', 'MANAGER', 'SALES', 'QC', 'DELIVERY', 'FINANCE', 'DRAFTER', 'PURCHASING', 'OPERATOR');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('DRAFTING', 'PURCHASING', 'PRODUCTION', 'QC', 'DELIVERY', 'DONE');

-- CreateEnum
CREATE TYPE "ItemSource" AS ENUM ('ORIGINAL', 'REWORK', 'RETURN');

-- CreateEnum
CREATE TYPE "DrawingStatus" AS ENUM ('PENDING', 'APPROVED', 'REDRAW_REQUESTED');

-- CreateEnum
CREATE TYPE "PurchasingMilestone" AS ENUM ('NOT_STARTED', 'ORDER_PLACED', 'VENDOR_CONFIRMED', 'MATERIAL_ARRIVED');

-- CreateEnum
CREATE TYPE "ReworkType" AS ENUM ('MINOR', 'MAJOR');

-- CreateEnum
CREATE TYPE "ReworkReason" AS ENUM ('DIMENSIONS_OUT_OF_SPEC', 'SURFACE_FINISHING_DEFECT', 'CRACK_OR_FRACTURE', 'WRONG_MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('NORMAL', 'ORANGE', 'RED', 'BLOOD_RED');

-- CreateEnum
CREATE TYPE "ProblemCategory" AS ENUM ('MATERIAL_NOT_ARRIVED', 'MATERIAL_MISMATCH', 'MACHINE_TOOL_FAILURE', 'OPERATOR_UNAVAILABLE', 'DRAWING_SPEC_UNCLEAR', 'DRAWING_REDRAW', 'PRODUCTION_BEFORE_PURCHASING_COMPLETE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PROGRESS_UPDATE', 'STAGE_ADVANCE', 'ADMIN_OVERRIDE', 'QC_PASS', 'QC_MINOR_FAIL', 'QC_MAJOR_FAIL', 'REWORK_SPAWNED', 'RETURN_SPAWNED', 'INVOICE_UPDATE', 'EDIT_PO_FIELD', 'FLAG_ESCALATE', 'DELETE_PO', 'PROBLEM_REPORTED', 'PROBLEM_RESOLVED', 'PIN_RESET', 'SELF_PIN_CHANGE', 'USER_CREATED', 'USER_TOGGLED');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#14B8A6',
    "adminWhatsAppNumber" TEXT,
    "poNumberTemplate" TEXT NOT NULL DEFAULT 'PO-{YYYY}-{SEQ}',
    "orangeThresholdDays" INTEGER NOT NULL DEFAULT 7,
    "redThresholdDays" INTEGER NOT NULL DEFAULT 3,
    "billingStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "roleKey" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "internalPoNumber" TEXT NOT NULL,
    "clientPoNumber" TEXT,
    "poDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "manualUrgencyLevel" "UrgencyLevel",
    "isVendorJob" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "parentItemId" TEXT,
    "name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "status" "ItemStatus" NOT NULL DEFAULT 'DRAFTING',
    "source" "ItemSource" NOT NULL DEFAULT 'ORIGINAL',
    "reworkType" "ReworkType",
    "reworkReason" "ReworkReason",
    "reworkReasonNote" TEXT,
    "isRework" BOOLEAN NOT NULL DEFAULT false,
    "isReturn" BOOLEAN NOT NULL DEFAULT false,
    "drawingStatus" "DrawingStatus" NOT NULL DEFAULT 'PENDING',
    "drawingRevisionCount" INTEGER NOT NULL DEFAULT 0,
    "drawingApprovedAt" TIMESTAMP(3),
    "purchasingMilestone" "PurchasingMilestone" NOT NULL DEFAULT 'NOT_STARTED',
    "qcPassedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "draftingStartedAt" TIMESTAMP(3),
    "purchasingStartedAt" TIMESTAMP(3),
    "productionStartedAt" TIMESTAMP(3),
    "qcStartedAt" TIMESTAMP(3),
    "deliveryStartedAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemProgress" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "progressValue" INTEGER NOT NULL DEFAULT 0,
    "completedQuantity" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastUpdatedByUserId" TEXT,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "category" "ProblemCategory" NOT NULL,
    "note" TEXT,
    "reportedByUserId" TEXT,
    "reporterType" "ActorType" NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedByUserId" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetRoleKey" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "poId" TEXT,
    "itemId" TEXT,
    "problemId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fromValue" JSONB,
    "toValue" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemRequiredDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemRequiredDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Workspace_billingStatus_idx" ON "Workspace"("billingStatus");

-- CreateIndex
CREATE INDEX "Department_workspaceId_isActive_idx" ON "Department"("workspaceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Department_workspaceId_name_key" ON "Department"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_workspaceId_roleKey_key" ON "Department"("workspaceId", "roleKey");

-- CreateIndex
CREATE UNIQUE INDEX "Department_workspaceId_stageOrder_key" ON "Department"("workspaceId", "stageOrder");

-- CreateIndex
CREATE INDEX "User_workspaceId_roleKey_isActive_idx" ON "User"("workspaceId", "roleKey", "isActive");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionTokenHash_key" ON "Session"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_workspaceId_idx" ON "Session"("workspaceId");

-- CreateIndex
CREATE INDEX "Client_workspaceId_isActive_idx" ON "Client"("workspaceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Client_workspaceId_name_key" ON "Client"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "ProductionOrder_workspaceId_dueDate_idx" ON "ProductionOrder"("workspaceId", "dueDate");

-- CreateIndex
CREATE INDEX "ProductionOrder_workspaceId_deletedAt_idx" ON "ProductionOrder"("workspaceId", "deletedAt");

-- CreateIndex
CREATE INDEX "ProductionOrder_clientId_idx" ON "ProductionOrder"("clientId");

-- CreateIndex
CREATE INDEX "ProductionOrder_createdByUserId_idx" ON "ProductionOrder"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_workspaceId_internalPoNumber_key" ON "ProductionOrder"("workspaceId", "internalPoNumber");

-- CreateIndex
CREATE INDEX "Item_workspaceId_status_idx" ON "Item"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Item_workspaceId_invoiceStatus_idx" ON "Item"("workspaceId", "invoiceStatus");

-- CreateIndex
CREATE INDEX "Item_productionOrderId_idx" ON "Item"("productionOrderId");

-- CreateIndex
CREATE INDEX "Item_parentItemId_idx" ON "Item"("parentItemId");

-- CreateIndex
CREATE INDEX "Item_isRework_idx" ON "Item"("isRework");

-- CreateIndex
CREATE INDEX "Item_isReturn_idx" ON "Item"("isReturn");

-- CreateIndex
CREATE INDEX "ItemProgress_workspaceId_idx" ON "ItemProgress"("workspaceId");

-- CreateIndex
CREATE INDEX "ItemProgress_departmentId_idx" ON "ItemProgress"("departmentId");

-- CreateIndex
CREATE INDEX "ItemProgress_lastUpdatedByUserId_idx" ON "ItemProgress"("lastUpdatedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemProgress_itemId_departmentId_key" ON "ItemProgress"("itemId", "departmentId");

-- CreateIndex
CREATE INDEX "Problem_workspaceId_isResolved_idx" ON "Problem"("workspaceId", "isResolved");

-- CreateIndex
CREATE INDEX "Problem_itemId_idx" ON "Problem"("itemId");

-- CreateIndex
CREATE INDEX "Problem_reportedByUserId_idx" ON "Problem"("reportedByUserId");

-- CreateIndex
CREATE INDEX "Problem_resolvedByUserId_idx" ON "Problem"("resolvedByUserId");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_targetRoleKey_readAt_idx" ON "Notification"("workspaceId", "targetRoleKey", "readAt");

-- CreateIndex
CREATE INDEX "Notification_targetUserId_readAt_idx" ON "Notification"("targetUserId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_poId_idx" ON "Notification"("poId");

-- CreateIndex
CREATE INDEX "Notification_itemId_idx" ON "Notification"("itemId");

-- CreateIndex
CREATE INDEX "Notification_problemId_idx" ON "Notification"("problemId");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_action_idx" ON "AuditLog"("workspaceId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "_ItemRequiredDepartments_B_index" ON "_ItemRequiredDepartments"("B");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemProgress" ADD CONSTRAINT "ItemProgress_lastUpdatedByUserId_fkey" FOREIGN KEY ("lastUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_poId_fkey" FOREIGN KEY ("poId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemRequiredDepartments" ADD CONSTRAINT "_ItemRequiredDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemRequiredDepartments" ADD CONSTRAINT "_ItemRequiredDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
