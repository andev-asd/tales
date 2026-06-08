import { ImageElement } from './ImageElement'
import { TextElement } from './TextElement'
import { useEditorContext } from '../context'
import type { EditorElement, EditorPage } from '../types'

type PageCanvasProps = {
  page: EditorPage
  readOnly?: boolean
  onTextChange?: (elementId: string, text: string) => void
}

const renderElement = (
  element: EditorElement,
  selectedElementId: string | null,
  readOnly?: boolean,
  onSelect?: (elementId: string) => void,
  onTextChange?: (elementId: string, text: string) => void,
) => {
  const selected = element.id === selectedElementId
  const handleSelect = onSelect ? () => onSelect(element.id) : undefined

  if (element.type === 'text') {
    return (
      <TextElement
        key={element.id}
        element={element}
        selected={selected}
        readOnly={readOnly}
        onSelect={handleSelect}
        onTextChange={onTextChange}
      />
    )
  }

  return (
    <ImageElement
      key={element.id}
      element={element}
      selected={selected}
      readOnly={readOnly}
      onSelect={handleSelect}
    />
  )
}

export const PageCanvas = ({ page, readOnly, onTextChange }: PageCanvasProps) => {
  const { selectedElementId, setSelectedElementId } = useEditorContext()

  return (
    <section
      data-testid="page-canvas"
      className="relative overflow-hidden border border-slate-200 bg-white"
      style={{ width: page.width, height: page.height }}
      onClick={readOnly ? undefined : () => setSelectedElementId(null)}
    >
      {page.elements.map((element) =>
        renderElement(element, selectedElementId, readOnly, setSelectedElementId, onTextChange),
      )}
    </section>
  )
}
