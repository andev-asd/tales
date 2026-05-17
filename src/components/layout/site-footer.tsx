import { BookOpen } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[var(--fg-primary)] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="h-5 w-5 text-app-accent" />
          <span className="font-display text-lg font-semibold">Своя Казка</span>
        </div>
        <p className="text-[13px] text-white/50">
          Терапевтичні казки для дітей — з турботою та професійним підходом
        </p>
        <p className="text-xs text-white/30">© 2026 Своя Казка. Усі права захищені.</p>
      </div>
    </footer>
  );
}
