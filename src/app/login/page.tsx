import { LoginForm } from '@/src/components/forms/login-form';

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16 md:px-8">
      <div className="w-full space-y-6">
        <h1 className="font-display text-5xl text-app-text">Увійти</h1>
        <p className="text-app-secondary">
          Авторизуйтеся, щоб зберігати казки в колекцію, бачити замовлення та
          працювати з індивідуальними історіями.
        </p>
        <LoginForm />
      </div>
    </section>
  );
}
