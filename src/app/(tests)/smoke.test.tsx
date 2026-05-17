import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from '@/src/components/layout/site-header';

describe('SiteHeader', () => {
  it('renders Ukrainian navigation items', () => {
    render(<SiteHeader user={null} />);
    expect(screen.getByText('Каталог казок')).toBeInTheDocument();
    expect(screen.getByText('Індивідуальна казка')).toBeInTheDocument();
    expect(screen.getByText('Як це працює')).toBeInTheDocument();
  });
});
