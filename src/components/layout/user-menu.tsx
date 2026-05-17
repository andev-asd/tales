"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/src/lib/auth-client";

type UserMenuProps = {
  user: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN' | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const handleNavigate = () => {
    setOpen(false);
  };

  const roleLinks = [
    user.role === 'SUPERADMIN'
      ? { href: '/superadmin', label: 'Суперадмінка' }
      : null,
    user.role === 'ADMIN' || user.role === 'SUPERADMIN'
      ? { href: '/admin', label: 'Адмінка' }
      : null,
    user.role === 'PSYCHOLOGIST' || user.role === 'ADMIN' || user.role === 'SUPERADMIN'
      ? { href: '/psychologist', label: 'Кабінет психолога' }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text shadow-soft"
      >
        {user.image && !avatarFailed ? (
          <img
            src={user.image}
            alt={user.name ?? "Аватар користувача"}
            className="h-8 w-8 rounded-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-app-accentSecondary text-xs font-semibold text-white">
            {(user.name ?? "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <span>{user.name ?? "Користувач"}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 min-w-[220px] rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-2 shadow-soft"
        >
          {roleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={handleNavigate}
              className="block rounded-[var(--radius-md)] px-4 py-3 text-sm text-app-text hover:bg-app-elevated"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/library"
            role="menuitem"
            onClick={handleNavigate}
            className="block rounded-[var(--radius-md)] px-4 py-3 text-sm text-app-text hover:bg-app-elevated"
          >
            Моя колекція
          </Link>
          <Link
            href="/orders"
            role="menuitem"
            onClick={handleNavigate}
            className="block rounded-[var(--radius-md)] px-4 py-3 text-sm text-app-text hover:bg-app-elevated"
          >
            Мої замовлення
          </Link>
          <Link
            href="/orders"
            role="menuitem"
            onClick={handleNavigate}
            className="block rounded-[var(--radius-md)] px-4 py-3 text-sm text-app-text hover:bg-app-elevated"
          >
            Повідомлення
          </Link>
          <Link
            href="/account/password"
            role="menuitem"
            onClick={handleNavigate}
            className="block rounded-[var(--radius-md)] px-4 py-3 text-sm text-app-text hover:bg-app-elevated"
          >
            Змінити пароль
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full rounded-[var(--radius-md)] px-4 py-3 text-left text-sm text-app-text hover:bg-app-elevated"
          >
            Вийти
          </button>
        </div>
      ) : null}
    </div>
  );
}
