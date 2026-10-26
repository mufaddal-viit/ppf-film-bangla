import { ROLL_LIMITS } from '@/lib/admin/constants';
import { Field } from './ui';
import { VehicleSelectSync } from './vehicle-select-sync';

type Option = { id: string; label: string };

type InstallationFieldsProps = {
  customers: Option[];
  /** Rolls at this vendor with metres remaining, labelled with product + LOT + remaining. */
  rolls: (Option & { productName: string })[];
  installers: string[];
  /** Vehicles for all customers, keyed by customerId. */
  vehiclesByCustomer: Record<string, Option[]>;
};

/** Fields for recording a new installation. */
export function InstallationFields({ customers, rolls, installers, vehiclesByCustomer }: InstallationFieldsProps) {
  return (
    <>
      <VehicleSelectSync vehiclesByCustomer={vehiclesByCustomer} />

      <Field label="Customer">
        <select className="c-input" name="customerId" id="install-customer" defaultValue="" required>
          <option value="" disabled>
            Choose a customer
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Vehicle">
        <select className="c-input" name="vehicleId" id="install-vehicle" defaultValue="" required>
          <option value="" disabled>
            Choose a customer first
          </option>
        </select>
      </Field>

      <Field label="Roll">
        <select className="c-input" name="rollId" defaultValue="" required>
          <option value="" disabled>
            Choose a roll
          </option>
          {rolls.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Installer">
        <select className="c-input" name="installer" defaultValue="" required>
          <option value="" disabled>
            Choose an installer
          </option>
          {installers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Area covered" hint="e.g. Full front, hood, fenders, mirrors">
        <input className="c-input" name="area" autoComplete="off" maxLength={200} required />
      </Field>

      <Field label="Metres used" half>
        <input
          className="c-input"
          type="number"
          name="metresUsed"
          min={ROLL_LIMITS.lengthM.min}
          max={ROLL_LIMITS.lengthM.max}
          step={0.01}
          inputMode="decimal"
          required
        />
      </Field>

      <Field label="Installation date" half>
        <input className="c-input" type="date" name="installedAt" defaultValue={today()} required />
      </Field>
    </>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
