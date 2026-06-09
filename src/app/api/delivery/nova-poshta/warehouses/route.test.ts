import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  searchNovaPoshtaWarehouses: vi.fn(),
}));

vi.mock('@/src/server/integrations/nova-poshta', () => ({
  NovaPoshtaUnavailableError: class NovaPoshtaUnavailableError extends Error {},
  searchNovaPoshtaWarehouses: mocks.searchNovaPoshtaWarehouses,
}));

import { GET } from './route';

function request(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return new Request(
    `http://localhost/api/delivery/nova-poshta/warehouses?${searchParams}`,
  );
}

describe('Nova Poshta warehouse route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when cityRef is absent', async () => {
    const response = await GET(request({ q: '47' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Некоректні параметри пошуку',
    });
    expect(mocks.searchNovaPoshtaWarehouses).not.toHaveBeenCalled();
  });

  it.each([
    [{ cityRef: 'x'.repeat(101), q: '47' }],
    [{ cityRef: 'city-ref', q: 'x'.repeat(101) }],
  ])('returns 400 when cityRef or q exceeds 100 characters', async (params) => {
    const response = await GET(request(params));

    expect(response.status).toBe(400);
    expect(mocks.searchNovaPoshtaWarehouses).not.toHaveBeenCalled();
  });

  it('passes cityRef and q to the provider client', async () => {
    mocks.searchNovaPoshtaWarehouses.mockResolvedValue([]);

    const response = await GET(
      request({ cityRef: ' city-ref ', q: ' Хрещатик ' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.searchNovaPoshtaWarehouses).toHaveBeenCalledWith(
      'city-ref',
      'Хрещатик',
    );
    await expect(response.json()).resolves.toEqual({ options: [] });
  });

  it('returns branch and parcel-locker options', async () => {
    mocks.searchNovaPoshtaWarehouses.mockResolvedValue([
      {
        ref: 'branch-ref',
        value: '[Відділення] Відділення №47',
        number: '47',
        description: 'Відділення №47',
        type: 'BRANCH',
        label: '[Відділення] Відділення №47',
      },
      {
        ref: 'locker-ref',
        value: '[Поштомат] Поштомат №30001',
        number: '30001',
        description: 'Поштомат №30001',
        type: 'PARCEL_LOCKER',
        label: '[Поштомат] Поштомат №30001',
      },
    ]);

    const response = await GET(request({ cityRef: 'city-ref', q: '' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      options: [
        expect.objectContaining({ ref: 'branch-ref', type: 'BRANCH' }),
        expect.objectContaining({
          ref: 'locker-ref',
          type: 'PARCEL_LOCKER',
        }),
      ],
    });
  });

  it('returns a generic 502 response when Nova Poshta fails', async () => {
    mocks.searchNovaPoshtaWarehouses.mockRejectedValue(
      new Error('provider secret detail'),
    );

    const response = await GET(request({ cityRef: 'city-ref', q: '47' }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error:
        'Сервіс Нової Пошти тимчасово недоступний. Введіть відділення вручну.',
    });
    expect(JSON.stringify(body)).not.toContain('provider secret detail');
  });
});
