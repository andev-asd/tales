import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdfUploadField } from './pdf-upload-field';

describe('PdfUploadField', () => {
  it('renders current file state from default path', () => {
    render(<PdfUploadField name="pdfPath" defaultPath="books/story.pdf" />);
    expect(screen.getByText('Поточний файл: story.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
  });
});
