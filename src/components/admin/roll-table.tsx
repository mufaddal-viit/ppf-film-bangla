import Link from 'next/link';
import type { FormAction } from '@/lib/admin/form-state';
import { metres, rollRemaining, rollSize } from '@/lib/admin/format';
import { AdminForm } from './admin-form';
import { Pill } from './ui';

export type RollRow = {
  id: string;
  lotNumber: string;
  product: string;
  /** Left out where every roll belongs to the same shop. */
  vendor?: { name: string; href: string };
  widthCm: number;
  lengthM: number;
  usedM: number;
  allocatedOn: string;
};

type RollTableProps = {
  rolls: RollRow[];
  /** Admin only: shows "Take back" on rolls nothing has been cut from. */
  removeAction?: FormAction;
};

/** Rolls of film with what is left on each: shared by the admin stock pages and the vendor portal. */
export function RollTable({ rolls, removeAction }: RollTableProps) {
  const showVendor = rolls.some((roll) => roll.vendor);

  return (
    <div className="c-admin-table">
      <table>
        <thead>
          <tr>
            <th>LOT number</th>
            <th>Product</th>
            {showVendor && <th>Vendor</th>}
            <th>Roll size</th>
            <th>Left</th>
            <th>Status</th>
            {removeAction && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {rolls.map((roll) => {
            const left = rollRemaining(roll);
            return (
              <tr key={roll.id}>
                <td>
                  <strong dir="ltr">{roll.lotNumber}</strong>
                  <small>Allocated {roll.allocatedOn}</small>
                </td>
                <td>{roll.product}</td>
                {showVendor && <td>{roll.vendor && <Link href={roll.vendor.href}>{roll.vendor.name}</Link>}</td>}
                <td>{rollSize(roll)}</td>
                <td>
                  {metres(left)}
                  <small>of {metres(roll.lengthM)}</small>
                </td>
                <td>
                  {roll.usedM === 0 ? (
                    <Pill tone="primary">Unused</Pill>
                  ) : left === 0 ? (
                    <Pill tone="muted">Used up</Pill>
                  ) : (
                    <Pill tone="success">In use</Pill>
                  )}
                </td>
                {removeAction && (
                  <td>
                    {roll.usedM === 0 && (
                      <AdminForm action={removeAction} submitLabel="Take back" quiet>
                        <input type="hidden" name="id" value={roll.id} />
                      </AdminForm>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
