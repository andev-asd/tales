type ToolbarProps = {
  readOnly?: boolean
  onAddPage: () => void
}

export const Toolbar = ({ readOnly, onAddPage }: ToolbarProps) => (
  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
    <div>
      <div className="text-sm font-medium text-slate-900">Editor</div>
      <div className="text-xs text-slate-500">Pages and document settings</div>
    </div>
    {!readOnly ? (
      <button
        type="button"
        onClick={onAddPage}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        Add page
      </button>
    ) : null}
  </div>
)
