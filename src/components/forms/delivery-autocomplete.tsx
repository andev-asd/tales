'use client';

import React from 'react';

import { Input } from '@/src/components/ui/input';
import type { DeliveryAutocompleteOption } from '@/src/lib/nova-poshta-types';

const DEBOUNCE_MS = 300;
const FALLBACK_ERROR =
  'Сервіс доставки тимчасово недоступний. Введіть дані вручну.';

type DeliveryAutocompleteProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  minQueryLength: number;
  disabled?: boolean;
  buildRequestUrl: (query: string) => string | null;
  onValueChange: (value: string) => void;
  onSelect: (option: DeliveryAutocompleteOption) => void;
};

function isAutocompleteOption(
  value: unknown,
): value is DeliveryAutocompleteOption {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const option = value as Record<string, unknown>;
  return (
    typeof option.ref === 'string' &&
    typeof option.value === 'string' &&
    typeof option.label === 'string'
  );
}

function parseOptions(value: unknown): DeliveryAutocompleteOption[] | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const options = (value as Record<string, unknown>).options;
  if (!Array.isArray(options) || !options.every(isAutocompleteOption)) {
    return null;
  }

  return options;
}

function parseError(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const error = (value as Record<string, unknown>).error;
  return typeof error === 'string' && error.length > 0 ? error : null;
}

export function DeliveryAutocomplete({
  id,
  label,
  value,
  placeholder,
  minQueryLength,
  disabled = false,
  buildRequestUrl,
  onValueChange,
  onSelect,
}: DeliveryAutocompleteProps) {
  const [options, setOptions] = React.useState<DeliveryAutocompleteOption[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);
  const query = value.trim();
  const requestUrl =
    !disabled && query.length >= minQueryLength
      ? buildRequestUrl(query)
      : null;

  React.useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (disabled || query.length < minQueryLength) {
      setOptions([]);
      setOpen(false);
      setActiveIndex(-1);
      setLoading(false);
      setError(null);
      return;
    }

    if (!requestUrl) {
      setOptions([]);
      setOpen(false);
      setActiveIndex(-1);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(requestUrl, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok) {
          throw new Error(parseError(payload) ?? FALLBACK_ERROR);
        }

        const nextOptions = parseOptions(payload);
        if (!nextOptions) {
          throw new Error(FALLBACK_ERROR);
        }

        setOptions(nextOptions);
        setOpen(nextOptions.length > 0);
        setActiveIndex(-1);
      } catch (requestError) {
        if (
          requestId !== requestIdRef.current ||
          (requestError instanceof Error && requestError.name === 'AbortError')
        ) {
          return;
        }

        setOptions([]);
        setOpen(false);
        setActiveIndex(-1);
        setError(
          requestError instanceof Error
            ? requestError.message
            : FALLBACK_ERROR,
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [disabled, minQueryLength, query, requestUrl]);

  function selectOption(option: DeliveryAutocompleteOption) {
    onValueChange(option.value);
    onSelect(option);
    setOptions([]);
    setOpen(false);
    setActiveIndex(-1);
    setError(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open || options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        current >= options.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? options.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        selectOption(option);
      }
    }
  }

  return (
    <div className="relative space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-app-text"
      >
        {label}
      </label>
      <Input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(event) => {
          setOptions([]);
          setOpen(false);
          setActiveIndex(-1);
          setError(null);
          onValueChange(event.target.value);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--radius-md)] border border-app-border bg-app-elevated p-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              key={option.ref}
            >
              <button
                type="button"
                className={`w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-app-text ${
                  index === activeIndex ? 'bg-app-surface' : ''
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-app-muted">
        {loading ? 'Завантаження…' : error}
      </p>
    </div>
  );
}
