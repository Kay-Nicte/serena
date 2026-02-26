import { useEffect } from 'react';
import { usePhotoStore, type Photo } from '@/stores/photoStore';
import { getPhotoUrl } from '@/lib/storage';

export type { Photo } from '@/stores/photoStore';

export interface PhotoWithUrl extends Photo {
  url: string;
}

/** Attach public URLs to photo records from the database */
export function withPhotoUrls<T extends Photo>(photos: T[]): (T & { url: string })[] {
  return photos.map((photo) => ({
    ...photo,
    url: getPhotoUrl(photo.storage_path),
  }));
}

export function usePhotos(userId: string | undefined) {
  const { photos, isLoading, fetchPhotos, addPhoto, removePhoto } =
    usePhotoStore();

  useEffect(() => {
    if (userId) {
      fetchPhotos(userId);
    }
  }, [userId]);

  return { photos, isLoading, addPhoto, removePhoto, fetchPhotos };
}
