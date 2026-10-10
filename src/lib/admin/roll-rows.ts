import type { RollRow } from '@/components/admin/roll-table';
import { ADMIN_ROUTES } from './constants';
import { rollRemaining } from './format';

type RollLike = Omit<RollRow, 'product' | 'vendor' | 'allocatedOn'> & {
  productId: string;
  vendorId: string;
  createdAt: Date;
};

type Named = { id: string };

/**
 * Rolls joined to their product and shop names for RollTable. Pass `vendors` only in the admin
 * panel: the vendor column links to the admin vendor page.
 */
export function toRollRows(
  rolls: RollLike[],
  names: {
    products: Array<Named & { name: string }>;
    vendors?: Array<Named & { shopName: string }>;
    date: (value: Date) => string;
  },
): RollRow[] {
  const products = new Map(names.products.map((product) => [product.id, product.name]));
  const vendors = names.vendors && new Map(names.vendors.map((vendor) => [vendor.id, vendor.shopName]));
  return rolls.map(({ productId, vendorId, createdAt, ...roll }) => ({
    ...roll,
    product: products.get(productId) ?? 'Removed product',
    ...(vendors && {
      vendor: { name: vendors.get(vendorId) ?? 'Removed vendor', href: `${ADMIN_ROUTES.vendors}/${vendorId}` },
    }),
    allocatedOn: names.date(createdAt),
  }));
}

/** Rolls, metres allocated and metres left across a set of rolls. */
export function stockTotals(rolls: Array<{ lengthM: number; usedM: number }>) {
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    rolls: rolls.length,
    allocatedM: round(rolls.reduce((sum, roll) => sum + roll.lengthM, 0)),
    leftM: round(rolls.reduce((sum, roll) => sum + rollRemaining(roll), 0)),
  };
}
