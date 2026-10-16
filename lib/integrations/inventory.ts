import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';

export class StockUnavailableError extends Error {
  constructor() {
    super('One or more products no longer have enough stock.');
    this.name = 'StockUnavailableError';
  }
}

export function getAvailabilityStatus(quantity: number) {
  if (quantity <= 0) {
    return 'OUT_OF_STOCK';
  }
  return quantity <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
}

type ReservationItem = {
  productId: string;
  quantity: number;
  trackInventory: boolean;
};

export async function reserveOrderInventory(
  transaction: Prisma.TransactionClient,
  items: ReservationItem[],
) {
  let hasReservation = false;
  const totals = new Map<string, { quantity: number; trackInventory: boolean }>();
  for (const item of items) {
    const current = totals.get(item.productId);
    totals.set(item.productId, {
      quantity: (current?.quantity ?? 0) + item.quantity,
      trackInventory: item.trackInventory,
    });
  }

  for (const [productId, item] of totals) {
    if (!item.trackInventory) {
      continue;
    }
    const updated = await transaction.product.updateMany({
      where: { id: productId, active: true, stockQuantity: { gte: item.quantity } },
      data: { stockQuantity: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new StockUnavailableError();
    }
    const product = await transaction.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });
    if (product) {
      await transaction.product.update({
        where: { id: productId },
        data: { availabilityStatus: getAvailabilityStatus(product.stockQuantity) },
      });
    }
    hasReservation = true;
  }

  return hasReservation;
}

export async function releaseOrderInventoryReservation(
  transaction: Prisma.TransactionClient,
  orderId: string,
  status: string,
  paymentStatus: string,
) {
  const updated = await transaction.order.updateMany({
    where: { id: orderId, inventoryStatus: 'HELD' },
    data: {
      inventoryStatus: 'RELEASED',
      inventoryReservationExpiresAt: null,
      status,
      paymentStatus,
    },
  });
  if (updated.count !== 1) {
    return false;
  }

  const items = await transaction.orderItem.findMany({
    where: { orderId, inventoryReserved: true, productId: { not: null } },
    select: { id: true, productId: true, quantity: true },
  });
  for (const item of items) {
    if (item.productId) {
      await transaction.product.updateMany({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
      const product = await transaction.product.findUnique({
        where: { id: item.productId },
        select: { stockQuantity: true },
      });
      if (product) {
        await transaction.product.update({
          where: { id: item.productId },
          data: { availabilityStatus: getAvailabilityStatus(product.stockQuantity) },
        });
      }
    }
    await transaction.orderItem.update({
      where: { id: item.id },
      data: { inventoryReserved: false },
    });
  }

  return true;
}

export async function releaseExpiredInventoryReservations(now = new Date()) {
  return prisma.$transaction(async (transaction) => {
    const expired = await transaction.order.findMany({
      where: {
        inventoryStatus: 'HELD',
        inventoryReservationExpiresAt: { lte: now },
      },
      select: { id: true },
    });

    let released = 0;
    for (const order of expired) {
      if (await releaseOrderInventoryReservation(transaction, order.id, 'EXPIRED', 'EXPIRED')) {
        released += 1;
      }
    }
    return released;
  });
}
