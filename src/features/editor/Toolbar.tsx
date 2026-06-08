import Link from 'next/link'

type ToolbarProps = {
  readOnly?: boolean
  onAddPage: () => void
}

export const Toolbar = ({ readOnly, onAddPage }: ToolbarProps) => (
  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
    <div className="text-sm font-medium text-slate-900">Конструктор казки</div>
    <div className="flex items-center gap-3">
      {!readOnly ? (
        <button
          type="button"
          onClick={onAddPage}
          className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Додати сторінку
        </button>
      ) : null}
      <Link
        href="/custom-story"
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Замовити друк
      </Link>
    </div>
  </div>
)
