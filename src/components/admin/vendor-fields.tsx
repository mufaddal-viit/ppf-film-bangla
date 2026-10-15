import { Field } from './ui';

type VendorFieldsProps = {
  vendor?: {
    shopName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    installers: string[];
  };
};

/** Shop details printed on warranty cards: shared by the add and edit vendor forms. */
export function VendorFields({ vendor }: VendorFieldsProps) {
  return (
    <>
      <Field label="Shop name">
        <input
          className="c-input"
          name="shopName"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={vendor?.shopName}
          maxLength={100}
          required
        />
      </Field>
      <Field label="Contact person">
        <input
          className="c-input"
          name="contactName"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={vendor?.contactName}
          maxLength={100}
          required
        />
      </Field>
      <Field label="Shop email">
        <input
          className="c-input"
          type="email"
          name="email"
          autoComplete="off"
          defaultValue={vendor?.email}
          maxLength={254}
          required
        />
      </Field>
      <Field label="Shop phone" hint="With the country code, for example +971 52 365 6678.">
        <input
          className="c-input"
          type="tel"
          name="phone"
          dir="ltr"
          autoComplete="off"
          defaultValue={vendor?.phone}
          required
        />
      </Field>
      <Field label="Address">
        <textarea
          className="c-input"
          name="address"
          autoComplete="off"
          defaultValue={vendor?.address}
          maxLength={300}
          rows={3}
          required
        />
      </Field>
      <Field label="Installers" hint="One name per line. One of them is named on each warranty card.">
        <textarea
          className="c-input"
          name="installers"
          autoCapitalize="words"
          defaultValue={vendor?.installers.join('\n')}
          maxLength={2000}
          rows={4}
        />
      </Field>
    </>
  );
}
