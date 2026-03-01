import type { Profile } from '@/stores/authStore';

function ensureArray(val: unknown): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => {
      const s = String(v).replace(/^\{|\}$/g, '');
      return s.includes(',') ? s.split(',').map((x) => x.replace(/"/g, '').trim()) : [s];
    });
  }
  if (typeof val === 'string') {
    const trimmed = val.replace(/^\{|\}$/g, '');
    return trimmed ? trimmed.split(',').map((s) => s.replace(/"/g, '').trim()) : [];
  }
  return [String(val)];
}

// Maps interest keys to i18n starter keys
const INTEREST_STARTERS: Record<string, string> = {
  travel: 'starters.travel',
  cooking: 'starters.cooking',
  music: 'starters.music',
  hiking: 'starters.hiking',
  yoga: 'starters.yoga',
  photography: 'starters.photography',
  art: 'starters.art',
  gaming: 'starters.gaming',
  reading: 'starters.reading',
  fitness: 'starters.fitness',
  dancing: 'starters.dancing',
  movies: 'starters.movies',
  nature: 'starters.nature',
  wine: 'starters.wine',
  coffee: 'starters.coffee',
  cats: 'starters.cats',
  dogs: 'starters.dogs',
};

const ZODIAC_STARTER = 'starters.zodiac';

const GENERIC_STARTERS = [
  'starters.generic1',
  'starters.generic2',
  'starters.generic3',
  'starters.generic4',
  'starters.generic5',
];

/**
 * Returns up to 3 conversation starter i18n keys based on shared profile data.
 */
export function getStarters(myProfile: Profile, otherProfile: Profile): string[] {
  const starters: string[] = [];

  const myInterests = new Set(ensureArray(myProfile.interests));
  const otherInterests = ensureArray(otherProfile.interests);

  // Add starters for shared interests
  for (const interest of otherInterests) {
    if (myInterests.has(interest) && INTEREST_STARTERS[interest]) {
      starters.push(INTEREST_STARTERS[interest]);
      if (starters.length >= 3) return starters;
    }
  }

  // If they share zodiac sign
  if (myProfile.zodiac && otherProfile.zodiac) {
    starters.push(ZODIAC_STARTER);
    if (starters.length >= 3) return starters;
  }

  // Fill remaining with generic starters
  const shuffled = [...GENERIC_STARTERS].sort(() => Math.random() - 0.5);
  for (const generic of shuffled) {
    if (starters.length >= 3) break;
    starters.push(generic);
  }

  return starters;
}
