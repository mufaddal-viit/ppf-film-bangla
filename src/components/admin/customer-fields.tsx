import { Field } from './ui';

type CustomerFieldsProps = {
  customer?: { name: string; phone: string; email?: string; tags: string[]; marketingOptIn: boolean };
};

/** Name, contact details, tags and offer consent: shared by the add and edit customer forms. */
export function CustomerFields({ customer }: CustomerFieldsProps) {
  return (
    <>
      <Field label="Name">
        <input className="c-input" name="name" defaultValue={customer?.name} maxLength={100} required />
      </Field>
      <Field label="Phone" hint="Used for calls and WhatsApp. Each phone number can belong to one customer.">
        <input className="c-input" type="tel" name="phone" dir="ltr" defaultValue={customer?.phone} required />
      </Field>
      <Field label="Email (optional)">
        <input className="c-input" type="email" name="email" defaultValue={customer?.email} maxLength={254} />
      </Field>
      <Field label="Tags" hint="Separate with commas, for example: ppf, fleet, vip. Used to group customers.">
        <input className="c-input" name="tags" defaultValue={customer?.tags.join(', ')} maxLength={200} />
      </Field>
      <label className="c-admin-check">
        <input type="checkbox" name="marketingOptIn" defaultChecked={customer?.marketingOptIn ?? false} />
        <span>This customer agreed to receive offers and reminders</span>
      </label>
    </>
  );
}
