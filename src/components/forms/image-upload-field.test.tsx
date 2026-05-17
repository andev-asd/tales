import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageUploadField } from './image-upload-field';

describe('ImageUploadField', () => {
  it('renders current preview from default path', () => {
    render(
      <ImageUploadField
        name="coverPath"
        defaultPath="https://example.com/image.png"
        defaultPreviewUrl="https://example.com/image.png"
      />,
    );
    expect(screen.getByAltText('Поточна обкладинка')).toBeInTheDocument();
  });

  it('shows delete button for existing asset', () => {
    render(<ImageUploadField name="coverPath" defaultPath="https://example.com/image.png" />);
    expect(screen.getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
  });
});
