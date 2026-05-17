'use client';

import { createAuthClient } from 'better-auth/react';

export const authClientBaseURL = undefined;

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
});
