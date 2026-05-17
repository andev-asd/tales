export default function FaqPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
      <h1 className="font-display text-5xl text-app-text">Питання та підхід</h1>
      <div className="mt-10 space-y-8 text-app-secondary">
        <article>
          <h2 className="text-2xl font-semibold text-app-text">
            Коли обирати готову казку?
          </h2>
          <p className="mt-2">
            Коли потрібна швидка підтримка в типовій ситуації: страх, сон,
            тривожність, адаптація.
          </p>
        </article>
        <article>
          <h2 className="text-2xl font-semibold text-app-text">
            Коли потрібна індивідуальна казка?
          </h2>
          <p className="mt-2">
            Коли історія має врахувати конкретний досвід дитини, родинний
            контекст і роботу разом із психологом.
          </p>
        </article>
      </div>
    </section>
  );
}
