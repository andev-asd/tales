import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from 'react'
import type { TextElement as TextElementType } from '../types'

type TextElementProps = {
  element: TextElementType
  selected?: boolean
  readOnly?: boolean
  onSelect?: () => void
  onTextChange?: (elementId: string, text: string) => void
}

export const TextElement = ({ element, selected, readOnly, onSelect, onTextChange }: TextElementProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(element.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setEditText(element.text)
    }
  }, [element.text, isEditing])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    onTextChange?.(element.id, editText)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onSelect?.()
  }

  const handleDoubleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!readOnly) {
      setIsEditing(true)
      onSelect?.()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSave()
    }
    if (event.key === 'Escape') {
      setIsEditing(false)
      setEditText(element.text)
    }
  }

  const positionStyle = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className="absolute resize-none border border-blue-500 bg-transparent p-1 text-inherit outline-none"
        style={positionStyle}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <button
      type="button"
      data-testid={`text-element-${element.id}`}
      aria-pressed={selected}
      className={selected ? 'absolute cursor-text border border-blue-500' : 'absolute cursor-pointer'}
      style={{
        ...positionStyle,
        whiteSpace: 'pre-wrap',
      }}
      onClick={readOnly ? undefined : handleClick}
      onDoubleClick={readOnly ? undefined : handleDoubleClick}
      disabled={readOnly}
    >
      {element.text || (selected ? (
        <span className="text-sm text-slate-400">Двічі клацніть, щоб ввести текст</span>
      ) : null)}
    </button>
  )
}
