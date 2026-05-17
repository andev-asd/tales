import { Editor } from '@/src/features/editor/Editor';
import { createDocument } from '@/src/features/editor/document';

export const dynamic = 'force-dynamic';

export default function EditorPage() {
  const initialDocument = createDocument();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="space-y-4">
        <h1 className="font-display text-4xl text-app-text">Canvas Editor</h1>
        <p className="text-app-secondary">
          Тестова сторінка для ручної перевірки незалежного editor module.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-app-border bg-app-surface shadow-soft">
        <Editor initialDocument={initialDocument} className="min-h-[720px]" />
      </div>
    </section>
  );
}
