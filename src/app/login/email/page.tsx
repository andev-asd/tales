export default function EmailLoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16 md:px-8">
      <div className="w-full space-y-6 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
        <h1 className="font-display text-4xl text-app-text">Вхід через email</h1>
        <p className="text-app-secondary">
          Цей сценарій підготовлено як окремий маршрут для подальшого підключення
          форми email/password через Better Auth.
        </p>
      </div>
    </section>
  );
}
