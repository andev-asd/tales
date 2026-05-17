const situations = ['Страхи', 'Втрата', 'Адаптація', 'Сон', 'Тривожність', 'Емоції'];

export function SituationGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="space-y-5">
        <h2 className="font-display text-4xl text-app-text md:text-5xl">
          Підтримка для життєвих ситуацій
        </h2>
        <div className="flex flex-wrap gap-3">
          {situations.map((situation) => (
            <span
              key={situation}
              className="rounded-full border border-app-border bg-app-surface px-4 py-2 text-sm text-app-secondary"
            >
              {situation}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
