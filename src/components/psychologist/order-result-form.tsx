type PsychologistOrderResultFormProps = {
  defaultValues?: {
    resultTitle?: string | null;
    resultBody?: string | null;
  };
};

export function PsychologistOrderResultForm({
  defaultValues,
}: PsychologistOrderResultFormProps) {
  return (
    <form className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
      <input
        name="resultTitle"
        placeholder="Назва результату"
        defaultValue={defaultValues?.resultTitle ?? ''}
        className="rounded-xl border border-app-border bg-white px-3 py-2"
      />
      <textarea
        name="resultBody"
        placeholder="Підсумковий текст казки"
        rows={8}
        defaultValue={defaultValues?.resultBody ?? ''}
        className="rounded-xl border border-app-border bg-white px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
      >
        Зберегти результат
      </button>
    </form>
  );
}
