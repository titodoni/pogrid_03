import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ActorType,
  AuditAction,
  DrawingStatus,
  InvoiceStatus,
  ItemSource,
  ItemStatus,
  PrismaClient,
  Prisma,
  ProblemCategory,
  PurchasingMilestone,
  ReworkReason,
  ReworkType,
  UrgencyLevel,
  UserRole,
} from "../app/generated/prisma/client";
import { hashPin } from "../lib/auth/pin";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number) {
  return daysFromNow(-days);
}

async function resetSeedData() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.itemProgress.deleteMany();
  await prisma.item.updateMany({ data: { parentItemId: null } });
  await prisma.item.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.workspace.deleteMany();
}

async function main() {
  await resetSeedData();

  const staffPinHash = hashPin("2468");
  const superadminPinHash = hashPin("123456");

  const workspace = await prisma.workspace.create({
    data: {
      name: "POgrid Demo Factory",
      primaryColor: "#14B8A6",
      adminWhatsAppNumber: "+6281234567890",
      poNumberTemplate: "PO-{YYYY}-{SEQ}",
      orangeThresholdDays: 7,
      redThresholdDays: 3,
      billingStatus: "ACTIVE",
    },
  });

  const departments = await Promise.all([
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Drafting", roleKey: "DRAFTER", stageOrder: 1 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Purchasing", roleKey: "PURCHASING", stageOrder: 2 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Machining", roleKey: "OPERATOR_MACHINING", stageOrder: 3 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Fabrikasi", roleKey: "OPERATOR_FABRIKASI", stageOrder: 4 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "QC", roleKey: "QC", stageOrder: 5 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Delivery", roleKey: "DELIVERY", stageOrder: 6 },
    }),
    prisma.department.create({
      data: { workspaceId: workspace.id, name: "Finance", roleKey: "FINANCE", stageOrder: 7 },
    }),
  ]);

  const [drafting, purchasing, machining, fabrikasi, qc, delivery, finance] = departments;

  const users = {
    superadmin: await prisma.user.create({
      data: {
        name: "Superadmin Demo",
        role: UserRole.SUPERADMIN,
        roleKey: "SUPERADMIN",
        pinHash: superadminPinHash,
        isActive: true,
      },
    }),
    admin: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: drafting.id,
        name: "Admin Demo",
        role: UserRole.ADMIN,
        roleKey: "ADMIN",
        pinHash: staffPinHash,
      },
    }),
    owner: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        name: "Owner Demo",
        role: UserRole.OWNER,
        roleKey: "OWNER",
        pinHash: staffPinHash,
      },
    }),
    manager: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        name: "Manager Demo",
        role: UserRole.MANAGER,
        roleKey: "MANAGER",
        pinHash: staffPinHash,
      },
    }),
    sales: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        name: "Sales Demo",
        role: UserRole.SALES,
        roleKey: "SALES",
        pinHash: staffPinHash,
      },
    }),
    drafter: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: drafting.id,
        name: "Drafter Demo",
        role: UserRole.DRAFTER,
        roleKey: "DRAFTER",
        pinHash: staffPinHash,
      },
    }),
    purchasing: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: purchasing.id,
        name: "Purchasing Demo",
        role: UserRole.PURCHASING,
        roleKey: "PURCHASING",
        pinHash: staffPinHash,
      },
    }),
    machining: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: machining.id,
        name: "Machining Demo",
        role: UserRole.OPERATOR,
        roleKey: "OPERATOR_MACHINING",
        pinHash: staffPinHash,
      },
    }),
    fabrikasi: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: fabrikasi.id,
        name: "Fabrikasi Demo",
        role: UserRole.OPERATOR,
        roleKey: "OPERATOR_FABRIKASI",
        pinHash: staffPinHash,
      },
    }),
    qc: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: qc.id,
        name: "QC Demo",
        role: UserRole.QC,
        roleKey: "QC",
        pinHash: staffPinHash,
      },
    }),
    delivery: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: delivery.id,
        name: "Delivery Demo",
        role: UserRole.DELIVERY,
        roleKey: "DELIVERY",
        pinHash: staffPinHash,
      },
    }),
    finance: await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        departmentId: finance.id,
        name: "Finance Demo",
        role: UserRole.FINANCE,
        roleKey: "FINANCE",
        pinHash: staffPinHash,
      },
    }),
  };

  const [majuJaya, sumberTeknik, lampungMetalworks] = await Promise.all([
    prisma.client.create({
      data: { workspaceId: workspace.id, name: "PT Maju Jaya", contact: "Budi" },
    }),
    prisma.client.create({
      data: { workspaceId: workspace.id, name: "CV Sumber Teknik", contact: "Rina" },
    }),
    prisma.client.create({
      data: { workspaceId: workspace.id, name: "PT Lampung Metalworks", contact: "Andi" },
    }),
  ]);

  async function createPo(params: {
    number: string;
    clientId: string;
    dueInDays: number;
    notes: string;
    manualUrgencyLevel?: typeof UrgencyLevel[keyof typeof UrgencyLevel];
  }) {
    return prisma.productionOrder.create({
      data: {
        workspaceId: workspace.id,
        clientId: params.clientId,
        internalPoNumber: params.number,
        clientPoNumber: `CLIENT-${params.number}`,
        poDate: daysAgo(3),
        dueDate: daysFromNow(params.dueInDays),
        notes: params.notes,
        manualUrgencyLevel: params.manualUrgencyLevel,
        isVendorJob: false,
        createdByUserId: users.admin.id,
      },
    });
  }

  async function createItem(params: {
    poId: string;
    name: string;
    quantity: number;
    departments: string[];
    status: typeof ItemStatus[keyof typeof ItemStatus];
    source?: typeof ItemSource[keyof typeof ItemSource];
    parentItemId?: string;
    invoiceStatus?: typeof InvoiceStatus[keyof typeof InvoiceStatus];
    isRework?: boolean;
    isReturn?: boolean;
    reworkType?: typeof ReworkType[keyof typeof ReworkType];
    reworkReason?: typeof ReworkReason[keyof typeof ReworkReason];
    reworkReasonNote?: string;
    drawingStatus?: typeof DrawingStatus[keyof typeof DrawingStatus];
    drawingRevisionCount?: number;
    purchasingMilestone?: typeof PurchasingMilestone[keyof typeof PurchasingMilestone];
    stageDates?: Partial<{
      draftingStartedAt: Date;
      purchasingStartedAt: Date;
      productionStartedAt: Date;
      qcStartedAt: Date;
      deliveryStartedAt: Date;
      doneAt: Date;
      drawingApprovedAt: Date;
      qcPassedAt: Date;
      deliveredAt: Date;
    }>;
  }) {
    return prisma.item.create({
      data: {
        workspaceId: workspace.id,
        productionOrderId: params.poId,
        parentItemId: params.parentItemId,
        name: params.name,
        specification: "Sample teknis untuk skenario demo",
        quantity: params.quantity,
        unit: "pcs",
        status: params.status,
        source: params.source ?? ItemSource.ORIGINAL,
        invoiceStatus: params.invoiceStatus ?? InvoiceStatus.PENDING,
        isRework: params.isRework ?? false,
        isReturn: params.isReturn ?? false,
        reworkType: params.reworkType,
        reworkReason: params.reworkReason,
        reworkReasonNote: params.reworkReasonNote,
        drawingStatus: params.drawingStatus ?? DrawingStatus.APPROVED,
        drawingRevisionCount: params.drawingRevisionCount ?? 0,
        purchasingMilestone: params.purchasingMilestone ?? PurchasingMilestone.MATERIAL_ARRIVED,
        requiredDepartments: { connect: params.departments.map((id) => ({ id })) },
        ...params.stageDates,
      },
    });
  }

  async function progress(params: {
    itemId: string;
    departmentId: string;
    value: number;
    completedQuantity?: number;
    userId?: string;
    updatedDaysAgo?: number;
  }) {
    const lastUpdatedAt = daysAgo(params.updatedDaysAgo ?? 0);

    return prisma.itemProgress.create({
      data: {
        workspaceId: workspace.id,
        itemId: params.itemId,
        departmentId: params.departmentId,
        progressValue: params.value,
        completedQuantity: params.completedQuantity,
        startedAt: params.value > 0 ? daysAgo((params.updatedDaysAgo ?? 0) + 1) : undefined,
        completedAt: params.value === 100 ? lastUpdatedAt : undefined,
        lastUpdatedByUserId: params.userId,
        lastUpdatedAt,
      },
    });
  }

  const po1 = await createPo({
    number: "PO-2026-001",
    clientId: majuJaya.id,
    dueInDays: 14,
    notes: "Active normal production sample.",
  });
  const bracketPlate = await createItem({
    poId: po1.id,
    name: "Bracket Plate",
    quantity: 10,
    departments: [machining.id, fabrikasi.id],
    status: ItemStatus.PRODUCTION,
    stageDates: { draftingStartedAt: daysAgo(5), purchasingStartedAt: daysAgo(4), productionStartedAt: daysAgo(2) },
  });
  const boltCustom = await createItem({
    poId: po1.id,
    name: "Bolt Custom",
    quantity: 1,
    departments: [machining.id],
    status: ItemStatus.PRODUCTION,
    stageDates: { draftingStartedAt: daysAgo(4), purchasingStartedAt: daysAgo(3), productionStartedAt: daysAgo(1) },
  });
  await progress({ itemId: bracketPlate.id, departmentId: machining.id, value: 50, completedQuantity: 5, userId: users.machining.id });
  await progress({ itemId: bracketPlate.id, departmentId: fabrikasi.id, value: 0, completedQuantity: 0 });
  await progress({ itemId: boltCustom.id, departmentId: machining.id, value: 33, userId: users.machining.id });

  const po2 = await createPo({
    number: "PO-2026-002",
    clientId: sumberTeknik.id,
    dueInDays: 5,
    notes: "Due soon with purchasing incomplete.",
    manualUrgencyLevel: UrgencyLevel.ORANGE,
  });
  const frameSupport = await createItem({
    poId: po2.id,
    name: "Frame Support",
    quantity: 5,
    departments: [fabrikasi.id],
    status: ItemStatus.PURCHASING,
    purchasingMilestone: PurchasingMilestone.VENDOR_CONFIRMED,
    stageDates: { draftingStartedAt: daysAgo(3), purchasingStartedAt: daysAgo(2) },
  });
  await progress({ itemId: frameSupport.id, departmentId: purchasing.id, value: 66, completedQuantity: 3, userId: users.purchasing.id });

  const po3 = await createPo({
    number: "PO-2026-003",
    clientId: lampungMetalworks.id,
    dueInDays: 2,
    notes: "Red urgency production in progress.",
    manualUrgencyLevel: UrgencyLevel.RED,
  });
  const machineCover = await createItem({
    poId: po3.id,
    name: "Machine Cover",
    quantity: 2,
    departments: [machining.id, fabrikasi.id],
    status: ItemStatus.PRODUCTION,
    stageDates: { draftingStartedAt: daysAgo(4), purchasingStartedAt: daysAgo(3), productionStartedAt: daysAgo(2) },
  });
  await progress({ itemId: machineCover.id, departmentId: machining.id, value: 66, completedQuantity: 1, userId: users.machining.id });
  await progress({ itemId: machineCover.id, departmentId: fabrikasi.id, value: 33, completedQuantity: 1, userId: users.fabrikasi.id });

  const po4 = await createPo({
    number: "PO-2026-004",
    clientId: majuJaya.id,
    dueInDays: -2,
    notes: "Overdue stalled item.",
    manualUrgencyLevel: UrgencyLevel.BLOOD_RED,
  });
  const shaftHousing = await createItem({
    poId: po4.id,
    name: "Shaft Housing",
    quantity: 3,
    departments: [machining.id],
    status: ItemStatus.PRODUCTION,
    stageDates: { draftingStartedAt: daysAgo(8), purchasingStartedAt: daysAgo(7), productionStartedAt: daysAgo(5) },
  });
  await progress({ itemId: shaftHousing.id, departmentId: machining.id, value: 0, completedQuantity: 0, updatedDaysAgo: 3 });

  const po5 = await createPo({
    number: "PO-2026-005",
    clientId: sumberTeknik.id,
    dueInDays: 8,
    notes: "QC queue, pass, and minor defect coverage.",
  });
  const weldedStand = await createItem({
    poId: po5.id,
    name: "Welded Stand",
    quantity: 4,
    departments: [fabrikasi.id],
    status: ItemStatus.QC,
    stageDates: { productionStartedAt: daysAgo(4), qcStartedAt: daysAgo(1) },
  });
  const minorRecheck = await createItem({
    poId: po5.id,
    name: "Panel Frame Minor Recheck",
    quantity: 2,
    departments: [fabrikasi.id],
    status: ItemStatus.QC,
    isRework: true,
    reworkType: ReworkType.MINOR,
    reworkReason: ReworkReason.SURFACE_FINISHING_DEFECT,
    reworkReasonNote: "Finishing perlu dibersihkan ulang.",
    stageDates: { productionStartedAt: daysAgo(3), qcStartedAt: daysAgo(1) },
  });
  await progress({ itemId: weldedStand.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 4, userId: users.fabrikasi.id });
  await progress({ itemId: minorRecheck.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 2, userId: users.fabrikasi.id });
  await progress({ itemId: minorRecheck.id, departmentId: qc.id, value: 0, completedQuantity: 0, userId: users.qc.id });

  const po6 = await createPo({
    number: "PO-2026-006",
    clientId: lampungMetalworks.id,
    dueInDays: 6,
    notes: "Delivery queue sample.",
  });
  const aluminumRail = await createItem({
    poId: po6.id,
    name: "Aluminum Rail",
    quantity: 8,
    departments: [machining.id],
    status: ItemStatus.DELIVERY,
    stageDates: {
      productionStartedAt: daysAgo(4),
      qcStartedAt: daysAgo(2),
      deliveryStartedAt: daysAgo(1),
      qcPassedAt: daysAgo(1),
    },
  });
  await progress({ itemId: aluminumRail.id, departmentId: machining.id, value: 100, completedQuantity: 8, userId: users.machining.id });

  const po7 = await createPo({
    number: "PO-2026-007",
    clientId: majuJaya.id,
    dueInDays: -1,
    notes: "Finance pending item.",
  });
  const mountingBase = await createItem({
    poId: po7.id,
    name: "Mounting Base",
    quantity: 6,
    departments: [fabrikasi.id],
    status: ItemStatus.DONE,
    invoiceStatus: InvoiceStatus.PENDING,
    stageDates: {
      productionStartedAt: daysAgo(6),
      qcStartedAt: daysAgo(4),
      deliveryStartedAt: daysAgo(3),
      doneAt: daysAgo(2),
      deliveredAt: daysAgo(2),
      qcPassedAt: daysAgo(3),
    },
  });
  await progress({ itemId: mountingBase.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 6, userId: users.fabrikasi.id });

  const po8 = await createPo({
    number: "PO-2026-008",
    clientId: sumberTeknik.id,
    dueInDays: -5,
    notes: "Finance invoiced and paid samples.",
  });
  const guardPlate = await createItem({
    poId: po8.id,
    name: "Guard Plate",
    quantity: 2,
    departments: [fabrikasi.id],
    status: ItemStatus.DONE,
    invoiceStatus: InvoiceStatus.INVOICED,
    stageDates: { productionStartedAt: daysAgo(9), qcStartedAt: daysAgo(7), deliveryStartedAt: daysAgo(6), doneAt: daysAgo(5), deliveredAt: daysAgo(5), qcPassedAt: daysAgo(6) },
  });
  const spacerRing = await createItem({
    poId: po8.id,
    name: "Spacer Ring",
    quantity: 12,
    departments: [machining.id],
    status: ItemStatus.DONE,
    invoiceStatus: InvoiceStatus.PAID,
    stageDates: { productionStartedAt: daysAgo(10), qcStartedAt: daysAgo(8), deliveryStartedAt: daysAgo(7), doneAt: daysAgo(6), deliveredAt: daysAgo(6), qcPassedAt: daysAgo(7) },
  });
  await progress({ itemId: guardPlate.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 2, userId: users.fabrikasi.id });
  await progress({ itemId: spacerRing.id, departmentId: machining.id, value: 100, completedQuantity: 12, userId: users.machining.id });

  const po9 = await createPo({
    number: "PO-2026-009",
    clientId: lampungMetalworks.id,
    dueInDays: 4,
    notes: "Major QC defect with rework child.",
  });
  const pulleyParent = await createItem({
    poId: po9.id,
    name: "Pulley Bracket",
    quantity: 8,
    departments: [machining.id, fabrikasi.id],
    status: ItemStatus.DELIVERY,
    stageDates: { productionStartedAt: daysAgo(8), qcStartedAt: daysAgo(5), deliveryStartedAt: daysAgo(4), qcPassedAt: daysAgo(4) },
  });
  const pulleyChild = await createItem({
    poId: po9.id,
    name: "Pulley Bracket Rework",
    quantity: 2,
    departments: [machining.id, fabrikasi.id],
    status: ItemStatus.PRODUCTION,
    source: ItemSource.REWORK,
    parentItemId: pulleyParent.id,
    isRework: true,
    reworkType: ReworkType.MAJOR,
    reworkReason: ReworkReason.DIMENSIONS_OUT_OF_SPEC,
    reworkReasonNote: "Lubang baut perlu dibuat ulang.",
    stageDates: { productionStartedAt: daysAgo(2) },
  });
  await progress({ itemId: pulleyParent.id, departmentId: machining.id, value: 100, completedQuantity: 8, userId: users.machining.id });
  await progress({ itemId: pulleyParent.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 8, userId: users.fabrikasi.id });
  await progress({ itemId: pulleyChild.id, departmentId: machining.id, value: 33, completedQuantity: 1, userId: users.machining.id });
  await progress({ itemId: pulleyChild.id, departmentId: fabrikasi.id, value: 0, completedQuantity: 0 });

  const po10 = await createPo({
    number: "PO-2026-010",
    clientId: majuJaya.id,
    dueInDays: 9,
    notes: "Client return lineage sample.",
  });
  const doorFrameParent = await createItem({
    poId: po10.id,
    name: "Door Frame",
    quantity: 1,
    departments: [fabrikasi.id],
    status: ItemStatus.DONE,
    invoiceStatus: InvoiceStatus.PAID,
    stageDates: { productionStartedAt: daysAgo(12), qcStartedAt: daysAgo(10), deliveryStartedAt: daysAgo(9), doneAt: daysAgo(8), deliveredAt: daysAgo(8), qcPassedAt: daysAgo(9) },
  });
  const doorFrameReturn = await createItem({
    poId: po10.id,
    name: "Door Frame Return",
    quantity: 1,
    departments: [fabrikasi.id],
    status: ItemStatus.PRODUCTION,
    source: ItemSource.RETURN,
    parentItemId: doorFrameParent.id,
    isReturn: true,
    stageDates: { productionStartedAt: daysAgo(1) },
  });
  await progress({ itemId: doorFrameParent.id, departmentId: fabrikasi.id, value: 100, completedQuantity: 1, userId: users.fabrikasi.id });
  await progress({ itemId: doorFrameReturn.id, departmentId: fabrikasi.id, value: 50, completedQuantity: 1, userId: users.fabrikasi.id });

  const problems = await Promise.all([
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: frameSupport.id,
        category: ProblemCategory.MATERIAL_NOT_ARRIVED,
        note: "Material utama belum tiba dari vendor.",
        reportedByUserId: users.purchasing.id,
        reporterType: ActorType.USER,
      },
    }),
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: shaftHousing.id,
        category: ProblemCategory.MACHINE_TOOL_FAILURE,
        note: "Mesin bubut menunggu perbaikan.",
        reportedByUserId: users.machining.id,
        reporterType: ActorType.USER,
      },
    }),
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: minorRecheck.id,
        category: ProblemCategory.DRAWING_SPEC_UNCLEAR,
        note: "Catatan finishing kurang jelas.",
        reportedByUserId: users.qc.id,
        reporterType: ActorType.USER,
      },
    }),
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: bracketPlate.id,
        category: ProblemCategory.OTHER,
        note: "Operator meminta verifikasi ukuran lubang.",
        reportedByUserId: users.machining.id,
        reporterType: ActorType.USER,
      },
    }),
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: machineCover.id,
        category: ProblemCategory.MATERIAL_MISMATCH,
        note: "Material awal tidak sesuai, sudah diganti.",
        reportedByUserId: users.fabrikasi.id,
        reporterType: ActorType.USER,
        isResolved: true,
        resolvedByUserId: users.manager.id,
        resolutionNote: "Material pengganti diterima.",
        resolvedAt: daysAgo(1),
      },
    }),
    prisma.problem.create({
      data: {
        workspaceId: workspace.id,
        itemId: machineCover.id,
        category: ProblemCategory.PRODUCTION_BEFORE_PURCHASING_COMPLETE,
        note: "Produksi mulai sebelum purchasing 100%.",
        reporterType: ActorType.SYSTEM,
      },
    }),
  ]);

  await Promise.all([
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "OPERATOR_MACHINING",
        type: "PO_CREATED",
        title: "PO baru dibuat",
        body: "PO-2026-001 siap diproses Machining.",
        poId: po1.id,
      },
    }),
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "QC",
        type: "ITEM_STAGE_ADVANCED",
        title: "Item masuk QC",
        body: "Welded Stand siap inspeksi QC.",
        poId: po5.id,
        itemId: weldedStand.id,
      },
    }),
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "MANAGER",
        type: "PROBLEM_REPORTED",
        title: "Masalah dilaporkan",
        body: "Material utama belum tiba dari vendor.",
        poId: po2.id,
        itemId: frameSupport.id,
        problemId: problems[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "ADMIN",
        type: "ITEM_MARKED_REWORK",
        title: "Item rework",
        body: "Pulley Bracket Rework dibuat dari hasil QC.",
        poId: po9.id,
        itemId: pulleyChild.id,
      },
    }),
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "FINANCE",
        type: "ITEM_DONE",
        title: "Item selesai",
        body: "Mounting Base masuk daftar Pending Finance.",
        poId: po7.id,
        itemId: mountingBase.id,
      },
    }),
    prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        targetRoleKey: "OWNER",
        type: "FINANCE_PAID",
        title: "Item lunas",
        body: "Spacer Ring ditandai lunas.",
        poId: po8.id,
        itemId: spacerRing.id,
        readAt: daysAgo(1),
      },
    }),
  ]);

  async function audit(params: {
    actorUserId?: string;
    actorType?: typeof ActorType[keyof typeof ActorType];
    action: typeof AuditAction[keyof typeof AuditAction];
    entityType: string;
    entityId: string;
    fromValue?: Prisma.InputJsonValue;
    toValue?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.auditLog.create({
      data: {
        workspaceId: workspace.id,
        actorUserId: params.actorUserId,
        actorType: params.actorType ?? ActorType.USER,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        fromValue: params.fromValue as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined,
        toValue: params.toValue as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined,
        metadata: params.metadata as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined,
      },
    });
  }

  await Promise.all([
    audit({
      actorUserId: users.machining.id,
      action: AuditAction.PROGRESS_UPDATE,
      entityType: "ItemProgress",
      entityId: bracketPlate.id,
      fromValue: { progressValue: 0 },
      toValue: { progressValue: 50 },
      metadata: { department: "Machining" },
    }),
    audit({
      actorUserId: users.fabrikasi.id,
      action: AuditAction.STAGE_ADVANCE,
      entityType: "Item",
      entityId: weldedStand.id,
      fromValue: { status: "PRODUCTION" },
      toValue: { status: "QC" },
    }),
    audit({
      actorUserId: users.qc.id,
      action: AuditAction.QC_PASS,
      entityType: "Item",
      entityId: aluminumRail.id,
      toValue: { status: "DELIVERY" },
    }),
    audit({
      actorUserId: users.qc.id,
      action: AuditAction.QC_MINOR_FAIL,
      entityType: "Item",
      entityId: minorRecheck.id,
      metadata: { reworkType: "MINOR" },
    }),
    audit({
      actorUserId: users.qc.id,
      action: AuditAction.QC_MAJOR_FAIL,
      entityType: "Item",
      entityId: pulleyParent.id,
      metadata: { failingQuantity: 2 },
    }),
    audit({
      actorUserId: users.qc.id,
      action: AuditAction.REWORK_SPAWNED,
      entityType: "Item",
      entityId: pulleyChild.id,
      metadata: { parentItemId: pulleyParent.id },
    }),
    audit({
      actorUserId: users.delivery.id,
      action: AuditAction.RETURN_SPAWNED,
      entityType: "Item",
      entityId: doorFrameReturn.id,
      metadata: { parentItemId: doorFrameParent.id },
    }),
    audit({
      actorUserId: users.finance.id,
      action: AuditAction.INVOICE_UPDATE,
      entityType: "Item",
      entityId: spacerRing.id,
      fromValue: { invoiceStatus: "INVOICED" },
      toValue: { invoiceStatus: "PAID" },
    }),
    audit({
      actorUserId: users.manager.id,
      action: AuditAction.PROBLEM_RESOLVED,
      entityType: "Problem",
      entityId: problems[4].id,
      toValue: { isResolved: true },
    }),
    audit({
      actorUserId: users.admin.id,
      action: AuditAction.PIN_RESET,
      entityType: "User",
      entityId: users.delivery.id,
      metadata: { targetRoleKey: "DELIVERY" },
    }),
    audit({
      actorUserId: users.admin.id,
      action: AuditAction.USER_CREATED,
      entityType: "User",
      entityId: users.admin.id,
      metadata: { seed: true },
    }),
  ]);

  console.info("POgrid seed data created.");
  console.info("Development staff PIN: 2468");
  console.info("Development superadmin PIN: 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
