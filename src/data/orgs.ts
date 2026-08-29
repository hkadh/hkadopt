import type { Org } from '../types';

/**
 * Rescues we can't auto-index (bot-protected sites, Wix/JS galleries,
 * Instagram/WhatsApp-based foster networks, or non-cat/dog focus).
 * Still listed so adopters can reach them in one tap.
 * All URLs verified 2026-08-28.
 */
export interface AdoptionChannel {
  name: { zh: string; en: string };
  url: string;
  kind: 'site' | 'instagram';
}

export const CHANNELS: AdoptionChannel[] = [
  {
    name: { zh: 'KirstensZoo', en: 'KirstensZoo' },
    url: 'https://kirstenszoo.com/foster-adopt/dog-adoption/',
    kind: 'site',
  },
  {
    name: { zh: '香港拯救貓狗協會', en: 'HK Saving Cat and Dog Association (HKSCDA)' },
    url: 'https://www.hkscda.com/',
    kind: 'site',
  },
  {
    name: { zh: '阿棍屋', en: 'House of Joy and Mercy' },
    url: 'https://www.hjoy.org/',
    kind: 'site',
  },
  {
    name: { zh: '大樹下善待動物庇護站', en: 'Big Tree Animal Sanctuary' },
    url: 'http://www.bigtree.org.hk/',
    kind: 'site',
  },
  {
    name: { zh: '毛守救援', en: 'Paws Guardian Rescue (PGRS)' },
    url: 'https://www.pgrs.life/',
    kind: 'site',
  },
  {
    name: { zh: 'No Dogs Left Behind', en: 'No Dogs Left Behind' },
    url: 'https://www.nodogsleftbehind.com/',
    kind: 'site',
  },
  {
    name: { zh: '西貢流浪之友', en: 'Sai Kung Stray Friends' },
    url: 'https://saikungstrayfriends.com/adopt/',
    kind: 'site',
  },
  {
    name: { zh: 'Paws United Charity', en: 'Paws United Charity' },
    url: 'https://pawsunited.org.hk/adopt/',
    kind: 'site',
  },
  {
    name: { zh: 'Regina Paws HK', en: 'Regina Paws HK' },
    url: 'https://www.instagram.com/reginapawshk/',
    kind: 'instagram',
  },
  {
    name: { zh: 'Mongrels Family', en: 'Mongrels Family' },
    url: 'https://www.instagram.com/mongrelsfamily/',
    kind: 'instagram',
  },
  {
    name: { zh: '香港後巷貓', en: 'HK Alley Cat Watch' },
    url: 'https://www.hkalleycatwatch.com',
    kind: 'site',
  },
  {
    name: { zh: '南丫島動物保護區', en: 'Lamma Animals' },
    url: 'https://www.lammaanimals.org',
    kind: 'site',
  },
];

/**
 * Real Hong Kong adoption organisations.
 * All URLs verified on 2026-08-28. Links point directly to each org's own
 * adoption pages — listings and applications live on their sites, not here.
 */
