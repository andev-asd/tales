import { createAuth } from '@/src/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export async function GET(request: Request) {
  const { GET } = toNextJsHandler(createAuth());
  return GET(request);
}

export async function POST(request: Request) {
  const { POST } = toNextJsHandler(createAuth());
  return POST(request);
}
