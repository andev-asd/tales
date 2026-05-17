import { HeartHandshake, Lock, ShieldCheck } from 'lucide-react';

const features = [
  { icon: ShieldCheck, label: 'Створено психологинями', className: 'text-app-accentSecondary' },
  { icon: Lock, label: 'Безпечне завантаження', className: 'text-app-premium' },
  { icon: HeartHandshake, label: 'Індивідуальний підхід', className: 'text-app-accent' },
] as const;

export function TrustSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-[72px] text-center md:px-8 lg:px-[120px]">
        <div className="space-y-4">
          <h2 className="font-display text-[32px] font-semibold text-app-text">
            Спокійна експертна підтримка
          </h2>
          <p className="mx-auto max-w-[720px] text-[17px] leading-[1.7] text-app-secondary">
            Ми поєднуємо тепло казкової подачі, сучасну структуру сервісу та можливість
            співпраці з психологинею — щоб кожна дитина отримала саме ту історію, яка їй потрібна.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-10 lg:flex-row">
          {features.map(({ icon: Icon, label, className }) => (
            <div key={label} className="flex w-[200px] flex-col items-center gap-3 text-center">
              <Icon className={['h-7 w-7', className].join(' ')} />
              <p className="text-sm font-medium text-app-text">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
