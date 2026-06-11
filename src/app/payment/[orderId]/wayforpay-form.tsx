'use client';

import { useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';

export function WayForPayForm({ formData }: { formData: Record<string, string> }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Short delay so the loading screen renders before navigation
    const timer = setTimeout(() => {
      formRef.current?.submit();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading screen */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--bg-body,#faf7f2)]">
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Spinning ring */}
          <svg
            className="absolute inset-0 animate-spin"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="36" stroke="var(--border-default,rgba(36,27,20,0.12))" strokeWidth="4" />
            <path
              d="M40 4 a36 36 0 0 1 36 36"
              stroke="var(--accent-primary,#b86549)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          {/* Icon in center */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-primary,#b86549)] shadow-soft">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-base font-medium text-app-text">Переходимо до оплати</p>
          <p className="text-sm text-app-muted">Будь ласка, зачекайте кілька секунд…</p>
        </div>
      </div>

      {/* Hidden auto-submit form */}
      <form ref={formRef} method="POST" action="https://secure.wayforpay.com/pay" className="hidden">
        {Object.entries(formData).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <noscript>
          <button type="submit">Перейти до оплати</button>
        </noscript>
      </form>
    </>
  );
}
