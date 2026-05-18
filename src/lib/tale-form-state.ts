export type TaleFormField = 'title' | 'slug' | 'shortDescription' | 'fullDescription';

export type TaleFormState = {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<TaleFormField, string[]>>;
};

export const initialTaleFormState: TaleFormState = {
  status: 'idle',
};
