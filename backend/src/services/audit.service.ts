import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface AuditEntry {
  tenantId: string;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Writes an immutable audit trail entry.
 * Audit failures are logged but never block the primary operation.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata ?? undefined,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    logger.error({ error, action: entry.action }, 'audit.write_failed');
  }
}