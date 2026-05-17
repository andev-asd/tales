import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PsychologistOrderResultForm } from '@/src/components/psychologist/order-result-form';

describe('PsychologistOrderResultForm', () => {
  it('renders result fields', () => {
    render(<PsychologistOrderResultForm />);

    expect(screen.getByPlaceholderText('Назва результату')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Підсумковий текст казки'),
    ).toBeInTheDocument();
  });
});