export const ORGS: Org[] = [
  {
    id: 'hkdr',
    name: { zh: '救狗之家', en: 'Hong Kong Dog Rescue (HKDR)' },
    short: { zh: '救狗之家 HKDR', en: 'HKDR' },
    desc: {
      zh: '自2003年起拯救及重新安置流浪狗同被遺棄狗隻，累計重新安置超過一萬隻狗。鴨脷洲同大埔設領養中心，每日10am-5pm開放。',
      en: 'Rescuing and rehoming Hong Kong’s stray and abandoned dogs since 2003 — over 10,000 rehomed to date. Homing centres in Ap Lei Chau and Tai Po, open daily 10am–5pm.',
    },
    districts: ['southern', 'tai-po'],
    website: 'https://hongkongdogrescue.com/',
    dogsUrl: 'https://hongkongdogrescue.com/dogs/',
    applyUrl: 'https://hongkongdogrescue.com/adopt/adoption-questionnaire/',
    email: 'info@hongkongdogrescue.com',
    visitNote: {
      zh: '領養中心：鴨脷洲惠風街13-15號地下／大埔石林路6號（每日10:00–17:00）',
      en: 'Homing centres: G/F 13-15 Wai Fung St, Ap Lei Chau / 6 Shek Lin Rd, Tai Po (daily 10:00–17:00)',
    },
  },
  {
    id: 'lap',
    name: { zh: '保護動物慈善協會', en: 'LAP Lifelong Animal Protection Charity' },
    short: { zh: 'LAP', en: 'LAP' },
    desc: {
      zh: '香港註冊慈善團體，狗狗領養中心喺荃灣，貓貓領養中心喺西營盤，網上填表申請領養。',
      en: 'Registered HK charity with a dog adoption centre in Tsuen Wan and a cat adoption centre in Sai Ying Pun. Applications via online forms.',
    },
    districts: ['tsuen-wan', 'central-western'],
    website: 'https://www.lap.org.hk/',
    dogsUrl: 'https://www.lap.org.hk/adoptdog.aspx',
    catsUrl: 'https://www.lap.org.hk/adoptcat.aspx',
    applyUrl: 'https://form.typeform.com/to/biUzuu',
    visitNote: {
      zh: '狗中心：荃灣荃景圍187號1B舖｜貓中心：西營盤第一街11號',
      en: 'Dog centre: Shop 1B, 187 Tsuen King Circuit, Tsuen Wan · Cat centre: 11 First Street, Sai Ying Pun',
    },
  },
  {
    id: 'spca',
    name: { zh: '香港愛護動物協會', en: 'SPCA (Hong Kong)' },
    short: { zh: 'SPCA', en: 'SPCA' },
    desc: {
      zh: '香港歷史最悠久嘅動物福利組織。待領養動物包括狗、貓及其他小動物，灣仔、青衣、九龍及西貢領養中心每日11am–5:30pm開放（免預約）。',
      en: 'Hong Kong’s longest-standing animal welfare organisation. Dogs, cats and small animals for adoption; centres in Wan Chai, Tsing Yi, Kowloon and Sai Kung open daily 11am–5:30pm (no appointment needed).',
    },
    districts: ['wan-chai', 'kwai-tsing', 'sai-kung'],
    website: 'https://www.spca.org.hk/',
    dogsUrl: 'https://www.spca.org.hk/zh-hant/adoption/animals-for-adoption/?sel_specie=5',
    catsUrl: 'https://www.spca.org.hk/zh-hant/adoption/animals-for-adoption/?sel_specie=3',
    visitNote: {
      zh: '領養中心每日11:00–17:30開放，免預約',
      en: 'Adoption centres open daily 11:00–17:30, walk-in',
    },
  },
  {
    id: 'saa',
    name: { zh: '保護遺棄動物協會', en: 'Society for Abandoned Animals (SAA)' },
    short: { zh: 'SAA', en: 'SAA' },
    desc: {
      zh: '1997年創辦，「不殺不棄」，現照顧約三百頭動物。元朗收容所逢星期五、六、日及公眾假期下午12:30–3:45開放探訪。',
      en: 'Founded in 1997 on a “no-kill, no-abandonment” principle, caring for around 300 animals. Yuen Long shelter open for visits Fri–Sun & public holidays, 12:30–3:45pm.',
    },
    districts: ['yuen-long'],
    website: 'https://www.saa.org.hk/zh/index.php',
    dogsUrl: 'https://www.saa.org.hk/zh/adopt.php?t=1',
    catsUrl: 'https://www.saa.org.hk/zh/adopt.php?t=2',
    phone: '2838 0633',
    email: 'saa@saa.org.hk',
    visitNote: {
      zh: '開放時間：逢五、六、日及公眾假期 12:30–15:45',
      en: 'Visiting: Fri, Sat, Sun & public holidays 12:30–15:45',
    },
  },
  {
    id: 'hkaac',
    name: { zh: '香港動物領養中心', en: 'HK Animal Adoption Centre (HKAAC)' },
    short: { zh: 'HKAAC', en: 'HKAAC' },
    desc: {
      zh: '註冊慈善團體（91/10368），位於屯門，貓狗領養服務，探訪請先致電預約。',
      en: 'Registered charity (91/10368) in Tuen Mun rehoming cats and dogs. Call ahead to arrange a visit.',
    },
    districts: ['tuen-mun'],
    website: 'https://www.hk-aac.org.hk/index.php',
    dogsUrl: 'https://www.hk-aac.org.hk/貓狗領養',
    catsUrl: 'https://www.hk-aac.org.hk/貓狗領養',
    phone: '2488 8680',
    email: 'info@hk-aac.org.hk',
    visitNote: {
      zh: '地址：屯門和平新村150號（探訪請先致電預約）',
      en: 'Address: No.150 Wo Ping San Tsuen, Tuen Mun (call to book a visit)',
    },
  },
  {
    id: 'pgrs',
    name: { zh: '毛守救援', en: 'Paws Guardian Rescue (PGRS)' },
    short: { zh: '毛守救援', en: 'PGRS' },
    desc: {
      zh: '2019年成立嘅大型流浪動物救援組織，設有獸醫診所，每日拯救、醫治同安排領養數以百計嘅貓狗。',
      en: 'Major stray-rescue organisation founded in 2019 with its own vet clinic — rescuing, treating and rehoming hundreds of cats and dogs.',
    },
    districts: [],
    website: 'https://www.pgrs.life/',
    dogsUrl: 'https://www.pgrs.life/%e5%be%85%e9%a0%98%e9%a4%8a%e5%af%b5%e7%89%a9/',
    catsUrl: 'https://www.pgrs.life/%e5%be%85%e9%a0%98%e9%a4%8a%e5%af%b5%e7%89%a9/',
    applyUrl: 'https://www.pgrs.life/%e5%be%85%e9%a0%98%e9%a4%8a%e5%af%b5%e7%89%a9/',
  },
  {
    id: 'hfhd',
    name: { zh: '浪浪之家', en: 'Home for Homeless Dog' },
    short: { zh: '浪浪之家', en: 'HFHD' },
    desc: {
      zh: '2019年創辦人April賣樓於大埔偏遠村落興建狗舍，全心全意照顧流浪狗，並為牠們嚴選合適領養者。',
      en: 'Founder April built a kennel in a remote Tai Po village in 2019, caring for rescued dogs and carefully screening adopters.',
    },
    districts: ['tai-po'],
    website: 'https://www.hfhd.org/',
    dogsUrl: 'https://www.hfhd.org/adopt',
    catsUrl: 'https://www.hfhd.org/adopt',
    applyUrl: 'https://www.hfhd.org/adoptionform',
  },
  {
    id: 'hkpaws',
    name: { zh: '香港動物基金', en: 'HK Paws Foundation' },
    short: { zh: '香港動物基金', en: 'HK Paws' },
    desc: {
      zh: '2005年成立的動物福利組織，營運狗舍「Bow Wow Inn」同貓屋，為獲救貓狗絕育、打針並尋找永久家庭。',
      en: 'Animal welfare organisation founded in 2005, running the Bow Wow Inn kennel and cat house — rescuing, neutering, vaccinating and rehoming cats and dogs.',
    },
    districts: [],
    website: 'https://www.hkpaws.org/',
    dogsUrl: 'https://www.hkpaws.org/meet-the-dogs',
    catsUrl: 'https://www.hkpaws.org/meet-the-cats',
    applyUrl: 'https://www.hkpaws.org/adopt-foster-form-dog',
  },
  {
    id: 'afcd',
    name: { zh: '漁護署', en: 'AFCD Animal Rehoming (Government)' },
    short: { zh: '漁護署', en: 'AFCD' },
    desc: {
      zh: '漁農自然護理署將健康、性情溫馴嘅被遺棄或無人認領動物，交畀合作動物福利機構安排領養。',
      en: 'The Agriculture, Fisheries and Conservation Department rehomes healthy, friendly abandoned or unclaimed animals through partnering Animal Welfare Organisations.',
    },
    districts: [],
    website: 'https://www.pets.gov.hk/tc_chi/animal_health_and_welfare/adoption.html',
    dogsUrl: 'https://www.pets.gov.hk/tc_chi/animal_health_and_welfare/adoption.html',
    catsUrl: 'https://www.pets.gov.hk/tc_chi/animal_health_and_welfare/adoption.html',
  },
  {
    id: 'tails',
    name: { zh: '大嶼山動物領養 TAILS Lantau', en: 'TAILS Lantau' },
    short: { zh: 'TAILS Lantau', en: 'TAILS Lantau' },
    desc: {
      zh: '大嶼山動物救援組織，專注貓狗暫養及領養。',
      en: 'Lantau-based rescue specialising in fostering and adoption of cats and dogs.',
    },
    districts: ['islands'],
    website: 'https://www.tailslantau.org/',
    dogsUrl: 'https://www.tailslantau.org/',
    catsUrl: 'https://www.tailslantau.org/',
  },
];

export function getOrg(id: string): Org | undefined {
  return ORGS.find((o) => o.id === id);
}
