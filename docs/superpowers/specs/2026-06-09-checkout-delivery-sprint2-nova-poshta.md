# Checkout Delivery Sprint 2: Nova Poshta Autocomplete

## Goal

Replace free-form Nova Poshta city and branch entry with server-backed autocomplete while preserving manual entry when the carrier API is unavailable.

Sprint 2 covers Nova Poshta only. Ukrposhta is hidden from checkout until a separate integration is designed. Payment remains out of scope for Sprint 3.

## Scope

The checkout flow must support:

- Nova Poshta city autocomplete;
- branch and parcel-locker autocomplete for a selected city;
- storage of Nova Poshta city and warehouse references;
- manual city and branch entry as a fallback;
- existing courier delivery fields;
- graceful degradation when Nova Poshta is unavailable.

The existing `DeliveryService.UKRPOSHTA` database enum remains unchanged so existing data and a future integration remain compatible.

## Architecture

The browser never calls Nova Poshta directly. It calls application-owned API routes:

```text
CheckoutForm
  -> GET /api/delivery/nova-poshta/cities?q={query}
  -> GET /api/delivery/nova-poshta/warehouses?cityRef={ref}&q={query}
        -> Nova Poshta client
        -> https://api.novaposhta.ua/v2.0/json/
```

The server-side Nova Poshta client reads `NOVA_POSHTA_API_KEY` from the environment and normalizes provider responses into small application-owned types. This keeps the key private and isolates the UI from the provider response format.

## Environment

Add the required server-only variable:

```text
NOVA_POSHTA_API_KEY
```

It must be validated by `src/lib/env.ts` and documented in `.env.example`. It must never use a `NEXT_PUBLIC_` prefix.

## Nova Poshta Client

Create a focused server module responsible for:

- calling the Nova Poshta JSON endpoint;
- searching settlements by user-entered text;
- loading warehouses for a selected settlement;
- filtering inactive or malformed records;
- normalizing provider errors;
- applying a request timeout;
- returning no more than 20 options.

Application types:

```ts
type NovaPoshtaCityOption = {
  ref: string
  name: string
  area: string | null
  region: string | null
  label: string
}

type NovaPoshtaWarehouseOption = {
  ref: string
  number: string
  description: string
  type: 'BRANCH' | 'PARCEL_LOCKER'
  label: string
}
```

City labels must disambiguate settlements with the same name by including available area or region information.

Warehouse labels must contain the warehouse number, provider description/address, and a visible type marker for a branch or parcel locker.

## API Routes

### City search

```text
GET /api/delivery/nova-poshta/cities?q=Ки
```

Rules:

- trim the query;
- require at least 2 characters;
- reject queries longer than 100 characters;
- return at most 20 normalized options;
- return `{ options: [] }` for a query shorter than 2 characters;
- return status `502` with a stable application error when Nova Poshta fails.

### Warehouse search

```text
GET /api/delivery/nova-poshta/warehouses?cityRef={ref}&q={optionalQuery}
```

Rules:

- `cityRef` is required and limited to 100 characters;
- `q` is optional and limited to 100 characters;
- include ordinary branches and parcel lockers;
- return at most 20 normalized options;
- return status `400` for invalid input;
- return status `502` with a stable application error when Nova Poshta fails.

The routes must not return provider error bodies or the API key.

## Data Model

Extend `Delivery` with nullable references:

```prisma
model Delivery {
  // existing fields
  cityRef   String?
  branchRef String?
}
```

The readable `city` and `branchNumber` values remain required for branch delivery. References are supplemental provider identifiers and may be null when the user uses manual fallback.

For courier delivery:

- `cityRef` may be stored when the city was selected from autocomplete;
- `branchRef` must be null.

## Validation

Extend `DeliveryInput` with:

```ts
cityRef?: string
branchRef?: string
```

Both fields are optional, trimmed strings with a maximum length of 100 characters.

Existing delivery validation remains authoritative:

- city is required;
- branch text is required for `BRANCH`;
- street and house are required for `COURIER`;
- refs are never required;
- service remains `NOVA_POSHTA` in the active checkout UI.

