import type { EditorPage } from './types'

type PageListProps = {
  pages: EditorPage[]
  currentPageId: string | null
  readOnly?: boolean
  onSelectPage: (pageId: string) => void
}

export const PageList = ({ pages, currentPageId, readOnly, onSelectPage }: PageListProps) => (
  <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Сторінки</div>
    <div className="space-y-2">
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          disabled={readOnly}
          onClick={() => onSelectPage(page.id)}
          className={
            page.id === currentPageId
              ? 'w-full rounded-md bg-slate-900 px-3 py-2 text-left text-sm text-white'
              : 'w-full rounded-md bg-white px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200'
          }
        >
          {page.name}
        </button>
      ))}
    </div>
  </aside>
)
