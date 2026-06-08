import { EmailLoginForm } from '@/src/components/forms/email-login-form';
import Link from 'next/link';

export default function EmailLoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16 md:px-8">
      <div className="w-full space-y-6">
        <h1 className="font-display text-4xl text-app-text">Вхід через email</h1>
        <EmailLoginForm />
        <p className="text-center text-sm text-app-secondary">
          Ще не маєте акаунту?{' '}
          <Link href="/register" className="underline hover:text-app-text">
            Зареєструватись
          </Link>
        </p>
      </div>
    </section>
  );
}
