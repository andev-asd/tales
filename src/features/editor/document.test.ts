import { describe, expect, it } from 'vitest'

import { addImageElement, addPage, addTextElement, createDocument, createDocumentFromImages, updateElementBounds } from './document'

describe('editor document helpers', () => {
  it('creates a document with one active page', () => {
    const document = createDocument(() => 'id-1')

    expect(document).toEqual({
      id: 'id-1',
      pages: [
        {
          id: 'id-1',
          name: 'Page 1',
          width: 1200,
          height: 800,
          elements: [],
        },
      ],
      activePageId: 'id-1',
    })
  })

  it('adds a page and makes it active', () => {
    const document = createDocument(() => 'id-1')
    const nextDocument = addPage(document, () => 'id-3', { name: 'Page 2', width: 800, height: 600 })

    expect(nextDocument.pages).toHaveLength(2)
    expect(nextDocument.activePageId).toBe('id-3')
    expect(nextDocument.pages[1]).toEqual({
      id: 'id-3',
      name: 'Page 2',
      width: 800,
      height: 600,
      elements: [],
    })
  })

  it('adds text and image elements to a page', () => {
    const document = createDocument(() => 'id-1')
    const withText = addTextElement(document, 'id-1', () => 'id-4', {
      text: 'Hello',
      x: 10,
      y: 20,
      width: 240,
      height: 48,
    })
    const withImage = addImageElement(withText, 'id-1', () => 'id-5', {
      src: '/image.png',
      alt: 'Example image',
      x: 30,
      y: 40,
      width: 320,
      height: 180,
    })

    expect(withImage.pages[0].elements).toEqual([
      {
        id: 'id-4',
        type: 'text',
        x: 10,
        y: 20,
        width: 240,
        height: 48,
        text: 'Hello',
      },
      {
        id: 'id-5',
        type: 'image',
        x: 30,
        y: 40,
        width: 320,
        height: 180,
        src: '/image.png',
        alt: 'Example image',
      },
    ])
  })

  it('updates element bounds without changing other fields', () => {
    const document = createDocument(() => 'id-1')
    const withText = addTextElement(document, 'id-1', () => 'id-4', { text: 'Hello' })
    const updated = updateElementBounds(withText, 'id-1', 'id-4', { x: 50, y: 60, width: 300, height: 90 })

    expect(updated.pages[0].elements[0]).toEqual({
      id: 'id-4',
      type: 'text',
      x: 50,
      y: 60,
      width: 300,
      height: 90,
      text: 'Hello',
    })
  })

  it('createDocumentFromImages with empty array returns a blank document', () => {
    const doc = createDocumentFromImages([], () => 'id-1')

    expect(doc.pages).toHaveLength(1)
    expect(doc.pages[0].elements).toHaveLength(0)
  })

  it('createDocumentFromImages creates one page per image with full-size ImageElement', () => {
    let counter = 0
    const idFactory = () => `id-${++counter}`

    const doc = createDocumentFromImages(['https://example.com/a.jpg', 'https://example.com/b.jpg'], idFactory)

    expect(doc.pages).toHaveLength(2)
    expect(doc.activePageId).toBe(doc.pages[0].id)

    expect(doc.pages[0].elements).toEqual([
      {
        id: expect.any(String),
        type: 'image',
        x: 0,
        y: 0,
        width: 1200,
        height: 800,
        src: 'https://example.com/a.jpg',
        alt: '',
      },
    ])

    expect(doc.pages[1].elements).toEqual([
      {
        id: expect.any(String),
        type: 'image',
        x: 0,
        y: 0,
        width: 1200,
        height: 800,
        src: 'https://example.com/b.jpg',
        alt: '',
      },
    ])
  })
})
