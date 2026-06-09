export type NovaPoshtaCityOption = {
  ref: string;
  value: string;
  name: string;
  area: string | null;
  region: string | null;
  label: string;
};

export type NovaPoshtaWarehouseOption = {
  ref: string;
  value: string;
  number: string;
  description: string;
  type: 'BRANCH' | 'PARCEL_LOCKER';
  label: string;
};

export type DeliveryAutocompleteOption = {
  ref: string;
  value: string;
  label: string;
};
