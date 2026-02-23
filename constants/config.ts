export const Config = {
  maxPhotos: 6,
  maxBioLength: 500,
  maxNameLength: 50,
  minAge: 18,
  maxAge: 99,
  maxDailyProfiles: 10,
  photoMaxSizeMB: 5,
  photoAllowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  storageBucket: 'profile-photos',
  defaultMaxDistanceKm: 50,
  distanceOptions: [10, 25, 50, 100] as readonly number[],
} as const;
