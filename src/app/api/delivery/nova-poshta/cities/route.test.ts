import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  searchNovaPoshtaCities: vi.fn(),
}));

vi.mock('@/src/server/integrations/nova-poshta', () => ({
  NovaPoshtaUnavailableError: class NovaPoshtaUnavailableError extends Error {},
  searchNovaPoshtaCities: mocks.searchNovaPoshtaCities,
}));

import { GET } from './route';

function request(query: string) {
  return new Request(
    `http://localhost/api/delivery/nova-poshta/cities?q=${encodeURIComponent(query)}`,
  );
}

describe('Nova Poshta city route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty list without calling Nova Poshta for fewer than 2 characters', async () => {
    const response = await GET(request(' К '));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ options: [] });
    expect(mocks.searchNovaPoshtaCities).not.toHaveBeenCalled();
  });

  it('returns 400 for a query longer than 100 characters', async () => {
    const response = await GET(request('x'.repeat(101)));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Некоректний пошуковий запит',
    });
    expect(mocks.searchNovaPoshtaCities).not.toHaveBeenCalled();
  });

  it('returns normalized options', async () => {
    mocks.searchNovaPoshtaCities.mockResolvedValue([
      {
        ref: 'city-ref',
        value: 'Київ',
        name: 'Київ',
        area: 'Київська',
        region: null,
        label: 'Київ, Київська обл.',
      },
    ]);

    const response = await GET(request(' Київ '));

    expect(response.status).toBe(200);
    expect(mocks.searchNovaPoshtaCities).toHaveBeenCalledWith('Київ');
    expect(await response.json()).toEqual({
      options: [
        expect.objectContaining({
          ref: 'city-ref',
          value: 'Київ',
          label: expect.stringContaining('Київ'),
        }),
      ],
    });
  });

  it('returns a generic 502 response when Nova Poshta fails', async () => {
    mocks.searchNovaPoshtaCities.mockRejectedValue(
      new Error('provider secret detail'),
    );

    const response = await GET(request('Київ'));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error:
        'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.',
    });
    expect(JSON.stringify(body)).not.toContain('provider secret detail');
  });
});
