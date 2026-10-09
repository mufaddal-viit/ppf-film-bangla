import type { Metadata } from 'next';
import Link from 'next/link';
import { createProduct } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { ProductFields } from '@/components/admin/product-fields';
import { EmptyState, PageHead, Panel, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES, MAX_WARRANTY_YEARS } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';
import { productRepository } from '@/lib/db/repositories/product.repository';

export const metadata: Metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  await requireSession('owner');
  const products = await productRepository.list();
  const active = products.filter((product) => product.active).length;

  return (
    <>
      <PageHead
        title="Products"
        intro={`${active} on sale${products.length > active ? `, ${products.length - active} retired` : ''}. These are the films vendors install and warranties are issued for.`}
      />

      <div className="c-admin-columns" data-layout="detail">
        {products.length === 0 ? (
          <EmptyState>No products yet. Add the first film on the right.</EmptyState>
        ) : (
          <div className="c-admin-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Finish</th>
                  <th>Warranty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link href={`${ADMIN_ROUTES.products}/${product.id}`}>{product.name}</Link>
                      {product.description && <small>{product.description}</small>}
                    </td>
                    <td>{product.finish}</td>
                    <td>
                      {product.warrantyYears} {product.warrantyYears === 1 ? 'year' : 'years'}
                    </td>
                    <td>
                      <Pill tone={product.active ? 'success' : 'muted'}>{product.active ? 'On sale' : 'Retired'}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Panel title="Add a product">
          <AdminForm action={createProduct} submitLabel="Add product" resetOnSuccess>
            <ProductFields maxWarrantyYears={MAX_WARRANTY_YEARS} />
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
