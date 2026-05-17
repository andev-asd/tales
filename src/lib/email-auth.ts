export function buildEmailSignInPayload(
  email: string,
  password: string,
  callbackURL: string,
) {
  return {
    email,
    password,
    callbackURL,
  };
}

export function buildChangePasswordPayload(
  currentPassword: string,
  newPassword: string,
) {
  return {
    currentPassword,
    newPassword,
    revokeOtherSessions: false,
  };
}
