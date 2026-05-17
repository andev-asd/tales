import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('calls provided handlers when auth buttons are clicked', async () => {
    const user = userEvent.setup();
    const onGoogleSignIn = vi.fn();
    const onEmailSignIn = vi.fn();

    render(
      <LoginForm
        onGoogleSignIn={onGoogleSignIn}
        onEmailSignIn={onEmailSignIn}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Продовжити з Google' }),
    );
    await user.click(screen.getByRole('button', { name: 'Увійти з email' }));

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
    expect(onEmailSignIn).toHaveBeenCalledTimes(1);
  });

  it('renders Google sign-in as a clickable button without plain form fallback', async () => {
    render(<LoginForm />);

    const googleButton = screen.getByRole('button', {
      name: 'Продовжити з Google',
    });

    expect(googleButton.closest('form')).toBeNull();
  });
});
