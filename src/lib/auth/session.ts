import 'server-only';

type Session = { userId: string; email: string };

/**
 * Phase 2 placeholder. Replace with the chosen auth library's session lookup;
 * its cookies must be HttpOnly, Secure and SameSite=Lax or stricter.
 */
export async function getSession(): Promise<Session | null> {
  return null;
}
