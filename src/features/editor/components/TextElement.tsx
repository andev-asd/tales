import type { MouseEvent } from 'react'
import type { TextElement as TextElementType } from '../types'

type TextElementProps = {
  element: TextElementType
  selected?: boolean
  readOnly?: boolean
  onSelect?: () => void
}

export const TextElement = ({ element, selected, readOnly, onSelect }: TextElementProps) => {
  return (
    <button
      type="button"
      data-testid={`text-element-${element.id}`}
      aria-pressed={selected}
      className={selected ? 'absolute border border-blue-500' : 'absolute'}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        whiteSpace: 'pre-wrap',
      }}
      onClick={
        readOnly
          ? undefined
          : (event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation()
              onSelect?.()
            }
      }
      disabled={readOnly}
    >
      {element.text}
    </button>
  )
}
