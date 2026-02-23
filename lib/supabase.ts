import { createClient } from '@supabase/supabase-js';
import { openDatabaseSync } from 'expo-sqlite';

const supabaseUrl = 'https://twhyijzjnhqgrdhrjdat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aHlpanpqbmhxZ3JkaHJqZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDUwMDcsImV4cCI6MjA4NzM4MTAwN30.Q_Xza3WiA-isiTM2fzq3CGlhLFyskISoqdKi6sDe9hQ';

class SupabaseStorage {
  private db = openDatabaseSync('supabase-auth');

  constructor() {
    this.db.execSync(
      'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);'
    );
  }

  getItem(key: string): string | null {
    const row = this.db.getFirstSync<{ value: string }>(
      'SELECT value FROM kv WHERE key = ?;',
      [key]
    );
    return row?.value ?? null;
  }

  setItem(key: string, value: string): void {
    this.db.runSync(
      'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?);',
      [key, value]
    );
  }

  removeItem(key: string): void {
    this.db.runSync('DELETE FROM kv WHERE key = ?;', [key]);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SupabaseStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
