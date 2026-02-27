import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function reauthenticate(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function deleteAccount() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Clean up storage files client-side (Supabase doesn't allow direct SQL on storage.objects)
  try {
    // Clean up profile photos
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('user_id', user.id);

    if (photos && photos.length > 0) {
      const paths = photos.map((p) => p.storage_path);
      await supabase.storage.from('profile-photos').remove(paths);
    }

    // Clean up chat images
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

    if (matches && matches.length > 0) {
      for (const match of matches) {
        const { data: files } = await supabase.storage
          .from('chat-images')
          .list(match.id);

        if (files && files.length > 0) {
          const filePaths = files.map((file) => `${match.id}/${file.name}`);
          await supabase.storage.from('chat-images').remove(filePaths);
        }
      }
    }
  } catch {
    // Storage cleanup is best-effort; don't block account deletion
  }

  // Call the server-side RPC to delete all account data
  const { error } = await supabase.rpc('delete_own_account');
  if (error) {
    console.error('[DeleteAccount] RPC error:', JSON.stringify(error));
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'serenade://reset-password',
  });
  if (error) throw error;
}

export async function updatePasswordFromReset(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
