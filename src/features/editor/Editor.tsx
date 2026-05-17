import { useMemo } from 'react'

import { addPage, createDocument } from './document'
import { EditorProvider, useEditorContext } from './context'
import type { EditorDocument } from './types'
import { PageCanvas } from './components/PageCanvas'
import { PageList } from './PageList'
import { Toolbar } from './Toolbar'

type EditorProps = {
  initialDocument?: EditorDocument
  onChange?: (document: EditorDocument) => void
  readOnly?: boolean
  className?: string
}

const EditorShell = ({ readOnly, className }: Pick<EditorProps, 'readOnly' | 'className'>) => {
  const {
    currentPageId,
    document,
    addImageElementToCurrentPage,
    addTextElementToCurrentPage,
    moveSelectedElementRight,
    resizeSelectedElementLarger,
    setCurrentPageId,
    updateDocument,
  } = useEditorContext()

  const currentPage = useMemo(
    () => document.pages.find((page) => page.id === currentPageId) ?? document.pages[0],
    [currentPageId, document.pages],
  )

  const handleAddPage = () => {
    updateDocument((currentDocument) =>
      addPage(currentDocument, undefined, { name: `Page ${currentDocument.pages.length + 1}` }),
    )
  }

  return (
    <div data-testid="editor-shell" className={className}>
      <Toolbar readOnly={readOnly} onAddPage={handleAddPage} />
      <div className="flex min-h-0 flex-1">
        <PageList
          pages={document.pages}
          currentPageId={currentPage?.id ?? null}
          readOnly={readOnly}
          onSelectPage={setCurrentPageId}
        />
        <main className="flex-1 p-4">
          <div data-testid="editor-page-id">{currentPage?.id ?? ''}</div>
          <div data-testid="editor-page-count">{document.pages.length}</div>
          <h1 className="text-lg font-semibold text-slate-900">{currentPage?.name ?? 'No page'}</h1>
          {currentPage ? <PageCanvas page={currentPage} readOnly={readOnly} /> : null}
          {!readOnly ? (
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={addTextElementToCurrentPage}>
                Add text
              </button>
              <button type="button" onClick={addImageElementToCurrentPage}>
                Add image
              </button>
              <button type="button" onClick={moveSelectedElementRight}>
                Move element right
              </button>
              <button type="button" onClick={resizeSelectedElementLarger}>
                Resize element larger
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export const Editor = ({ initialDocument, onChange, readOnly, className }: EditorProps) => {
  const document = initialDocument ?? createDocument()

  return (
    <EditorProvider initialDocument={document} onChange={onChange}>
      <EditorShell readOnly={readOnly} className={className} />
    </EditorProvider>
  )
}
