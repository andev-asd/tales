import type { MouseEvent } from 'react'
import type { ImageElement as ImageElementType } from '../types'

type ImageElementProps = {
  element: ImageElementType
  selected?: boolean
  readOnly?: boolean
  onSelect?: () => void
}

export const ImageElement = ({ element, selected, readOnly, onSelect }: ImageElementProps) => {
  return (
    <button
      type="button"
      data-testid={`image-element-${element.id}`}
      aria-pressed={selected}
      className={selected ? 'absolute border border-blue-500' : 'absolute'}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
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
      <img src={element.src} alt={element.alt} className="h-full w-full object-cover" />
    </button>
  )
}
