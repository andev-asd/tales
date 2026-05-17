import {
  Cloud,
  CloudLightning,
  Compass,
  Heart,
  Moon,
  Smile,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const situations: Array<{
  label: string;
  icon: LucideIcon;
  className: string;
}> = [
  {
    label: 'Страхи',
    icon: CloudLightning,
    className: 'bg-[rgba(184,101,73,0.07)] text-app-accent',
  },
  {
    label: 'Втрата',
    icon: Heart,
    className: 'bg-[rgba(122,144,113,0.07)] text-app-accentSecondary',
  },
  {
    label: 'Адаптація',
    icon: Compass,
    className: 'bg-[rgba(47,64,88,0.07)] text-app-premium',
  },
  {
    label: 'Сон',
    icon: Moon,
    className: 'bg-[rgba(123,107,149,0.07)] text-[#7b6b95]',
  },
  {
    label: 'Тривожність',
    icon: Cloud,
    className: 'bg-[rgba(176,128,48,0.07)] text-[#b08030]',
  },
  {
    label: 'Емоції',
    icon: Smile,
    className: 'bg-[rgba(196,87,64,0.07)] text-[#c45740]',
  },
];

export function SituationGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-[60px] text-center md:px-8">
        <div className="space-y-3">
          <h2 className="font-display text-[32px] font-semibold text-app-text">
            Для яких ситуацій підійдуть казки?
          </h2>
          <p className="text-base text-app-secondary">
            Кожна казка створена для конкретної дитячої потреби
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {situations.map(({ label, icon: Icon, className }) => (
            <span
              key={label}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium',
                className,
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
