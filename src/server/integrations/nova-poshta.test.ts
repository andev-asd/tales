import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getEnv: vi.fn(() => ({
    NOVA_POSHTA_API_KEY: 'nova-poshta-test-key',
  })),
  timeout: vi.fn(() => AbortSignal.abort()),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/src/lib/env', () => ({
  getEnv: mocks.getEnv,
}));

vi.stubGlobal('fetch', mocks.fetch);
vi.spyOn(AbortSignal, 'timeout').mockImplementation(mocks.timeout);

import {
  NovaPoshtaUnavailableError,
  searchNovaPoshtaCities,
  searchNovaPoshtaWarehouses,
} from './nova-poshta';

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('Nova Poshta server client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes settlement search results and sends the expected request', async () => {
    mocks.fetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: [
          {
            Addresses: [
              {
                DeliveryCity: 'city-ref',
                MainDescription: 'Бровари',
                Area: 'Київська',
                Region: 'Броварський',
              },
              {
                DeliveryCity: 'city-without-region',
                MainDescription: 'Київ',
                Area: '',
              },
            ],
          },
        ],
      }),
    );

    await expect(searchNovaPoshtaCities('Бро')).resolves.toEqual([
      {
        ref: 'city-ref',
        value: 'Бровари',
        name: 'Бровари',
        area: 'Київська',
        region: 'Броварський',
        label: 'Бровари, Київська обл., Броварський р-н',
      },
      {
        ref: 'city-without-region',
        value: 'Київ',
        name: 'Київ',
        area: null,
        region: null,
        label: 'Київ',
      },
    ]);

    expect(mocks.fetch).toHaveBeenCalledOnce();
    expect(mocks.fetch).toHaveBeenCalledWith(
      'https://api.novaposhta.ua/v2.0/json/',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          apiKey: 'nova-poshta-test-key',
          modelName: 'Address',
          calledMethod: 'searchSettlements',
          methodProperties: {
            CityName: 'Бро',
            Limit: '20',
            Page: '1',
          },
        }),
        signal: expect.any(AbortSignal),
        cache: 'no-store',
      },
    );
    expect(mocks.timeout).toHaveBeenCalledWith(5_000);
  });

  it('returns branches and parcel lockers together with the expected request', async () => {
    mocks.fetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: [
          {
            Ref: 'branch-ref',
            Number: '47',
            Description: 'Відділення №47: вул. Хрещатик, 1',
            CategoryOfWarehouse: 'Branch',
          },
          {
            Ref: 'locker-ref',
            Number: '30001',
            Description: 'Поштомат №30001: вул. Хрещатик, 2',
            CategoryOfWarehouse: 'POSTOMAT',
          },
          {
            Ref: 'locker-by-description-ref',
            Number: '30002',
            Description: 'Мобільний поштомат №30002',
            CategoryOfWarehouse: 'Branch',
          },
        ],
      }),
    );

    await expect(
      searchNovaPoshtaWarehouses('delivery-city-ref', 'Хрещатик'),
    ).resolves.toEqual([
      {
        ref: 'branch-ref',
        value: '[Відділення] Відділення №47: вул. Хрещатик, 1',
        number: '47',
        description: 'Відділення №47: вул. Хрещатик, 1',
        type: 'BRANCH',
        label: '[Відділення] Відділення №47: вул. Хрещатик, 1',
      },
      {
        ref: 'locker-ref',
        value: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
        number: '30001',
        description: 'Поштомат №30001: вул. Хрещатик, 2',
        type: 'PARCEL_LOCKER',
        label: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
      },
      {
        ref: 'locker-by-description-ref',
        value: '[Поштомат] Мобільний поштомат №30002',
        number: '30002',
        description: 'Мобільний поштомат №30002',
        type: 'PARCEL_LOCKER',
        label: '[Поштомат] Мобільний поштомат №30002',
      },
    ]);

    expect(mocks.fetch).toHaveBeenCalledWith(
      'https://api.novaposhta.ua/v2.0/json/',
      expect.objectContaining({
        body: JSON.stringify({
          apiKey: 'nova-poshta-test-key',
          modelName: 'AddressGeneral',
          calledMethod: 'getWarehouses',
          methodProperties: {
            CityRef: 'delivery-city-ref',
            FindByString: 'Хрещатик',
            Limit: '500',
            Page: '1',
            Language: 'UA',
          },
        }),
      }),
    );

    const requestBody = JSON.parse(mocks.fetch.mock.calls[0]?.[1]?.body as string);
    expect(requestBody.methodProperties).not.toHaveProperty('SettlementRef');
  });

  it('returns all branches and parcel lockers from the provider response', async () => {
    const branches = Array.from({ length: 20 }, (_, index) => ({
      Ref: `branch-${index}`,
      Number: String(index + 1),
      Description: `Відділення №${index + 1}`,
      CategoryOfWarehouse: 'Branch',
    }));
    const parcelLockers = Array.from({ length: 20 }, (_, index) => ({
      Ref: `locker-${index}`,
      Number: String(3000 + index),
      Description: `Поштомат №${3000 + index}`,
      CategoryOfWarehouse: 'Postomat',
    }));

    mocks.fetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: [...branches, ...parcelLockers],
      }),
    );

    const result = await searchNovaPoshtaWarehouses('city-ref', '');

    expect(result).toHaveLength(40);
    expect(result.filter((option) => option.type === 'BRANCH')).toHaveLength(20);
    expect(
      result.filter((option) => option.type === 'PARCEL_LOCKER'),
    ).toHaveLength(20);
  });

  it('loads subsequent warehouse pages until the provider response is exhausted', async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => ({
      Ref: `warehouse-${index}`,
      Number: String(index + 1),
      Description: `Відділення №${index + 1}`,
      CategoryOfWarehouse: 'Branch',
    }));

    mocks.fetch
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: firstPage,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: [
            {
              Ref: 'locker-last',
              Number: '9999',
              Description: 'Поштомат №9999',
              CategoryOfWarehouse: 'Postomat',
            },
          ],
        }),
      );

    const result = await searchNovaPoshtaWarehouses('city-ref', '');

    expect(result).toHaveLength(501);
    expect(result.at(-1)).toEqual(
      expect.objectContaining({
        ref: 'locker-last',
        type: 'PARCEL_LOCKER',
      }),
    );
    expect(mocks.fetch).toHaveBeenCalledTimes(2);

    const secondRequestBody = JSON.parse(
      mocks.fetch.mock.calls[1]?.[1]?.body as string,
    );
    expect(secondRequestBody.methodProperties.Page).toBe('2');
  });

  it('filters malformed options and limits provider results to 20', async () => {
    const validCities = Array.from({ length: 22 }, (_, index) => ({
      DeliveryCity: `city-${index}`,
      MainDescription: `Місто ${index}`,
    }));

    mocks.fetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: [
          {
            Addresses: [
              { DeliveryCity: '', MainDescription: 'Без ref' },
              { DeliveryCity: 'without-name' },
              ...validCities,
            ],
          },
        ],
      }),
    );

    const result = await searchNovaPoshtaCities('Мі');

    expect(result).toHaveLength(20);
    expect(result[0]?.ref).toBe('city-0');
    expect(result[19]?.ref).toBe('city-19');
  });

  it('maps unsuccessful and malformed provider responses to an unavailable error', async () => {
    mocks.fetch
      .mockResolvedValueOnce(
        jsonResponse({
          success: false,
          data: [],
          errors: ['provider detail'],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: null }));

    await expect(searchNovaPoshtaCities('Ки')).rejects.toEqual(
      new NovaPoshtaUnavailableError(),
    );
    await expect(searchNovaPoshtaCities('Ки')).rejects.toEqual(
      new NovaPoshtaUnavailableError(),
    );
  });

  it.each([
    ['HTTP errors', () => Promise.resolve(jsonResponse({}, { status: 503 }))],
    ['invalid JSON', () => Promise.resolve(new Response('not-json'))],
    ['network errors', () => Promise.reject(new TypeError('network failed'))],
    ['timeout-style errors', () => Promise.reject(new DOMException('timed out', 'TimeoutError'))],
  ])('maps %s to an unavailable error without exposing provider details', async (_name, response) => {
    mocks.fetch.mockImplementationOnce(response);

    await expect(searchNovaPoshtaCities('Ки')).rejects.toEqual(
      new NovaPoshtaUnavailableError(),
    );
  });
});
