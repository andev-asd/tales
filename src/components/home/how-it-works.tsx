import { BookOpen, Download, UserCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const steps: Array<{
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
}> = [
  {
    number: '1',
    title: 'Оберіть казку',
    description: 'Готову з каталогу або індивідуальний формат з психологинею',
    icon: BookOpen,
    accentClassName: 'bg-[rgba(184,101,73,0.08)] text-app-accent',
  },
  {
    number: '2',
    title: 'Авторизуйтесь',
    description: 'Щоб зберегти казку у бібліотеку або оформити замовлення',
    icon: UserCheck,
    accentClassName: 'bg-[rgba(122,144,113,0.08)] text-app-accentSecondary',
  },
  {
    number: '3',
    title: 'Отримайте PDF',
    description: 'Завантажте казку у вашому особистому кабінеті в будь-який зручний час',
    icon: Download,
    accentClassName: 'bg-[rgba(47,64,88,0.08)] text-app-premium',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-[72px] text-center md:px-8">
        <div className="space-y-3">
          <h2 className="font-display text-[32px] font-semibold text-app-text">Як це працює</h2>
          <p className="text-base text-app-secondary">Три простих кроки до терапевтичної казки</p>
        </div>

        <ol className="grid w-full gap-8 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li key={step.number} className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full font-display text-xl font-semibold',
                    step.accentClassName,
                  )}
                >
                  {step.number}
                </span>
                <Icon className={cn('h-8 w-8', step.accentClassName.split(' ')[1])} />
                <h3 className="font-display text-xl font-semibold text-app-text">{step.title}</h3>
                <p className="text-sm leading-[1.6] text-app-secondary">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
