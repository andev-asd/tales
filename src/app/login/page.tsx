import { BookOpen } from 'lucide-react';
import { LoginForm } from '@/src/components/forms/login-form';

export default function LoginPage() {
  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-primary)] shadow-soft">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-app-text">Своя Казка</h1>
          <p className="text-sm text-app-secondary">
            Увійдіть, щоб зберігати казки та стежити за замовленнями
          </p>
        </div>

        {/* Auth options */}
        <LoginForm />

        <p className="text-center text-xs text-app-muted">
          Продовжуючи, ви погоджуєтесь з умовами використання сервісу
        </p>
      </div>
    </section>
  );
}
