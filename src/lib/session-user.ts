type HeaderUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN' | null;
};

type SessionShape =
  | {
      user?: {
        id?: string | null;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN' | null;
      } | null;
    }
  | null;

export function mapSessionToHeaderUser(session: SessionShape): HeaderUser | null {
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id ?? null,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role ?? null,
  };
}
