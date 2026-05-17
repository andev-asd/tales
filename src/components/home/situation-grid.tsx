import { Cloud, CloudLightning, Compass, Heart, Moon, Smile } from 'lucide-react';

const situations = [
  { label: 'Страхи', Icon: CloudLightning, color: '#b86549', bg: '#b8654912' },
  { label: 'Втрата', Icon: Heart, color: '#7a9071', bg: '#7a907112' },
  { label: 'Адаптація', Icon: Compass, color: '#2f4058', bg: '#2f405812' },
  { label: 'Сон', Icon: Moon, color: '#7b6b95', bg: '#9b8bb512' },
  { label: 'Тривожність', Icon: Cloud, color: '#b08030', bg: '#c4932612' },
  { label: 'Емоції', Icon: Smile, color: '#c45740', bg: '#c4572612' },
];

export function SituationGrid() {
  return (
    <section className="bg-app-elevated px-8 py-[60px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[32px] font-semibold text-app-text">
            Для яких ситуацій підійдуть казки?
          </h2>
          <p className="text-base text-app-secondary">
            Кожна казка створена для конкретної дитячої потреби
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {situations.map(({ label, Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-pill px-5 py-2.5"
              style={{ backgroundColor: bg }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color }} />
              <span className="text-[14px] font-medium" style={{ color }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
