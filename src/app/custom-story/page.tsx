import { CustomStoryBriefForm } from '@/src/components/forms/custom-story-brief-form';

export default function CustomStoryPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8">
      <div className="space-y-6">
        <h1 className="font-display text-5xl text-app-text">
          Індивідуальна казка з психологом
        </h1>
        <p className="text-lg leading-8 text-app-secondary">
          Формат для ситуацій, де потрібно глибше опрацювання, персональний
          сюжет і бережний супровід психолога.
        </p>
      </div>
      <CustomStoryBriefForm />
    </section>
  );
}
