import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateProduct } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { ProductFields } from '@/components/admin/product-fields';
import { PageHead, Panel } from '@/components/admin/ui';
import { ADMIN_ROUTES, MAX_WARRANTY_YEARS } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';
import { productRepository } from '@/lib/db/repositories/product.repository';

export const metadata: Metadata = { title: 'Edit product' };

export default async function AdminProductPage({ params }: PageProps<'/admin/products/[id]'>) {
  await requireSession('owner');
  const product = await productRepository.findById((await params).id);
  if (!product) notFound();

  return (
    <>
      <Link href={ADMIN_ROUTES.products} className="c-admin-back">
        All products
      </Link>
      <PageHead title={product.name} intro={`${product.finish} · ${product.warrantyYears}-year warranty`} />
      <Panel className="c-admin-narrow">
        <AdminForm action={updateProduct} submitLabel="Save">
          <input type="hidden" name="id" value={product.id} />
          <ProductFields product={product} maxWarrantyYears={MAX_WARRANTY_YEARS} />
          <label className="c-admin-check">
            <input type="checkbox" name="active" defaultChecked={product.active} />
            <span>On sale (untick to retire it without losing its history)</span>
          </label>
        </AdminForm>
      </Panel>
    </>
  );
}
