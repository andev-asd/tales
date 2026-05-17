export type EditorDocument = {
  id: string
  pages: EditorPage[]
  activePageId: string | null
}

export type EditorPage = {
  id: string
  name: string
  width: number
  height: number
  elements: EditorElement[]
}

export type EditorElement = TextElement | ImageElement

export type TextElement = {
  id: string
  type: 'text'
  x: number
  y: number
  width: number
  height: number
  text: string
}

export type ImageElement = {
  id: string
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  src: string
  alt: string
}
