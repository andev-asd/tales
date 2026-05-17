import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader auth state', () => {
  it('shows user identity instead of login button when a session user exists', () => {
    render(
      <SiteHeader
        user={{
          name: 'Andrew',
          image: null,
        }}
      />,
    );

    expect(screen.getByText('Andrew')).toBeInTheDocument();
    expect(screen.queryByText('Увійти')).not.toBeInTheDocument();
  });
});
