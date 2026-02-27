import { supabase } from './supabase';
import { reportError } from './errorReporting';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  typing_in_match: string | null;
}

export async function updatePresence(
  isOnline: boolean,
  typingInMatch?: string | null
): Promise<void> {
  try {
    // Use getSession (local, no network call) instead of getUser (network call)
    // so sign-out can reliably mark offline before the session is destroyed.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: session.user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        typing_in_match: typingInMatch ?? null,
      });

    if (error) throw error;
  } catch (error) {
    reportError(error, { source: 'presence.updatePresence' });
  }
}

export function subscribeToPresence(
  userId: string,
  callback: (presence: UserPresence) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`presence:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as UserPresence);
      }
    )
    .subscribe();

  return channel;
}

export async function getPresence(userId: string): Promise<UserPresence | null> {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    reportError(error, { source: 'presence.getPresence' });
    return null;
  }

  return data as UserPresence | null;
}
