import { Field } from './ui';

type ProductFieldsProps = {
  product?: { name: string; finish: string; warrantyYears: number; description?: string };
  maxWarrantyYears: number;
};

/** Name, finish, warranty length and description: shared by the add and edit product forms. */
export function ProductFields({ product, maxWarrantyYears }: ProductFieldsProps) {
  return (
    <>
      <Field label="Product name" hint="As it should read on the warranty card.">
        <input className="c-input" name="name" defaultValue={product?.name} maxLength={80} required />
      </Field>
      <Field label="Finish" hint="For example Gloss, Matte or Satin.">
        <input className="c-input" name="finish" defaultValue={product?.finish} maxLength={40} required />
      </Field>
      <Field label="Warranty (years)" hint="Sets the coverage period on every warranty for this product.">
        <input
          className="c-input"
          type="number"
          name="warrantyYears"
          defaultValue={product?.warrantyYears}
          min={1}
          max={maxWarrantyYears}
          step={1}
          inputMode="numeric"
          required
        />
      </Field>
      <Field label="Description (optional)">
        <textarea className="c-input" name="description" defaultValue={product?.description} maxLength={500} rows={3} />
      </Field>
    </>
  );
}
