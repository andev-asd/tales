export function buildGoogleSignInUrl(callbackURL: string) {
  const params = new URLSearchParams({
    provider: 'google',
    callbackURL,
  });

  return `/api/auth/sign-in/social?${params.toString()}`;
}
