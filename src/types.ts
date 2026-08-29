export type Lang = 'zh' | 'en';

export interface Localized {
  zh: string;
  en: string;
}

export type PetType = 'dog' | 'cat';
export type Gender = 'male' | 'female';
export type Size = 'small' | 'medium' | 'large';

/**
 * A real adoption case aggregated from an organisation's public website.
 * We only keep the name + a direct link back to the org's own page.
 * Photos/stories stay on the org site (copyright + freshness).
 */
export interface Listing {
  id: string;
  name: string;
  type: PetType;
  orgId: string;
  url: string;
  gender?: Gender;
  breed?: string;
  size?: Size;
  /** Exact age in months, parsed from the org's listing. */
  ageMonths?: number;
  note?: Localized;
  /** Hotlinked from the org's own server — never rehosted. */
  img?: string;
  emoji: string;
  hue: number;
  /** 社區送養: verified individual rescuer's display name. */
  by?: string;
}

export interface Org {
  id: string;
  name: Localized;
  short: Localized;
  desc: Localized;
  districts: string[]; // empty = territory-wide
  website: string;
  dogsUrl?: string;
  catsUrl?: string;
  applyUrl?: string;
  phone?: string;
  email?: string;
  visitNote?: Localized;
}

export type Housing = 'private' | 'hos' | 'public' | 'village' | 'house';
export type Experience = 'none' | 'some' | 'expert';

export interface AdopterProfile {
  name: string;
  phone: string;
  email: string;
  housing: Housing;
  hasKids: boolean;
  hasPets: boolean;
  experience: Experience;
  dailyHours: number;
  intro: string;
  createdAt: string;
}

export type AppStatus = 'submitted' | 'reviewing' | 'interview' | 'approved' | 'rejected';

export interface Application {
  id: string;
  title: string; // listing name (denormalised — tracker is manual)
  orgId: string;
  url: string;
  status: AppStatus;
  submittedAt: string;
  updatedAt: string;
  history: { status: AppStatus; at: string }[];
}

export interface DistrictInfo {
  id: string;
  zh: string;
  en: string;
}
