import { ChangePasswordForm } from '@/src/components/forms/change-password-form';

export default function AccountPasswordPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16 md:px-8">
      <div className="w-full space-y-6">
        <h1 className="font-display text-4xl text-app-text">Зміна пароля</h1>
        <p className="text-app-secondary">
          Оновіть пароль для входу через email, якщо використовуєте цей спосіб авторизації.
        </p>
        <ChangePasswordForm />
      </div>
    </section>
  );
}
