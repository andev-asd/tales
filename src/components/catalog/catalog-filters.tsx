const filters = ['Усі', 'Страхи', 'Втрата', 'Адаптація', 'Сон', 'Тривожність'];

export function CatalogFilters() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {filters.map((filter, i) => (
        <span
          key={filter}
          className={`rounded-full px-[18px] py-2 text-sm font-medium ${
            i === 0
              ? 'bg-app-accent text-white'
              : 'bg-app-text/[0.06] text-app-secondary'
          }`}
        >
          {filter}
        </span>
      ))}
    </div>
  );
}
