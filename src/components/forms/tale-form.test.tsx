import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TaleForm } from './tale-form';

describe('TaleForm', () => {
  it('auto-generates slug from Ukrainian title until slug is edited manually', async () => {
    const user = userEvent.setup();

    render(<TaleForm categories={[]} />);

    const titleInput = screen.getByPlaceholderText('Назва казки');
    const slugInput = screen.getByPlaceholderText('Slug') as HTMLInputElement;

    await user.type(titleInput, 'Казка про їжачка');
    expect(slugInput.value).toBe('kazka-pro-yizhachka');

    await user.clear(slugInput);
    await user.type(slugInput, 'manual-slug');
    await user.type(titleInput, ' нова');

    expect(slugInput.value).toBe('manual-slug');
  });
});