The server action stores refs only after successful schema validation.

## Checkout UI

### Carrier

The service selector is removed while Nova Poshta is the only available carrier. The form displays a static Nova Poshta label and always submits:

```ts
service: 'NOVA_POSHTA'
```

Ukrposhta is not displayed as disabled or "coming soon".

### City autocomplete

- Start searching after 2 entered characters.
- Debounce requests to avoid sending a request for every keystroke.
- Cancel or ignore stale requests when the query changes.
- Show loading, empty, success, and unavailable states.
- Selecting an option sets `city` to its readable name and `cityRef` to its provider reference.
- Editing the city text after selection clears `cityRef` and clears the selected branch and `branchRef`.
- The user can leave manually entered city text and continue checkout.

### Warehouse autocomplete

- Render only for `BRANCH` delivery.
- Do not request warehouses until a city option with `cityRef` has been selected.
- Load both branches and parcel lockers.
- Allow optional filtering within the loaded warehouse list.
- Selecting an option sets `branchNumber` to its readable label and `branchRef` to its provider reference.
- Editing branch text after selection clears `branchRef`.
- If no city ref exists, present the existing manual branch input.
- API failure changes the control into manual-entry mode without erasing user input.

### Courier delivery

Courier delivery keeps the current street, house, and apartment inputs. City autocomplete remains available. Warehouse autocomplete is not rendered and `branchRef` is cleared when switching to courier.

### Accessibility

Autocomplete controls must:

- keep an associated visible label;
- expose loading and error messages through an appropriate live region;
- support keyboard selection with Arrow Up, Arrow Down, Enter, and Escape;
- preserve ordinary text input behavior;
- not trap focus.

## State Transitions

The form must enforce these transitions:

1. Selecting a city stores `cityRef`.
2. Editing the selected city clears `cityRef`, branch text, and `branchRef`.
3. Selecting a warehouse stores `branchRef`.
4. Editing the selected warehouse clears `branchRef`.
5. Switching from `BRANCH` to `COURIER` clears branch text and `branchRef`.
6. Switching back to `BRANCH` starts with an empty branch field.
7. Nova Poshta failure preserves current visible text and enables manual completion.

## Error Handling

- Provider timeouts and network errors become a stable `NovaPoshtaUnavailableError`.
- API routes return a generic Ukrainian message and status `502`.
- The checkout displays a non-blocking message that manual entry is available.
- An autocomplete error must not become the form-level order submission error.
- `createOrderAction` continues accepting valid manual delivery data when refs are absent.

## Testing

### Unit tests

- Nova Poshta response normalization;
- branch versus parcel-locker type mapping;
- provider error and timeout mapping;
- delivery schema accepts optional refs and rejects overlong refs.

### API route tests

- input length and required parameter validation;
- successful normalized results;
- short city query returns an empty list without calling the provider;
- provider failure returns `502` without leaking details.

### Component tests

- Ukrposhta is not rendered;
- city search is debounced;
- selecting a city stores its ref and enables warehouse lookup;
- editing a selected city clears city and branch refs;
- branches and parcel lockers appear together;
- selecting and then editing a warehouse clears its ref;
- switching to courier clears warehouse state;
- API failure allows manual entry;
- valid manual entry still submits an order;
- selected refs are submitted and stored.

### Verification

- focused Vitest suite for delivery, Nova Poshta client/routes, and checkout form;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- manual browser verification of `/checkout?slug={paid-tale-slug}` for desktop and mobile.

## Out of Scope

- Ukrposhta API or autocomplete;
- creating Nova Poshta waybills;
- shipping price calculation;
- shipment tracking;
- saved delivery addresses;
- payment;
- order confirmation email;
- automatic retries beyond the request timeout;
- background synchronization of Nova Poshta reference data.

## Success Criteria

Sprint 2 is complete when an authenticated customer can select a Nova Poshta city and either a branch or parcel locker, submit an order with stored provider refs, and still complete checkout manually when the provider API is unavailable.
