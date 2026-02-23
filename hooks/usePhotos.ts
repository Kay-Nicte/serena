import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { pickImage, uploadPhoto, getPhotoUrl, deletePhoto } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';

export interface Photo {
  id: string;
  user_id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}

export function usePhotos(userId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;
      setPhotos((data as Photo[]) ?? []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const syncAvatar = useCallback(
    async (newAvatarUrl: string | null) => {
      if (!userId) return;
      await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);
      await useAuthStore.getState().fetchProfile();
    },
    [userId]
  );

  const addPhoto = useCallback(
    async (position: number) => {
      if (!userId) return;

      const uri = await pickImage();
      if (!uri) return;

      setIsLoading(true);
      try {
        const storagePath = await uploadPhoto(userId, uri, position);
        const url = getPhotoUrl(storagePath);

        const { error } = await supabase.from('photos').insert({
          user_id: userId,
          storage_path: storagePath,
          url,
          position,
        });

        if (error) throw error;

        if (position === 0) {
          await syncAvatar(url);
        }

        await fetchPhotos();
      } catch (error) {
        console.error('Error adding photo:', error);
        Alert.alert('Error', 'Could not upload photo');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchPhotos, syncAvatar]
  );

  const removePhoto = useCallback(
    async (photoId: string, storagePath: string, position: number) => {
      if (!userId) return;

      setIsLoading(true);
      try {
        await deletePhoto(storagePath);

        const { error } = await supabase
          .from('photos')
          .delete()
          .eq('id', photoId);

        if (error) throw error;

        if (position === 0) {
          // Check if there's another photo to promote as avatar
          const { data: remaining } = await supabase
            .from('photos')
            .select('url')
            .eq('user_id', userId)
            .order('position', { ascending: true })
            .limit(1);

          await syncAvatar(remaining?.[0]?.url ?? null);
        }

        await fetchPhotos();
      } catch (error) {
        console.error('Error removing photo:', error);
        Alert.alert('Error', 'Could not delete photo');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchPhotos, syncAvatar]
  );

  return { photos, isLoading, fetchPhotos, addPhoto, removePhoto };
}
