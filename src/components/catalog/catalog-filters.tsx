const filters = ['Усі', 'Страхи', 'Втрата', 'Адаптація', 'Сон', 'Тривожність'];

export function CatalogFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <span
          key={filter}
          className="rounded-full border border-app-border bg-app-surface px-4 py-2 text-sm text-app-secondary"
        >
          {filter}
        </span>
      ))}
    </div>
  );
}
