import type { DistrictInfo } from './types';

export const DISTRICTS: DistrictInfo[] = [
  { id: 'central-western', zh: '中西區', en: 'Central & Western' },
  { id: 'wan-chai', zh: '灣仔區', en: 'Wan Chai' },
  { id: 'eastern', zh: '東區', en: 'Eastern' },
  { id: 'southern', zh: '南區', en: 'Southern' },
  { id: 'yau-tsim-mong', zh: '油尖旺區', en: 'Yau Tsim Mong' },
  { id: 'sham-shui-po', zh: '深水埗區', en: 'Sham Shui Po' },
  { id: 'kowloon-city', zh: '九龍城區', en: 'Kowloon City' },
  { id: 'wong-tai-sin', zh: '黃大仙區', en: 'Wong Tai Sin' },
  { id: 'kwun-tong', zh: '觀塘區', en: 'Kwun Tong' },
  { id: 'kwai-tsing', zh: '葵青區', en: 'Kwai Tsing' },
  { id: 'tsuen-wan', zh: '荃灣區', en: 'Tsuen Wan' },
  { id: 'tuen-mun', zh: '屯門區', en: 'Tuen Mun' },
  { id: 'yuen-long', zh: '元朗區', en: 'Yuen Long' },
  { id: 'north', zh: '北區', en: 'North' },
  { id: 'tai-po', zh: '大埔區', en: 'Tai Po' },
  { id: 'sha-tin', zh: '沙田區', en: 'Sha Tin' },
  { id: 'sai-kung', zh: '西貢區', en: 'Sai Kung' },
  { id: 'islands', zh: '離島區', en: 'Islands' },
];

export function districtName(id: string, lang: 'zh' | 'en'): string {
  const d = DISTRICTS.find((x) => x.id === id);
  return d ? (lang === 'zh' ? d.zh : d.en) : id;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
export const AGE_GROUPS: AgeGroup[] = ['baby', 'young', 'adult', 'senior'];

/** Buckets (matches HKDR's own scheme): <1y, 1–2y, 2–10y, 10y+. */
export function ageGroup(months: number): AgeGroup {
  if (months < 12) return 'baby';
  if (months < 24) return 'young';
  if (months < 120) return 'adult';
  return 'senior';
}

/** Formats an exact age for display, e.g. 「4歲8個月」 / "4y 8m". */
export function formatAge(months: number, lang: 'zh' | 'en'): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (lang === 'zh') {
    if (y === 0) return `${m}個月`;
    return m === 0 ? `${y}歲` : `${y}歲${m}個月`;
  }
  if (y === 0) return `${m}mo`;
  return m === 0 ? `${y}y` : `${y}y ${m}m`;
}

/**
 * Canonical Chinese breed labels — collapses the orgs' mixed-language and
 * overlapping spellings (唐狗/Mongrel/Mixed Breed…, 短毛家貓/DSH/DSH Tortie…,
 * BSH/英國短毛/British Shorthair…) into one filter value each.
 * Keys are lowercased raw org text.
 */
const BREED_CANON: Record<string, string> = {
  // dogs — mixed / 唐狗 family
  '唐狗': '唐狗',
  mongrel: '唐狗',
  'mixed breed': '唐狗',
  mixed: '唐狗',
  'mixed-breed': '唐狗',
  mix: '唐狗',
  'multibreed 唐狗': '唐狗',
  'multi breed 唐狗': '唐狗',
  '不知道': '唐狗',
  'terrier cross': '唐狗',
  'terrier mix': '唐狗',
  'mix terrier': '唐狗',
  'poodle/terrier': '唐狗',
  terrier: '梗犬',
  // dogs — named breeds
  poodle: '貴婦犬',
  'miniature poodle': '貴婦犬',
  '貴婦': '貴婦犬',
  '松鼠': '松鼠狗',
  '松鼠狗': '松鼠狗',
  pomeranian: '松鼠狗',
  'shiba inu': '柴犬',
  '柴犬': '柴犬',
  'golden retriever': '金毛尋回犬',
  '金毛尋回犬': '金毛尋回犬',
  labrador: '拉布拉多',
  beagle: '比格犬',
  samoyed: '薩摩耶',
  '西摩': '薩摩耶',
  sharpei: '沙皮狗',
  '沙皮(混種)': '沙皮狗',
  '馬爾泰迪': '馬爾泰迪犬',
  '比熊': '比熊犬',
  'malinois mix': '比利時瑪利諾犬',
  // cats — 唐貓 family
  '短毛家貓': '唐貓',
  '唐貓': '唐貓',
  dsh: '唐貓',
  'domestic short hair': '唐貓',
  'dsh tortie': '唐貓',
  'ginger dsh': '唐貓',
  'dsh tabby white': '唐貓',
  tabby: '唐貓',
  'domestic longhair': '長毛家貓', // phase 1: dogs & cats only — kept for stray-data normalisation
  // cats — named breeds
  bsh: '英國短毛貓',
  '英國短毛': '英國短毛貓',
  '英國短毛貓': '英國短毛貓',
  'british shorthair': '英國短毛貓',
  'british short hair': '英國短毛貓',
  'bsh x': '英國短毛貓',
  '混種英國短毛貓': '英國短毛貓',
  esh: '異國短毛貓',
  '異國短毛': '異國短毛貓',
  '布偶': '布偶貓',
  ragdoll: '布偶貓',
  'devon rex': '德文捲毛貓',
  'scottish fold': '蘇格蘭摺耳貓',
  '緬因貓': '緬因貓',
  'maine coon': '緬因貓',
  '曼基': '曼基康貓',
  '拿破崙貓': '拿破崙貓',
  '金吉拉(混種)': '金吉拉',
};

/** Canonical Chinese breed for filter/matching; falls back to trimmed raw text. */
export function normBreed(raw: string | undefined, type?: 'dog' | 'cat'): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  if (BREED_CANON[key]) return BREED_CANON[key];
  if (/mix|cross|mongrel|不知道/.test(key)) return type === 'cat' ? '唐貓' : '唐狗';
  return raw.trim();
}
