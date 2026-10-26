'use client';

import { useEffect } from 'react';

type VehicleOption = { id: string; label: string };

/**
 * Synchronises the vehicle <select> with the chosen customer.
 * Renders nothing visible — just sets up the event listener.
 */
export function VehicleSelectSync({ vehiclesByCustomer }: { vehiclesByCustomer: Record<string, VehicleOption[]> }) {
  useEffect(() => {
    const customerSelect = document.getElementById('install-customer') as HTMLSelectElement | null;
    const vehicleSelect = document.getElementById('install-vehicle') as HTMLSelectElement | null;
    if (!customerSelect || !vehicleSelect) return;

    function sync() {
      if (!vehicleSelect) return;
      const customerId = customerSelect!.value;
      const vehicles = vehiclesByCustomer[customerId] ?? [];
      vehicleSelect.innerHTML = '';
      if (vehicles.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.disabled = true;
        opt.selected = true;
        opt.textContent = customerId ? 'No vehicles on this customer' : 'Choose a customer first';
        vehicleSelect.appendChild(opt);
      } else {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = 'Choose a vehicle';
        vehicleSelect.appendChild(placeholder);
        for (const v of vehicles) {
          const opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = v.label;
          vehicleSelect.appendChild(opt);
        }
      }
    }

    customerSelect.addEventListener('change', sync);
    return () => customerSelect.removeEventListener('change', sync);
  }, [vehiclesByCustomer]);

  return null;
}
