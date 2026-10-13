import { api } from './client';

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  language: string;
  /** Honeypot: must stay empty. Bots that fill every field get silently dropped. */
  website: string;
}

export async function sendContactMessage(input: ContactMessageInput): Promise<{ message: string }> {
  return api.post<{ message: string }>('/contact_messages', input);
}
