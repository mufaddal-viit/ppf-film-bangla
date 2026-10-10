import { Field } from './ui';

type Option = { id: string; label: string };

type RollFieldsProps = {
  vendors: Option[];
  products: Option[];
  /** Preselects a shop, for the link from a vendor's page. */
  vendorId?: string;
  limits: { widthCm: { min: number; max: number }; lengthM: { min: number; max: number } };
};

/** Shop, product, LOT number and size of one roll of film being allocated. */
export function RollFields({ vendors, products, vendorId, limits }: RollFieldsProps) {
  return (
    <>
      <Field label="Vendor">
        <select className="c-input" name="vendorId" defaultValue={vendorId ?? ''} required>
          <option value="" disabled>
            Choose a shop
          </option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Product">
        <select className="c-input" name="productId" defaultValue="" required>
          <option value="" disabled>
            Choose a film
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="LOT number" hint="As printed on the roll. It appears on every warranty cut from it.">
        <input className="c-input" name="lotNumber" dir="ltr" autoComplete="off" maxLength={40} required />
      </Field>
      <Field label="Width (cm)">
        <input
          className="c-input"
          type="number"
          name="widthCm"
          min={limits.widthCm.min}
          max={limits.widthCm.max}
          step={0.1}
          inputMode="decimal"
          placeholder="152"
          required
        />
      </Field>
      <Field label="Length (m)">
        <input
          className="c-input"
          type="number"
          name="lengthM"
          min={limits.lengthM.min}
          max={limits.lengthM.max}
          step={0.01}
          inputMode="decimal"
          placeholder="15"
          required
        />
      </Field>
    </>
  );
}
