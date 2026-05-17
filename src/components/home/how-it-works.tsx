import { BookOpen, Download, UserCheck } from 'lucide-react';

const steps = [
  {
    num: '1',
    numColor: '#b86549',
    numBg: '#b8654915',
    Icon: BookOpen,
    iconColor: '#b86549',
    title: 'Оберіть казку',
    desc: 'Готову з каталогу або індивідуальний формат з психологинею',
  },
  {
    num: '2',
    numColor: '#7a9071',
    numBg: '#7a907115',
    Icon: UserCheck,
    iconColor: '#7a9071',
    title: 'Авторизуйтесь',
    desc: 'Щоб зберегти казку у бібліотеку або оформити замовлення',
  },
  {
    num: '3',
    numColor: '#2f4058',
    numBg: '#2f405815',
    Icon: Download,
    iconColor: '#2f4058',
    title: 'Отримайте PDF',
    desc: 'Завантажте казку у вашому особистому кабінеті в будь-який зручний час',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-app-elevated px-8 py-[72px]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[32px] font-semibold text-app-text">
            Як це працює
          </h2>
          <p className="text-base text-app-secondary">
            Три простих кроки до терапевтичної казки
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ num, numColor, numBg, Icon, iconColor, title, desc }) => (
            <div
              key={num}
              className="flex flex-col items-center gap-4 px-6 py-8 text-center"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-pill"
                style={{ backgroundColor: numBg }}
              >
                <span className="font-display text-xl font-semibold" style={{ color: numColor }}>
                  {num}
                </span>
              </div>
              <Icon className="h-8 w-8" style={{ color: iconColor }} />
              <h3 className="font-display text-xl font-semibold text-app-text">{title}</h3>
              <p className="text-[14px] leading-[1.6] text-app-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
