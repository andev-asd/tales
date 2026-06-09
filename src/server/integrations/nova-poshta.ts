import 'server-only';

import { getEnv } from '@/src/lib/env';
import type {
  NovaPoshtaCityOption,
  NovaPoshtaWarehouseOption,
} from '@/src/lib/nova-poshta-types';

const NOVA_POSHTA_URL = 'https://api.novaposhta.ua/v2.0/json/';
const RESULT_LIMIT = 20;
const WAREHOUSE_PROVIDER_LIMIT = 500;
const WAREHOUSE_TYPE_LIMIT = RESULT_LIMIT / 2;
const REQUEST_TIMEOUT_MS = 5_000;

type NovaPoshtaEnvelope = {
  success?: unknown;
  data?: unknown;
};

type SettlementAddress = {
  DeliveryCity?: unknown;
  MainDescription?: unknown;
  Area?: unknown;
  Region?: unknown;
};

type WarehouseData = {
  Ref?: unknown;
  Number?: unknown;
  Description?: unknown;
  CategoryOfWarehouse?: unknown;
};

type NormalizedCity = {
  ref: string;
  name: string;
  area: string | null;
  region: string | null;
};

type NormalizedWarehouse = {
  ref: string;
  number: string;
  description: string;
  category: string | null;
};

export class NovaPoshtaUnavailableError extends Error {
  constructor() {
    super('Nova Poshta is unavailable');
    this.name = 'NovaPoshtaUnavailableError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

async function callNovaPoshta(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, string>,
): Promise<unknown[]> {
  try {
    const response = await fetch(NOVA_POSHTA_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        apiKey: getEnv().NOVA_POSHTA_API_KEY,
        modelName,
        calledMethod,
        methodProperties,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new NovaPoshtaUnavailableError();
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload)) {
      throw new NovaPoshtaUnavailableError();
    }

    const envelope: NovaPoshtaEnvelope = payload;
    if (envelope.success !== true || !Array.isArray(envelope.data)) {
      throw new NovaPoshtaUnavailableError();
    }

    return envelope.data;
  } catch (error) {
    if (error instanceof NovaPoshtaUnavailableError) {
      throw error;
    }

    throw new NovaPoshtaUnavailableError();
  }
}

function normalizeCity(value: unknown): NormalizedCity | null {
  if (!isRecord(value)) {
    return null;
  }

  const address: SettlementAddress = value;
  const ref = nonEmptyString(address.DeliveryCity);
  const name = nonEmptyString(address.MainDescription);

  if (!ref || !name) {
    return null;
  }

  return {
    ref,
    name,
    area: optionalString(address.Area),
    region: optionalString(address.Region),
  };
}

function cityLabel(city: NormalizedCity): string {
  return [
    city.name,
    city.area ? `${city.area} обл.` : null,
    city.region ? `${city.region} р-н` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ');
}

function normalizeWarehouse(value: unknown): NormalizedWarehouse | null {
  if (!isRecord(value)) {
    return null;
  }

  const warehouse: WarehouseData = value;
  const ref = nonEmptyString(warehouse.Ref);
  const number = nonEmptyString(warehouse.Number);
  const description = nonEmptyString(warehouse.Description);

  if (!ref || !number || !description) {
    return null;
  }

  return {
    ref,
    number,
    description,
    category: optionalString(warehouse.CategoryOfWarehouse),
  };
}

export async function searchNovaPoshtaCities(
  query: string,
): Promise<NovaPoshtaCityOption[]> {
  const data = await callNovaPoshta('Address', 'searchSettlements', {
    CityName: query,
    Limit: String(RESULT_LIMIT),
    Page: '1',
  });

  const firstResult = data[0];
  if (!isRecord(firstResult) || !Array.isArray(firstResult.Addresses)) {
    throw new NovaPoshtaUnavailableError();
  }

  const cities: NovaPoshtaCityOption[] = [];

  for (const value of firstResult.Addresses) {
    const city = normalizeCity(value);
    if (!city) {
      continue;
    }

    cities.push({
      ref: city.ref,
      value: city.name,
      name: city.name,
      area: city.area,
      region: city.region,
      label: cityLabel(city),
    });

    if (cities.length === RESULT_LIMIT) {
      break;
    }
  }

  return cities;
}

export async function searchNovaPoshtaWarehouses(
  cityRef: string,
  query: string,
): Promise<NovaPoshtaWarehouseOption[]> {
  const data = await callNovaPoshta('AddressGeneral', 'getWarehouses', {
    CityRef: cityRef,
    FindByString: query,
    Limit: String(WAREHOUSE_PROVIDER_LIMIT),
    Page: '1',
    Language: 'UA',
  });

  const branches: NovaPoshtaWarehouseOption[] = [];
  const parcelLockers: NovaPoshtaWarehouseOption[] = [];

  for (const value of data) {
    const warehouse = normalizeWarehouse(value);
    if (!warehouse) {
      continue;
    }

    const isParcelLocker =
      warehouse.category?.toLowerCase().includes('postomat') === true ||
      warehouse.description.toLowerCase().includes('поштомат');
    const type = isParcelLocker ? 'PARCEL_LOCKER' : 'BRANCH';
    const typeLabel = isParcelLocker ? 'Поштомат' : 'Відділення';
    const label = `[${typeLabel}] ${warehouse.description}`;

    const option: NovaPoshtaWarehouseOption = {
      ref: warehouse.ref,
      value: label,
      number: warehouse.number,
      description: warehouse.description,
      type,
      label,
    };

    if (isParcelLocker) {
      parcelLockers.push(option);
    } else {
      branches.push(option);
    }
  }

  const selectedBranches = branches.slice(0, WAREHOUSE_TYPE_LIMIT);
  const selectedParcelLockers = parcelLockers.slice(
    0,
    WAREHOUSE_TYPE_LIMIT,
  );
  const selected = [...selectedBranches, ...selectedParcelLockers];

  if (selected.length < RESULT_LIMIT) {
    selected.push(
      ...branches.slice(
        selectedBranches.length,
        selectedBranches.length + RESULT_LIMIT - selected.length,
      ),
    );
  }

  if (selected.length < RESULT_LIMIT) {
    selected.push(
      ...parcelLockers.slice(
        selectedParcelLockers.length,
        selectedParcelLockers.length + RESULT_LIMIT - selected.length,
      ),
    );
  }

  return selected;
}
