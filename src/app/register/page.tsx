import { EmailRegisterForm } from '@/src/components/forms/email-register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16 md:px-8">
      <div className="w-full space-y-6">
        <h1 className="font-display text-4xl text-app-text">Реєстрація</h1>
        <p className="text-app-secondary">
          Створіть акаунт, щоб зберігати казки та оформлювати замовлення.
        </p>
        <EmailRegisterForm />
        <p className="text-center text-sm text-app-secondary">
          Вже маєте акаунт?{' '}
          <Link href="/login/email" className="underline hover:text-app-text">
            Увійти
          </Link>
        </p>
      </div>
    </section>
  );
}
