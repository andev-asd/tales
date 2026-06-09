'use client'

import { useEffect, useRef, useState } from 'react'

import { addPage, addTextElement, createDocument } from './document'
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
  slug?: string
}

const EditorShell = ({ readOnly, className, slug }: Pick<EditorProps, 'readOnly' | 'className' | 'slug'>) => {
  const {
    currentPageId,
    document,
    setCurrentPageId,
    setSelectedElementId,
    updateTextElementOnCurrentPage,
    updateDocument,
  } = useEditorContext()

  const mainRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(1)

  const currentPage = document.pages.find((page) => page.id === currentPageId) ?? document.pages[0]

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const measure = () => {
      const availableWidth = el.clientWidth - 32
      setScale(Math.min(1, availableWidth / (currentPage?.width ?? 1200)))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [currentPage?.width])

  const handleAddPage = () => {
    updateDocument((currentDocument) =>
      addPage(currentDocument, undefined, { name: `Сторінка ${currentDocument.pages.length + 1}` }),
    )
  }

  const handleAddCaption = () => {
    if (!currentPageId || !currentPage) return

    const newElementId = `caption-${Date.now()}`

    updateDocument((doc) =>
      addTextElement(doc, currentPageId, () => newElementId, {
        x: Math.round(currentPage.width * 0.25),
        y: Math.round(currentPage.height * 0.75),
        width: Math.round(currentPage.width * 0.5),
        height: 60,
        text: '',
      }),
    )
    setSelectedElementId(newElementId)
  }

  const pageWidth = currentPage?.width ?? 1200
  const pageHeight = currentPage?.height ?? 800

  return (
    <div data-testid="editor-shell" className={className}>
      <Toolbar readOnly={readOnly} slug={slug} onAddPage={handleAddPage} />
      <div className="flex min-h-0 flex-1">
        <PageList
          pages={document.pages}
          currentPageId={currentPage?.id ?? null}
          readOnly={readOnly}
          onSelectPage={setCurrentPageId}
        />
        <main ref={mainRef} className="flex-1 overflow-auto p-4">
          {/* Hidden debug info for tests */}
          <div data-testid="editor-page-id" className="sr-only">{currentPage?.id ?? ''}</div>
          <div data-testid="editor-page-count" className="sr-only">{document.pages.length}</div>

          {currentPage ? (
            <div
              style={{ width: pageWidth * scale, height: pageHeight * scale }}
              className="overflow-hidden"
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <PageCanvas
                  page={currentPage}
                  readOnly={readOnly}
                  onTextChange={updateTextElementOnCurrentPage}
                />
              </div>
            </div>
          ) : null}

          {!readOnly ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddCaption}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                + Додати підпис
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

const createDefaultDocument = (): EditorDocument => {
  const doc = createDocument()
  doc.pages[0] = { ...doc.pages[0], name: 'Сторінка 1' }
  return doc
}

export const Editor = ({ initialDocument, onChange, readOnly, className, slug }: EditorProps) => {
  const document = initialDocument ?? createDefaultDocument()

  return (
    <EditorProvider initialDocument={document} onChange={onChange}>
      <EditorShell readOnly={readOnly} className={className} slug={slug} />
    </EditorProvider>
  )
}
