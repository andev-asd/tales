const steps = [
  'Оберіть готову казку або індивідуальний формат.',
  'Авторизуйтеся, щоб зберегти книгу в колекцію чи оформити замовлення.',
  'Отримайте доступ до PDF та супроводу у своєму просторі.',
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h2 className="font-display text-4xl text-app-text md:text-5xl">Як це працює</h2>
      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 text-app-secondary shadow-soft"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-app-accent">
              Крок {index + 1}
            </span>
            <p className="mt-3 leading-7">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
