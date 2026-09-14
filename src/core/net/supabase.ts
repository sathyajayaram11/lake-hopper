import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { eventBus } from '../events/bus';

export const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export function initSupabaseAuth(): void {
  eventBus.on('LoginSubmitted', async ({ name, section }) => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      console.error('Anonymous sign-in failed', error);
      return;
    }

    const { error: upsertError } = await supabase
      .from('players')
      .upsert({ id: data.user.id, name, section });
    if (upsertError) {
      console.error('Failed to save player row', upsertError);
      return;
    }

    eventBus.emit('login_completed', { playerId: data.user.id, section });
  });
}
