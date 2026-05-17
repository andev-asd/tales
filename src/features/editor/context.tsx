'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { addImageElement, addTextElement, createDocument, updateElementBounds } from './document'
import type { EditorDocument } from './types'

type EditorContextValue = {
  document: EditorDocument
  currentPageId: string | null
  selectedElementId: string | null
  setCurrentPageId: (pageId: string | null) => void
  setSelectedElementId: (elementId: string | null) => void
  addTextElementToCurrentPage: () => void
  addImageElementToCurrentPage: () => void
  moveSelectedElementRight: () => void
  resizeSelectedElementLarger: () => void
  updateDocument: (nextDocument: EditorDocument | ((currentDocument: EditorDocument) => EditorDocument)) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

type EditorProviderProps = {
  children: ReactNode
  initialDocument?: EditorDocument
  onChange?: (document: EditorDocument) => void
}

export const EditorProvider = ({ children, initialDocument, onChange }: EditorProviderProps) => {
  const [document, setDocument] = useState<EditorDocument>(() => initialDocument ?? createDocument())
  const [currentPageId, setCurrentPageId] = useState<string | null>(() =>
    initialDocument?.activePageId ?? null,
  )
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument)
      setCurrentPageId(initialDocument.activePageId)
      setSelectedElementId(null)
    }
  }, [initialDocument])

  const updateDocument = useCallback(
    (nextDocument: EditorDocument | ((currentDocument: EditorDocument) => EditorDocument)) => {
      setDocument((currentDocument) => {
        const resolvedDocument =
          typeof nextDocument === 'function' ? nextDocument(currentDocument) : nextDocument

        onChange?.(resolvedDocument)

        if (!resolvedDocument.pages.some((page) => page.id === currentPageId)) {
          setCurrentPageId(resolvedDocument.activePageId)
        }

        if (resolvedDocument.activePageId !== currentPageId) {
          setCurrentPageId(resolvedDocument.activePageId)
        }

        return resolvedDocument
      })
    },
    [currentPageId, onChange],
  )

  const getSelectedElement = useCallback(
    (currentDocument: EditorDocument) => {
      if (!currentPageId || !selectedElementId) {
        return null
      }

      const page = currentDocument.pages.find((item) => item.id === currentPageId)
      return page?.elements.find((element) => element.id === selectedElementId) ?? null
    },
    [currentPageId, selectedElementId],
  )

  const addTextElementToCurrentPage = useCallback(() => {
    if (!currentPageId) {
      return
    }

    updateDocument((currentDocument) => addTextElement(currentDocument, currentPageId))
  }, [currentPageId, updateDocument])

  const addImageElementToCurrentPage = useCallback(() => {
    if (!currentPageId) {
      return
    }

    updateDocument((currentDocument) => addImageElement(currentDocument, currentPageId))
  }, [currentPageId, updateDocument])

  const applyElementBounds = useCallback(
    (transform: (currentElement: NonNullable<ReturnType<typeof getSelectedElement>>) => Parameters<typeof updateElementBounds>[3]) => {
      updateDocument((currentDocument) => {
        const element = getSelectedElement(currentDocument)

        if (!element || !currentPageId || !selectedElementId) {
          return currentDocument
        }

        return updateElementBounds(currentDocument, currentPageId, selectedElementId, transform(element))
      })
    },
    [currentPageId, getSelectedElement, selectedElementId, updateDocument],
  )

  const moveSelectedElementRight = useCallback(() => {
    applyElementBounds((element) => ({
      x: element.x + 10,
      y: element.y,
      width: element.width,
      height: element.height,
    }))
  }, [applyElementBounds])

  const resizeSelectedElementLarger = useCallback(() => {
    applyElementBounds((element) => ({
      x: element.x,
      y: element.y,
      width: element.width + 20,
      height: element.height + 20,
    }))
  }, [applyElementBounds])

  const value = useMemo(
    () => ({
      document,
      currentPageId: currentPageId ?? document.activePageId,
      selectedElementId,
      setCurrentPageId,
      setSelectedElementId,
      addTextElementToCurrentPage,
      addImageElementToCurrentPage,
      moveSelectedElementRight,
      resizeSelectedElementLarger,
      updateDocument,
    }),
    [
      addImageElementToCurrentPage,
      addTextElementToCurrentPage,
      currentPageId,
      document,
      moveSelectedElementRight,
      resizeSelectedElementLarger,
      selectedElementId,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export const useEditorContext = () => {
  const context = useContext(EditorContext)

  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }

  return context
}
