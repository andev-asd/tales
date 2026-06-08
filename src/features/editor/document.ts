import type { EditorDocument, EditorElement, EditorPage, ImageElement, TextElement } from './types'

type IdFactory = () => string

const createDefaultIdFactory = (): IdFactory => {
  let counter = 0

  return () => {
    counter += 1
    return `editor-${counter}`
  }
}

const nextId = (idFactory: IdFactory): string => idFactory()

const createPage = (idFactory: IdFactory, overrides: Partial<EditorPage> = {}): EditorPage => ({
  id: overrides.id ?? nextId(idFactory),
  name: overrides.name ?? 'Page 1',
  width: overrides.width ?? 1200,
  height: overrides.height ?? 800,
  elements: overrides.elements ?? [],
})

export const createDocument = (idFactory: IdFactory = createDefaultIdFactory()): EditorDocument => {
  const id = nextId(idFactory)
  const firstPage = createPage(idFactory)

  return {
    id,
    pages: [firstPage],
    activePageId: firstPage.id,
  }
}

export const addPage = (
  document: EditorDocument,
  idFactory: IdFactory = createDefaultIdFactory(),
  overrides: Partial<EditorPage> = {},
): EditorDocument => {
  const page = createPage(idFactory, overrides)

  return {
    ...document,
    pages: [...document.pages, page],
    activePageId: page.id,
  }
}

const addElement = <T extends EditorElement>(
  document: EditorDocument,
  pageId: string,
  element: T,
): EditorDocument => ({
  ...document,
  pages: document.pages.map((page) =>
    page.id === pageId ? { ...page, elements: [...page.elements, element] } : page,
  ),
})

export const addTextElement = (
  document: EditorDocument,
  pageId: string,
  idFactory: IdFactory = createDefaultIdFactory(),
  overrides: Partial<TextElement> = {},
): EditorDocument => {
  const targetPage = document.pages.find((page) => page.id === pageId)

  if (!targetPage) {
    return document
  }

  return addElement(document, pageId, {
    id: overrides.id ?? nextId(idFactory),
    type: 'text',
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? 200,
    height: overrides.height ?? 40,
    text: overrides.text ?? '',
  })
}

export const addImageElement = (
  document: EditorDocument,
  pageId: string,
  idFactory: IdFactory = createDefaultIdFactory(),
  overrides: Partial<ImageElement> = {},
): EditorDocument => {
  const targetPage = document.pages.find((page) => page.id === pageId)

  if (!targetPage) {
    return document
  }

  return addElement(document, pageId, {
    id: overrides.id ?? nextId(idFactory),
    type: 'image',
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? 320,
    height: overrides.height ?? 180,
    src: overrides.src ?? '',
    alt: overrides.alt ?? '',
  })
}

export const updateElementBounds = (
  document: EditorDocument,
  pageId: string,
  elementId: string,
  bounds: Pick<EditorElement, 'x' | 'y' | 'width' | 'height'>,
): EditorDocument => ({
  ...document,
  pages: document.pages.map((page) => {
    if (page.id !== pageId) {
      return page
    }

    return {
      ...page,
      elements: page.elements.map((element) =>
        element.id === elementId ? { ...element, ...bounds } : element,
      ),
    }
  }),
})

export const createDocumentFromImages = (
  imageUrls: string[],
  idFactory: IdFactory = createDefaultIdFactory(),
): EditorDocument => {
  if (imageUrls.length === 0) {
    return createDocument(idFactory)
  }

  const documentId = nextId(idFactory)

  const pages: EditorPage[] = imageUrls.map((url, index) => {
    const pageId = nextId(idFactory)
    const elementId = nextId(idFactory)

    return {
      id: pageId,
      name: `Page ${index + 1}`,
      width: 1200,
      height: 800,
      elements: [
        {
          id: elementId,
          type: 'image' as const,
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          src: url,
          alt: '',
        },
      ],
    }
  })

  return {
    id: documentId,
    pages,
    activePageId: pages[0].id,
  }
}

export const updateTextElement = (
  document: EditorDocument,
  pageId: string,
  elementId: string,
  text: string,
): EditorDocument => ({
  ...document,
  pages: document.pages.map((page) =>
    page.id !== pageId
      ? page
      : {
          ...page,
          elements: page.elements.map((element) =>
            element.id !== elementId || element.type !== 'text'
              ? element
              : { ...element, text },
          ),
        },
  ),
})
