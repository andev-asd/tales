import { HeartHandshake, Lock, ShieldCheck } from 'lucide-react';

const features = [
  { Icon: ShieldCheck, color: '#7a9071', label: 'Створено психологинями' },
  { Icon: Lock, color: '#2f4058', label: 'Безпечне завантаження' },
  { Icon: HeartHandshake, color: '#b86549', label: 'Індивідуальний підхід' },
];

export function TrustSection() {
  return (
    <section className="bg-app-elevated px-[120px] py-[72px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display text-[32px] font-semibold text-app-text">
            Спокійна експертна підтримка
          </h2>
          <p className="max-w-[720px] text-[17px] leading-[1.7] text-app-secondary">
            Ми поєднуємо тепло казкової подачі, сучасну структуру сервісу та можливість співпраці з психологинею — щоб кожна дитина отримала саме ту історію, яка їй потрібна.
          </p>
        </div>

        <div className="flex justify-center gap-10">
          {features.map(({ Icon, color, label }) => (
            <div key={label} className="flex w-[200px] flex-col items-center gap-3">
              <Icon className="h-7 w-7" style={{ color }} />
              <span className="text-[14px] font-medium text-app-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
