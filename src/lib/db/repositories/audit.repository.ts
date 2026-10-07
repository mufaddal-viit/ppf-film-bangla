import 'server-only';
import { auditCollection, type AuditDocument } from '../collections';

type AuditEntry = Omit<AuditDocument, '_id'> & { id: string };

type Actor = { userId: string; email: string };

/** Append-only record of who changed what in the admin panel. */
export const auditRepository = {
  async record(actor: Actor, action: string, target?: string, detail?: string): Promise<void> {
    await (
      await auditCollection()
    ).insertOne({
      at: new Date(),
      actorId: actor.userId,
      actorEmail: actor.email,
      action,
      ...(target && { target }),
      ...(detail && { detail }),
    });
  },

  async recent(limit: number): Promise<AuditEntry[]> {
    const docs = await (await auditCollection()).find().sort({ at: -1 }).limit(limit).toArray();
    return docs.map(({ _id, ...entry }) => ({ id: _id.toHexString(), ...entry }));
  },
};
