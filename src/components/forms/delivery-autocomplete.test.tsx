import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DeliveryAutocompleteOption } from '@/src/lib/nova-poshta-types';

import { DeliveryAutocomplete } from './delivery-autocomplete';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
}));

vi.stubGlobal('fetch', mocks.fetch);

const cityOptions: DeliveryAutocompleteOption[] = [
  { ref: 'kyiv-ref', value: 'Київ', label: 'Київ, Київська обл.' },
  { ref: 'brovary-ref', value: 'Бровари', label: 'Бровари, Київська обл.' },
];

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function renderAutocomplete({
  minQueryLength = 2,
  onValueChange = vi.fn(),
  onSelect = vi.fn(),
}: {
  minQueryLength?: number;
  onValueChange?: (value: string) => void;
  onSelect?: (option: DeliveryAutocompleteOption) => void;
} = {}) {
  function Harness() {
    const [value, setValue] = React.useState('');

    return (
      <DeliveryAutocomplete
        id="city"
        label="Місто *"
        value={value}
        placeholder="Місто"
        minQueryLength={minQueryLength}
        buildRequestUrl={(query) =>
          `/api/delivery/nova-poshta/cities?q=${encodeURIComponent(query)}`
        }
        onValueChange={(nextValue) => {
          setValue(nextValue);
          onValueChange(nextValue);
        }}
        onSelect={onSelect}
      />
    );
  }

  render(<Harness />);
  return screen.getByRole('combobox', { name: 'Місто *' });
}

async function advanceDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(300);
    await Promise.resolve();
  });
}

describe('DeliveryAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.fetch.mockResolvedValue(jsonResponse({ options: [] }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits 300ms before requesting options', async () => {
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Ки' } });
    vi.advanceTimersByTime(299);
    expect(mocks.fetch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(mocks.fetch).toHaveBeenCalledOnce();
  });

  it('does not request before minQueryLength is reached', async () => {
    const input = renderAutocomplete({ minQueryLength: 3 });

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();

    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('renders returned options and selects one with Enter', async () => {
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    mocks.fetch.mockResolvedValue(jsonResponse({ options: cityOptions }));
    const input = renderAutocomplete({ onValueChange, onSelect });

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();

    expect(screen.getByText('Київ, Київська обл.')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenLastCalledWith('Київ');
    expect(onSelect).toHaveBeenCalledWith(cityOptions[0]);
    expect(input).toHaveValue('Київ');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('reopens cached options from the dropdown button after selection', async () => {
    mocks.fetch.mockResolvedValue(jsonResponse({ options: cityOptions }));
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Київ, Київська обл.' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Відкрити список: Місто *' }),
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Бровари, Київська обл.')).toBeInTheDocument();
    expect(mocks.fetch).toHaveBeenCalledOnce();
  });

  it('reopens cached options when the input is clicked', async () => {
    mocks.fetch.mockResolvedValue(jsonResponse({ options: cityOptions }));
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('supports ArrowDown, ArrowUp, and Escape', async () => {
    mocks.fetch.mockResolvedValue(jsonResponse({ options: cityOptions }));
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'city-option-0');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'city-option-1');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-activedescendant', 'city-option-0');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input).toHaveValue('Ки');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('ignores an older response after the query changes', async () => {
    const older = deferredResponse();
    const newer = deferredResponse();
    mocks.fetch
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Ки' } });
    await advanceDebounce();
    fireEvent.change(input, { target: { value: 'Київ' } });
    await advanceDebounce();

    await act(async () => {
      newer.resolve(jsonResponse({ options: [cityOptions[0]] }));
      await Promise.resolve();
    });
    expect(screen.getByText('Київ, Київська обл.')).toBeInTheDocument();

    await act(async () => {
      older.resolve(
        jsonResponse({
          options: [
            { ref: 'old-ref', value: 'Кілія', label: 'Кілія, Одеська обл.' },
          ],
        }),
      );
      await Promise.resolve();
    });

    expect(screen.queryByText('Кілія, Одеська обл.')).not.toBeInTheDocument();
    expect(screen.getByText('Київ, Київська обл.')).toBeInTheDocument();
  });

  it('shows a non-blocking manual-entry message on API failure', async () => {
    mocks.fetch.mockResolvedValue(
      jsonResponse(
        {
          error:
            'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.',
        },
        { status: 502 },
      ),
    );
    const input = renderAutocomplete();

    fireEvent.change(input, { target: { value: 'Київ' } });
    await advanceDebounce();

    expect(
      screen.getByText(
        'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.',
      ),
    ).toBeInTheDocument();
    expect(input).toHaveValue('Київ');
  });

  it('continues to accept text after API failure', async () => {
    mocks.fetch.mockRejectedValue(new TypeError('network failed'));
    const onValueChange = vi.fn();
    const input = renderAutocomplete({ onValueChange });

    fireEvent.change(input, { target: { value: 'Київ' } });
    await advanceDebounce();
    fireEvent.change(input, { target: { value: 'Київ вручну' } });

    expect(input).toHaveValue('Київ вручну');
    expect(onValueChange).toHaveBeenLastCalledWith('Київ вручну');
  });
});
