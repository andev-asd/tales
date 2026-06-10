import 'server-only';
import { getEnv } from './env';

export type ChatMessagePayload = {
  id: string;
  authorLabel: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

export async function broadcastOrderChatMessage(
  orderId: string,
  message: ChatMessagePayload,
): Promise<void> {
  const env = getEnv();
  await fetch(`${env.SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: `realtime:order-chat:${orderId}`,
          event: 'message',
          payload: message,
        },
      ],
    }),
  });
}
