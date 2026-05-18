import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { initialTaleFormState } from '@/src/lib/tale-form-state';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');

  return {
    ...actual,
    useActionState: vi.fn((action) => [initialTaleFormState, action]),
  };
});

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

  it('renders field and global validation errors from action state', () => {
    const errorState = {
      status: 'error' as const,
      message: 'Перевірте обов’язкові поля форми.',
      fieldErrors: {
        title: ['Назва обов’язкова'],
        slug: ['Slug обов’язковий'],
      },
    };

    vi.mocked(React.useActionState).mockReturnValueOnce([errorState, vi.fn(), false]);

    render(<TaleForm categories={[]} />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorState.message);
    expect(screen.getByText('Назва обов’язкова')).toBeInTheDocument();
    expect(screen.getByText('Slug обов’язковий')).toBeInTheDocument();
  });

  it('renders delete action button for edit mode', () => {
    render(<TaleForm categories={[]} deleteAction={async () => {}} />);

    expect(screen.getByRole('button', { name: 'Видалити казку' })).toBeInTheDocument();
  });
});
