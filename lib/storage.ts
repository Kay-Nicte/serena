import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { Config } from '@/constants/config';
import { decode } from 'base64-arraybuffer';

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function uploadPhoto(
  userId: string,
  uri: string,
  position: number
): Promise<string> {
  const timestamp = Date.now();
  const extension = uri.split('.').pop() ?? 'jpg';
  const path = `${userId}/${position}-${timestamp}.${extension}`;

  const base64 = await readAsStringAsync(uri, {
    encoding: 'base64',
  });

  const { error } = await supabase.storage
    .from(Config.storageBucket)
    .upload(path, decode(base64), {
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      upsert: true,
    });

  if (error) throw error;
  return path;
}

export function getPhotoUrl(path: string): string {
  const { data } = supabase.storage
    .from(Config.storageBucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(Config.storageBucket)
    .remove([path]);
  if (error) throw error;
}

export async function uploadChatImage(
  matchId: string,
  uri: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = uri.split('.').pop() ?? 'jpg';
  const path = `${matchId}/${timestamp}.${extension}`;

  const base64 = await readAsStringAsync(uri, {
    encoding: 'base64',
  });

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(path, decode(base64), {
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('chat-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
