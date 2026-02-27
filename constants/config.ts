export const ORIENTATIONS = ['lesbian', 'bisexual', 'pansexual', 'queer', 'other'] as const;
export const LOOKING_FOR_OPTIONS = ['friendship', 'dating', 'relationship', 'explore'] as const;

export type Orientation = (typeof ORIENTATIONS)[number];
export type LookingFor = (typeof LOOKING_FOR_OPTIONS)[number];

export const INTERESTS = [
  'travel', 'cooking', 'music', 'hiking', 'yoga', 'photography', 'art',
  'gaming', 'reading', 'fitness', 'dancing', 'movies', 'nature', 'wine',
  'coffee', 'cats', 'dogs',
] as const;

export const CHILDREN_OPTIONS = [
  'has_and_wants_more', 'has_and_doesnt_want_more',
  'doesnt_have_and_wants', 'doesnt_have_and_doesnt_want', 'not_sure',
] as const;

export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

export const PET_OPTIONS = ['dog', 'cat', 'bird', 'fish', 'reptile', 'none'] as const;

export const SMOKING_OPTIONS = ['never', 'sometimes', 'regularly'] as const;
export const DRINKING_OPTIONS = ['never', 'sometimes', 'regularly'] as const;

export const HOGWARTS_HOUSES = ['gryffindor', 'slytherin', 'hufflepuff', 'ravenclaw'] as const;

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
  discoveryDefaults: {
    minAge: 18,
    maxAge: 99,
    maxDistance: 50,
  },
  maxDistanceLimit: 200,
  defaultMaxDistanceKm: 50,
  freeDailyLikes: 5,
  premiumDailyLikes: 10,
} as const;
