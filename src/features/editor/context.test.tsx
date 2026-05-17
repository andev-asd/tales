import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { addPage, createDocument } from './document'
import { EditorProvider, useEditorContext } from './context'

const ContextProbe = () => {
  const { currentPageId, document, selectedElementId, setCurrentPageId, setSelectedElementId, updateDocument } =
    useEditorContext()

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setSelectedElementId('element-1')
          setCurrentPageId(document.pages[0].id)
          updateDocument((currentDocument) => addPage(currentDocument, () => 'page-2', { name: 'Page 2' }))
        }}
      >
        update
      </button>
      <div data-testid="current-page">{currentPageId}</div>
      <div data-testid="selected-element">{selectedElementId ?? ''}</div>
      <div data-testid="page-count">{document.pages.length}</div>
    </div>
  )
}

describe('EditorProvider', () => {
  it('provides editor state and helper actions', () => {
    const onChange = vi.fn()
    const initialDocument = createDocument(() => 'page-1')

    render(
      <EditorProvider initialDocument={initialDocument} onChange={onChange}>
        <ContextProbe />
      </EditorProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: 'update' }).click()
    })

    expect(screen.getByTestId('current-page')).toHaveTextContent('page-2')
    expect(screen.getByTestId('selected-element')).toHaveTextContent('element-1')
    expect(screen.getByTestId('page-count')).toHaveTextContent('2')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        activePageId: 'page-2',
        pages: expect.arrayContaining([
          expect.objectContaining({ id: 'page-1' }),
          expect.objectContaining({ id: 'page-2', name: 'Page 2' }),
        ]),
      }),
    )
  })
})
