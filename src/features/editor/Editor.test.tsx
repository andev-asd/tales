import { act } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDocument } from './document'
import { Editor } from './Editor'

describe('Editor', () => {
  afterEach(() => {
    cleanup()
  })
  it('loads an initial document and renders the active page', () => {
    const initialDocument = createDocument(() => 'doc-1')
    const onChange = vi.fn()

    render(<Editor initialDocument={initialDocument} onChange={onChange} />)

    expect(screen.getByRole('heading', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByTestId('editor-page-count')).toHaveTextContent('1')
    expect(screen.getByTestId('editor-page-id')).toHaveTextContent('doc-1')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('adds a page and switches to it', () => {
    const onChange = vi.fn()

    render(<Editor onChange={onChange} />)

    act(() => {
      screen.getByRole('button', { name: 'Додати сторінку' }).click()
    })

    expect(screen.getByTestId('editor-page-count')).toHaveTextContent('2')
    expect(screen.getByRole('heading', { name: 'Page 2' })).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        activePageId: expect.any(String),
        pages: expect.arrayContaining([
          expect.objectContaining({ name: 'Page 1' }),
          expect.objectContaining({ name: 'Page 2' }),
        ]),
      }),
    )
  })

  it('renders text and image elements on the active page', () => {
    const initialDocument = createDocument(() => 'id-1')
    initialDocument.pages[0].width = 800
    initialDocument.pages[0].height = 600
    initialDocument.pages[0].elements = [
      {
        id: 'text-1',
        type: 'text',
        x: 40,
        y: 60,
        width: 240,
        height: 80,
        text: 'Hello canvas',
      },
      {
        id: 'image-1',
        type: 'image',
        x: 120,
        y: 180,
        width: 320,
        height: 180,
        src: '/image.png',
        alt: 'Preview image',
      },
    ]

    render(<Editor initialDocument={initialDocument} />)

    expect(screen.getByTestId('page-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('text-element-text-1')).toHaveTextContent('Hello canvas')
    expect(screen.getByTestId('image-element-image-1')).toContainElement(screen.getByAltText('Preview image'))
  })

  it('selects, moves, and resizes the active page element', () => {
    const onChange = vi.fn()
    const initialDocument = createDocument(() => 'doc-1')
    initialDocument.pages[0].width = 800
    initialDocument.pages[0].height = 600
    initialDocument.pages[0].elements = [
      {
        id: 'text-1',
        type: 'text',
        x: 40,
        y: 60,
        width: 240,
        height: 80,
        text: 'Editable text',
      },
    ]

    render(<Editor initialDocument={initialDocument} onChange={onChange} />)

    act(() => {
      screen.getByRole('button', { name: 'Editable text' }).click()
    })

    act(() => {
      screen.getByRole('button', { name: 'Move element right' }).click()
    })

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Editable text' })).toHaveStyle({ left: '50px', top: '60px' })

    act(() => {
      screen.getByRole('button', { name: 'Resize element larger' }).click()
    })

    expect(screen.getByRole('button', { name: 'Editable text' })).toHaveStyle({ width: '260px', height: '100px' })
  })

  it('does not expose editing controls in readOnly mode', () => {
    const initialDocument = createDocument(() => 'doc-1')
    initialDocument.pages[0].elements = [
      {
        id: 'text-1',
        type: 'text',
        x: 20,
        y: 20,
        width: 120,
        height: 40,
        text: 'Locked',
      },
    ]

    render(<Editor initialDocument={initialDocument} readOnly className="editor-shell" />)

    expect(screen.getByTestId('editor-shell')).toHaveClass('editor-shell')
    expect(screen.queryByRole('button', { name: 'Додати сторінку' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Move element right' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Locked' })).not.toHaveAttribute('aria-pressed', 'true')
  })
})
