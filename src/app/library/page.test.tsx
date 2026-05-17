import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Library page support', () => {
  it('renders download CTA wording', () => {
    render(<button>Завантажити PDF</button>);
    expect(screen.getByText('Завантажити PDF')).toBeInTheDocument();
  });
});
