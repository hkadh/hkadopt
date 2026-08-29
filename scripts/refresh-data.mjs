// Refreshes src/data/listings.ts from the organisations' live websites.
// Usage: pnpm refresh   (or: node scripts/refresh-data.mjs)
//
// ── 5. SAA (server-rendered listing at /zh/adopt.php, details carry status) ──
async function scrapeSAA() {
  const parseCards = (html, t) => {
    const out = [];
    const re =
      /<div class="dt_box">[\s\S]{0,400}?<img\s+src="([^"]+)"[\s\S]{0,600}?<a\s+href="ad_detail\.php\?id=(\d+)&t=\d+"[^>]*>\s*<p>([^<]+)<\/p>\s*<p>([^<]+)<\/p>(?:\s*<p>出生年份[:：]\s*(\d{4}))?/g;
    let m;
    while ((m = re.exec(html))) {
      const [, img, id, name, genderText, year] = m;
      out.push({
        id: `saa-${id}`,
        name: decode(name),
        type: t === '1' ? 'dog' : 'cat',
        orgId: 'saa',
        url: `https://www.saa.org.hk/zh/ad_detail.php?id=${id}&t=${t}`,
        img: `https://www.saa.org.hk${img}`,
        gender: /女/.test(genderText) ? 'female' : /男/.test(genderText) ? 'male' : undefined,
        birthYear: year ? +year : undefined,
        emoji: t === '1' ? '🐶' : '🐱',
        hue: hue(decode(name)),
      });
    }
    return out;
  };

  const [dogHtml, catHtml] = await Promise.all([
    fetchText('https://www.saa.org.hk/zh/adopt.php?t=1'),
    fetchText('https://www.saa.org.hk/zh/adopt.php?t=2'),
  ]);
  const animals = [
    ...parseCards(dogHtml, '1'),
    ...parseCards(catHtml, '2'),
  ];
  // de-dup (same animal can appear in multiple filter views)
  const seen = new Set();
  const unique = animals.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
  if (unique.length < 10) {
    throw new Error(`SAA: only ${unique.length} animals parsed — page structure changed?`);
  }

  return mapChunk(unique, async (a) => {
    const listing = {
      id: a.id,
      name: a.name,
      type: a.type,
      orgId: 'saa',
      url: a.url,
      img: a.img,
      ...(a.gender ? { gender: a.gender } : {}),
      emoji: a.emoji,
      hue: a.hue,
    };
    if (a.birthYear) {
      const months = monthsSince(new Date(Date.UTC(a.birthYear, 6, 1)));
      if (months > 0) listing.ageMonths = months;
    }
    try {
      const page = await fetchText(a.url);
      const text = page
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
      // Drop animals that are no longer visitable
      if (/已被領養|離世/.test(text)) return null;
      const code = text.match(/\(([A-Z]-\d{3,6})\)/);
      if (code) listing.note = { zh: `編號 ${code[1]}`, en: `No. ${code[1]}` };
    } catch (err) {
      console.warn(`  ⚠️  SAA ${a.name}: detail fetch failed (${err.message})`);
    }
    return listing;
  }, 6).then((ls) => ls.filter(Boolean));
}

// ── 6. HK Paws Foundation 香港動物基金 (Webflow CMS, fully structured) ──
async function scrapeHKPaws() {
  const parseListing = (html, kind) => {
    const out = [];
    const blocks = html.split('<div role="listitem" class="w-dyn-item">');
    for (const b of blocks.slice(1)) {
      const href = b.match(/href="\/(dog-collection|cat-collections)\/([a-z0-9-]+)"/);
      const img = b.match(/src="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+)"/);
      const name = b.match(/class="animal-name">([^<]+)</);
      if (!href || !img || !name) continue;
      out.push({
        slug: href[2],
        kind,
        name: decode(name[1]),
        img: img[1],
        breed: (b.match(/class="animal-brief-info">([^<]+)</) || [])[1],
      });
    }
    return out;
  };

  const [dogHtml, catHtml] = await Promise.all([
    fetchText('https://www.hkpaws.org/meet-the-dogs'),
    fetchText('https://www.hkpaws.org/meet-the-cats'),
  ]);
  const animals = [...parseListing(dogHtml, 'dog'), ...parseListing(catHtml, 'cat')];
  if (animals.length < 5) {
    throw new Error(`HKPaws: only ${animals.length} animals parsed — page structure changed?`);
  }

  return mapChunk(animals, async (a) => {
    const listing = {
      id: `hkpaws-${a.slug}`,
      name: a.name,
      type: a.kind,
      orgId: 'hkpaws',
      url: `https://www.hkpaws.org/${a.kind === 'dog' ? 'dog-collection' : 'cat-collections'}/${a.slug}`,
      img: a.img,
      ...(a.breed ? { breed: decode(a.breed) } : {}),
      emoji: a.kind === 'dog' ? '🐶' : '🐱',
      hue: hue(a.name),
    };
    try {
      const page = await fetchText(listing.url);
      const text = page
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<[^>]+>/g, ' | ')
        .replace(/(\s*\|\s*)+/g, ' | ');
      const pick = (label) => {
        const mm = text.match(new RegExp(`${label} \\| ([^|]+)`));
        return mm ? decode(mm[1]) : undefined;
      };
      const breed = pick('Breed');
      if (breed) listing.breed = breed;
      const gender = pick('Gender');
      if (gender) listing.gender = /^f/i.test(gender) ? 'female' : /^m/i.test(gender) ? 'male' : undefined;
      const dob = pick('Date of Birth');
      if (dob) {
        const ym = dob.match(/([A-Za-z]+)?\s*(\d{4})/);
        if (ym) {
          const mi = ym[1]
            ? ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
                .indexOf(ym[1].slice(0, 3).toLowerCase())
            : 6;
          const months = monthsSince(new Date(Date.UTC(+ym[2], mi >= 0 ? mi : 6, 1)));
          if (months > 0) listing.ageMonths = months;
        }
      }
      const neutered = /Neutered\? \| Yes/i.test(text);
      const vaccinated = /Vaccinated\? \| Yes/i.test(text);
      const remarks = pick('Remarks');
      const zhBits = [neutered && '已絕育', vaccinated && '已接種疫苗'].filter(Boolean);
      const enBits = [neutered && 'Neutered', vaccinated && 'Vaccinated', remarks].filter(Boolean);
      if (zhBits.length || enBits.length) {
        listing.note = { zh: zhBits.join(' · ') || remarks || '', en: enBits.join(' · ') };
      }
    } catch (err) {
      console.warn(`  ⚠️  HKPaws ${a.name}: detail fetch failed (${err.message})`);
    }
    return listing;
  }, 6);
}

// ── 7. 浪浪之家 Home for Homeless Dog (Wix CMS collection embedded in /adopt) ──
// Records are uuid-keyed objects with name/nameEn, hfhdId (Dog-00039), ageZh,
// gender/genderZh, title (Available|Adopted), wix:image URI.
function extractWixRecords(html) {
  const out = [];
  const re = /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})":\{"name":"/g;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index + m[0].indexOf('{'); // record's opening '{' (uuid has no braces)
    let depth = 0, inStr = false, esc = false, i = start;
    for (; i < html.length; i++) {
      const c = html[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
      } else if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) break; }
    }
    out.push(html.slice(start, i + 1));
  }
  return out;
}

const jstr = (obj, key) => {
  const mm = obj.match(new RegExp(`"${key}":"((?:[^"\\\\]|\\\\.)*)"`));
  return mm ? JSON.parse(`"${mm[1]}"`) : undefined;
};

async function scrapeHFHD() {
  const html = await fetchText('https://www.hfhd.org/adopt');
  const records = extractWixRecords(html);
  const listings = [];
  for (const rec of records) {
    const status = jstr(rec, 'title');
    if (status && status !== 'Available') continue; // drop Adopted
    const hfhdId = jstr(rec, 'hfhdId');
    const species = hfhdId?.startsWith('Cat') ? 'cat' : hfhdId?.startsWith('Dog') ? 'dog' : undefined;
    if (!species) continue;
    const nameZh = jstr(rec, 'name')?.trim();
    if (!nameZh) continue;
    // "image":"wix:image:\/\/v1\<id>\<file>#originWidth=..." (JSON-escaped slashes)
    const imgRaw = rec.match(/"image":"([^"]+)"/)?.[1] ?? '';
    const imgId = imgRaw.split('\\/').find((s) => /^[0-9a-f]{6,10}_/.test(s));
    const ageZh = jstr(rec, 'ageZh');
    const genderZh = jstr(rec, 'genderZh');
    const postLink = jstr(rec, 'postLink');
    const ageMonths = ageZh ? parseAgeMonths(ageZh) : undefined;
    listings.push({
      id: `hfhd-${species}-${(hfhdId || nameZh).replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
      name: nameZh,
      type: species,
      orgId: 'hfhd',
      url: postLink || 'https://www.hfhd.org/adoptionform',
      ...(imgId ? { img: `https://static.wixstatic.com/media/${imgId}` } : {}),
      ...(ageMonths && ageMonths > 0 ? { ageMonths } : {}),
      ...(genderZh === '女' ? { gender: 'female' } : genderZh === '男' ? { gender: 'male' } : {}),
      note: hfhdId ? { zh: `編號 ${hfhdId}`, en: `Ref. ${hfhdId}` } : undefined,
      emoji: species === 'dog' ? '🐶' : '🐱',
      hue: hue(nameZh),
    });
  }
  if (listings.length < 5) {
    throw new Error(`HFHD: only ${listings.length} animals parsed — page structure changed?`);
  }
  return listings;
}

// ── 8. 毛守救援 PGRS (WordPress pet-listing plugin, server-rendered cards) ──
async function scrapePGRS() {
  const html = await fetchText('https://www.pgrs.life/%e5%be%85%e9%a0%98%e9%a4%8a%e5%af%b5%e7%89%a9/');
  const out = [];
  const blocks = html.split('class="pet-item-card-link"');
  for (const b of blocks.slice(1)) {
    const id = (b.match(/pet_id=([a-f0-9]+)/) || [])[1];
    const name = (b.match(/class="pet-name">([^<]+)</) || [])[1];
    if (!id || !name) continue;
    const info = [...b.matchAll(/class="pet-info-item">([^<]+)</g)].map((m) => decode(m[1]));
    const get = (label) => {
      const row = info.find((x) => x.startsWith(label));
      return row ? decode(row.slice(label.length + 1).trim()) : '';
    };
    if (get('狀態') !== '待領養') continue; // drop adopted
    const species = get('種類').toLowerCase();
    if (species !== 'dog' && species !== 'cat') continue;
    const gender = get('性別');
    const age = get('年齡');
    const breed = get('品種');
    const img = (b.match(/class="pet-image"[^>]*src="([^"]+)"/) || [])[1];
    const months = age ? parseAgeMonths(age.replace(/\s+/g, '')) : undefined;
    out.push({
      id: `pgrs-${id}`,
      name: decode(name),
      type: species,
      orgId: 'pgrs',
      url: `https://www.pgrs.life/pet-info/?pet_id=${id}`,
      ...(img ? { img: decode(img) } : {}),
      ...(gender === '男' ? { gender: 'male' } : gender === '女' ? { gender: 'female' } : {}),
      ...(breed ? { breed } : {}),
      ...(months && months > 0 ? { ageMonths: months } : {}),
      emoji: species === 'dog' ? '🐶' : '🐱',
      hue: hue(decode(name)),
    });
  }
  if (out.length < 10) {
    throw new Error(`PGRS: only ${out.length} animals parsed — page structure changed?`);
  }
  return out;
}

// Sources (scraped lightly, linking back + crediting them):
//   1. HKDR  — https://hongkongdogrescue.com/dogs/ (+ per-dog profile pages)
//   2. LAP   — https://www.lap.org.hk/adoptcat.aspx + adoptdog.aspx
//   3. HKAAC — https://www.hk-aac.org.hk (separate dog/cat categories)
//   4. SPCA  — https://www.spca.org.hk/zh-hant/adoption/animals-for-adoption/
//              (server-rendered grid: sel_specie=5 dogs, =3 cats, paged)
//   5. SAA   — https://www.saa.org.hk/zh/adopt.php (t=1 dogs, t=2 cats)
//   6. HKPaws — https://www.hkpaws.org/meet-the-dogs + meet-the-cats (Webflow CMS)
//   7. HFHD  — https://www.hfhd.org/adopt (Wix CMS collection; Available only)
// If any source fails, the script exits WITHOUT writing, preserving the last
// good snapshot. Safe to run daily (cron / launchd / GitHub Actions).

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) HKAdoptHub/0.1 (+https://adopt.hk)';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0?39;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();

const escTS = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const hue = (name) => [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const slugify = (name, i) => {
  const s = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${s || 'pet'}-${i}`;
};

/** Fetches in small chunks so we stay polite to the orgs' servers. */
async function mapChunk(items, fn, size = 6) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

/** Parses age text into exact months. Handles "4 Year 8 Month", "DOB March 2022",
 *  "DOB 2022-12-20", "2 years", "3 months", "8 Week", 「2歲3個月」 etc. */
function parseAgeMonths(text, now = new Date()) {
  if (!text) return undefined;
  const t = text.replace(/&nbsp;/gi, ' ').trim();
  const iso = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return monthsSince(new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3])), now);
  const dob = t.match(/DOB\s*:?\s*([A-Za-z]+)\s+(\d{4})/i);
  if (dob) {
    const mi = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      .indexOf(dob[1].slice(0, 3).toLowerCase());
    if (mi >= 0) return monthsSince(new Date(Date.UTC(+dob[2], mi, 1)), now);
  }
  const y = t.match(/(\d{1,2})\s*(?:year|yr|歲)/i);
  const mo = t.match(/(\d{1,2})\s*(?:month|mon|個月|个月)/i);
  if (y || mo) return (y ? +y[1] * 12 : 0) + (mo ? +mo[1] : 0);
  const w = t.match(/(\d{1,2})\s*week/i);
  if (w) return Math.max(1, Math.round(+w[1] / 4.34));
  return undefined;
}

function monthsSince(date, now = new Date()) {
  return Math.max(0, Math.round((now.getTime() - date.getTime()) / (30.44 * 24 * 3600 * 1000)));
}

// ── 1. HKDR dogs ──────────────────────────────────────────────
async function scrapeHKDR() {
  const html = await fetchText('https://hongkongdogrescue.com/dogs/');
  const re =
    /href="https:\/\/hongkongdogrescue\.com\/dogs\/([a-z0-9-]+)\/"[^>]*title="([^"]+)"><img[^>]+src="(https:\/\/hongkongdogrescue\.com\/wp-content\/uploads\/[^"]+)"/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(html))) {
    const [, slug, title, img] = m;
    if (!seen.has(slug)) seen.set(slug, { slug, name: decode(title), img });
  }

  // Each dog's profile page carries the metadata: Breed / M/F / Size / Centre / Age
  const dogs = await mapChunk([...seen.values()], async (d) => {
    const listing = {
      id: `hkdr-${d.slug}`,
      name: d.name,
      type: 'dog',
      orgId: 'hkdr',
      url: `https://hongkongdogrescue.com/dogs/${d.slug}/`,
      img: d.img,
      emoji: '🐶',
      hue: hue(d.name),
    };
    try {
      const page = await fetchText(listing.url);
      const pick = (label) => {
        const mm = page.match(new RegExp(`<strong>${label}<\\/strong>\\s*:\\s*([^<]+)<`));
        return mm ? decode(mm[1]) : undefined;
      };
      const breed = pick('Breed');
      if (breed) listing.breed = breed;
      const mf = pick('M/F');
      if (mf) listing.gender = /female/i.test(mf) ? 'female' : 'male';
      const size = pick('Size');
      if (size) {
        const s = size.toLowerCase();
        listing.size = s.startsWith('small') ? 'small' : s.startsWith('medium') ? 'medium' : s.startsWith('large') ? 'large' : undefined;
      }
      const centre = pick('Centre');
      if (centre) listing.note = { zh: `中心：${centre}`, en: `Centre: ${centre}` };
      const age = parseAgeMonths(pick('Age'));
      if (age !== undefined) listing.ageMonths = age;
    } catch (err) {
      console.warn(`  ⚠️  HKDR ${d.name}: profile fetch failed (${err.message}) — listing without metadata`);
    }
    return listing;
  });
  if (dogs.length < 5) throw new Error(`HKDR: only ${dogs.length} dogs parsed — page structure changed?`);
  return dogs;
}

// ── 2. LAP cats & dogs ────────────────────────────────────────
function parseLAP(html) {
  const out = [];
  const blocks = html.split("<img src='./pic/");
  for (const b of blocks.slice(1)) {
    const m = b.match(/^([^']+)_h\.jpg'\s+alt='([^']*)'/);
    if (!m) continue;
    const [, img, alt] = m;
    const nameM = b.match(/Name:\s*<\/td>\s*<td[^>]*>\s*(?:<span[^>]*>)?([^<]+)/);
    const breedM = b.match(/Breed:\s*<\/td>\s*<td[^>]*>\s*(?:<span[^>]*>)?([^<]+)/);
    const ageM = b.match(/Age:\s*<\/td>\s*<td[^>]*>\s*(?:<span[^>]*>)?([^<]+)/);
    const name = decode(nameM ? nameM[1] : alt);
    if (!name) continue;
    const ageMonths = parseAgeMonths(ageM ? decode(ageM[1]) : undefined);
    out.push({
      name,
      img: `https://www.lap.org.hk/pic/${img}_h.jpg`,
      breed: breedM ? decode(breedM[1]) : '',
      sex: b.includes('>Female<') ? 'female' : b.includes('>Male<') ? 'male' : '',
      ageMonths,
    });
  }
  return out;
}

async function scrapeLAP() {
  const [catHtml, dogHtml] = await Promise.all([
    fetchText('https://www.lap.org.hk/adoptcat.aspx'),
    fetchText('https://www.lap.org.hk/adoptdog.aspx'),
  ]);
  const toListing = (a, kind, i) => ({
    id: `lap-${kind}-${slugify(a.name, i)}`,
    name: a.name,
    type: kind,
    orgId: 'lap',
    url:
      kind === 'cat'
        ? 'https://www.lap.org.hk/adoptcat.aspx'
        : 'https://www.lap.org.hk/adoptdog.aspx',
    img: a.img,
    ...(a.sex ? { gender: a.sex } : {}),
    ...(a.breed ? { breed: a.breed } : {}),
    // cats are always "small"; LAP dogs don't publish a size on the listing page
    ...(kind === 'cat' ? { size: 'small' } : {}),
    ...(a.ageMonths !== undefined ? { ageMonths: a.ageMonths } : {}),
    emoji: kind === 'cat' ? '🐈' : '🐕',
    hue: hue(a.name),
  });
  // LAP cross-lists the odd small animal (e.g. a rabbit) in cats/dogs — drop non-cat/dog
  const notRabbit = (l) => (l.breed ?? '').toLowerCase() !== 'rabbit';
  return {
    cats: parseLAP(catHtml).map((a, i) => toListing(a, 'cat', i)).filter(notRabbit),
    dogs: parseLAP(dogHtml).map((a, i) => toListing(a, 'dog', i)).filter(notRabbit),
  };
}

// ── 3. HKAAC (separate dog/cat categories → exact species) ────
function parseHKAACCategory(html, type) {
  const re =
    /<a href="([^"]+product_id=(\d+)[^"]*)">\s*<img\s+src="(https:\/\/www\.hk-aac\.org\.hk\/image\/cache\/data\/[^"]+)"\s+title="([^"]*)"/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(html))) {
    const [, href, pid, img, title] = m;
    if (!seen.has(pid)) {
      seen.set(pid, {
        id: `hkaac-${pid}`,
        name: decode(title),
        type,
        orgId: 'hkaac',
        url: href.replace(/&amp;/g, '&').replace(/^http:\/\//, 'https://'),
        img: img.replace(/ /g, '%20'),
        emoji: type === 'cat' ? '🐈' : '🐕',
        hue: hue(decode(title)),
      });
    }
  }
  return [...seen.values()];
}

/** Attribute table (rendered inside an HTML comment) carries 品種/性別;
 *  the description often carries the age. */
async function enrichHKAAC(listing) {
  try {
    const page = await fetchText(listing.url);
    const attr = (label) => {
      const mm = page.match(new RegExp(`${label}\\s*</td>\\s*<td>\\s*([^<]*?)\\s*</td>`));
      return mm ? decode(mm[1]) : undefined;
    };
    const breed = attr('品種');
    if (breed) listing.breed = breed;
    const sex = attr('性別');
    if (sex) listing.gender = /女|female|f$/i.test(sex) ? 'female' : /男|male|m$/i.test(sex) ? 'male' : undefined;
    const text = page
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .slice(0, 12000);
    const age = parseAgeMonths(text);
    if (age !== undefined) listing.ageMonths = age;
    if (listing.type === 'cat') listing.size = 'small';
  } catch (err) {
    console.warn(`  ⚠️  HKAAC ${listing.name}: detail fetch failed (${err.message})`);
  }
  return listing;
}

async function scrapeHKAAC() {
  const [dogHtml, catHtml] = await Promise.all([
    fetchText('https://www.hk-aac.org.hk/index.php?route=product/category&path=84'),
    fetchText('https://www.hk-aac.org.hk/index.php?route=product/category&path=85'),
  ]);
  const dogs = parseHKAACCategory(dogHtml, 'dog');
  const cats = parseHKAACCategory(catHtml, 'cat');
  if (dogs.length + cats.length < 3) {
    throw new Error(`HKAAC: only ${dogs.length + cats.length} animals parsed — page structure changed?`);
  }
  return mapChunk([...dogs, ...cats], enrichHKAAC, 6);
}

// ── 4. SPCA (server-rendered grid at /adoption/animals-for-adoption/) ──
const SPCA_CENTRES = [
  { zh: '香港領養中心特殊需要', en: 'Wan Chai (Special Needs)', keys: ['特殊需要'] },
  { zh: '香港總部', en: 'Wan Chai HQ', keys: ['香港總部', '灣仔'] },
  { zh: '九龍中心', en: 'Kowloon Centre', keys: ['九龍中心', '九龍'] },
  { zh: '西貢領養中心', en: 'Sai Kung Centre', keys: ['西貢領養中心', '西貢'] },
  { zh: '青衣中心', en: 'Tsing Yi Centre', keys: ['青衣中心', '青衣'] },
];

async function scrapeSPCA() {
  const base = 'https://www.spca.org.hk/zh-hant/adoption/animals-for-adoption/';
  const parseCards = (html) => {
    const out = [];
    const re =
      /<a href="(https:\/\/www\.spca\.org\.hk\/[^"]*animals-for-adoption-details\?code=(\d+))">\s*<div class="square-container image-square" style="background[^"]*url\(([^)]+)\)"><\/div>\s*([^<]+?)\s*<\/a>\s*<div>([^<]*)<\/div>\s*<div>([^<]*)<\/div>/g;
    let m;
    while ((m = re.exec(html))) {
      out.push({ url: m[1], code: m[2], img: m[3], name: decode(m[4]), breed: decode(m[5]), sexLine: decode(m[6]) });
    }
    return out;
  };

  const animals = [];
  for (const [specie, type] of [[5, 'dog'], [3, 'cat']]) {
    for (let p = 1; p <= 12; p++) {
      const html = await fetchText(`${base}?sel_specie=${specie}&paged=${p}`);
      const cards = parseCards(html);
      if (!cards.length) break;
      for (const c of cards) {
        if (!animals.some((a) => a.code === c.code)) animals.push({ ...c, type });
      }
      if (cards.length < 12) break;
    }
  }
  if (animals.length < 10) throw new Error(`SPCA: only ${animals.length} animals parsed — page structure changed?`);

  return mapChunk(animals, async (a) => {
    const listing = {
      id: `spca-${a.code}`,
      name: a.name,
      type: a.type,
      orgId: 'spca',
      url: a.url,
      img: a.img.replace(/ /g, '%20'),
      ...(a.breed ? { breed: a.breed } : {}),
      emoji: a.type === 'cat' ? '🐈' : '🐕',
      hue: hue(a.name),
    };
    const gm = a.sexLine.match(/([雄雌男女])性/);
    if (gm) listing.gender = /雌|女/.test(gm[1]) ? 'female' : 'male';
    const age = parseAgeMonths(a.sexLine);
    if (age !== undefined) listing.ageMonths = age;
    const desexed = /已絕育/.test(a.sexLine);
    // Centre is named inside the detail page's description text (性格… share row);
    // scoping avoids false hits from the site menu/footer which list all centres.
    try {
      const page = await fetchText(a.url);
      // Description + "來自 <centre>" field sit right before the share row.
      // Slicing a window on the RAW html avoids menu/footer false hits.
      const dj = page.indexOf('sharer.php');
      const desc =
        dj > 0 ? page.slice(Math.max(0, dj - 2500), dj).replace(/<[^>]+>/g, ' ') : '';
      const hit = SPCA_CENTRES.find((c) => c.keys.some((k) => desc.includes(k)));
      const centreZh = hit ? hit.zh : undefined;
      const centreEn = hit ? hit.en : undefined;
      const zhBits = [centreZh, desexed ? '已絕育' : undefined].filter(Boolean);
      const enBits = [centreEn, desexed ? 'Desexed' : undefined].filter(Boolean);
      if (zhBits.length) listing.note = { zh: zhBits.join(' · '), en: enBits.join(' · ') };
    } catch (err) {
      console.warn(`  ⚠️  SPCA ${a.name}: detail fetch failed (${err.message})`);
    }
    return listing;
  }, 6);
}

// ── Emit listings.ts ──────────────────────────────────────────
function emit({ hkdr, lapDogs, lapCats, hkaac, spca, saa, hkpaws, hfhd, pgrs }) {
  const L = (l) => {
    const parts = [
      `    id: '${escTS(l.id)}',`,
      `    name: '${escTS(l.name)}',`,
      `    type: '${l.type}',`,
      `    orgId: '${l.orgId}',`,
      `    url: '${escTS(l.url)}',`,
    ];
    if (l.img) parts.push(`    img: '${escTS(l.img)}',`);
    if (l.gender) parts.push(`    gender: '${l.gender}',`);
    if (l.breed) parts.push(`    breed: '${escTS(l.breed)}',`);
    if (l.size) parts.push(`    size: '${l.size}',`);
    if (l.ageMonths !== undefined) parts.push(`    ageMonths: ${l.ageMonths},`);
    if (l.note) parts.push(`    note: { zh: '${escTS(l.note.zh)}', en: '${escTS(l.note.en)}' },`);
    parts.push(`    emoji: '${l.emoji}', hue: ${l.hue},`);
    return '  {\n' + parts.join('\n') + '\n  },';
  };

  const snapshot = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });

  const header = `import type { Listing } from '../types';

/**
 * Real adoption cases aggregated from organisations' public websites.
 * Snapshot date: ${snapshot}. Auto-generated by \`pnpm refresh\` — do not edit by hand.
 * Each entry links straight back to the org's own page, where the live
 * status, full story and application form live. Photos are hotlinked from
 * the organisations' own servers; all photo rights remain with them
 * (© HKDR / © LAP / © HKAAC / © SPCA / © SAA). Availability changes daily — always confirm
 * on the org site before applying.
 */
export const SNAPSHOT = '${snapshot}';
`;

  const section = (title, name, arr) =>
    `\n// ── ${title} ──\nexport const ${name}: Listing[] = [\n${arr.map(L).join('\n')}\n];\n`;

  const body =
    header +
    section('HKDR dogs — hongkongdogrescue.com/dogs/', 'HKDR_DOGS', hkdr) +
    section('LAP dogs — lap.org.hk/adoptdog.aspx', 'LAP_DOGS', lapDogs) +
    section('LAP cats — lap.org.hk/adoptcat.aspx', 'LAP_CATS', lapCats) +
    section('HKAAC cats & dogs — hk-aac.org.hk 貓狗領養', 'HKAAC_ANIMALS', hkaac) +
    section('SPCA cats & dogs — spca.org.hk animals-for-adoption', 'SPCA_ANIMALS', spca) +
    section('SAA cats & dogs — saa.org.hk 動物領養計劃', 'SAA_ANIMALS', saa) +
    section('HK Paws Foundation — hkpaws.org 香港動物基金', 'HKPAWS_ANIMALS', hkpaws) +
    section('浪浪之家 Home for Homeless Dog — hfhd.org', 'HFHD_ANIMALS', hfhd) +
    section('毛守救援 PGRS — pgrs.life 待領養寵物', 'PGRS_ANIMALS', pgrs) +
    `
// 社區送養 — hand-moderated individual listings (src/data/community.ts)
import { COMMUNITY_ANIMALS } from './community';

export const LISTINGS: Listing[] = [
  ...HKDR_DOGS,
  ...LAP_DOGS,
  ...LAP_CATS,
  ...HKAAC_ANIMALS,
  ...SPCA_ANIMALS,
  ...SAA_ANIMALS,
  ...HKPAWS_ANIMALS,
  ...HFHD_ANIMALS,
  ...COMMUNITY_ANIMALS,
];

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}
`;
  return body;
}

// ── Main ──────────────────────────────────────────────────────
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'listings.ts');

try {
  console.log('🔄 Refreshing adoption data…');
  const hkdr = await scrapeHKDR();
  console.log(`  ✅ HKDR: ${hkdr.length} dogs`);
  const lap = await scrapeLAP();
  console.log(`  ✅ LAP: ${lap.dogs.length} dogs, ${lap.cats.length} cats`);
  const hkaac = await scrapeHKAAC();
  console.log(`  ✅ HKAAC: ${hkaac.length} animals`);
  const spca = await scrapeSPCA();
  console.log(`  ✅ SPCA: ${spca.length} animals`);
  const saa = await scrapeSAA();
  console.log(`  ✅ SAA: ${saa.length} animals`);
  const hkpaws = await scrapeHKPaws();
  console.log(`  ✅ HKPaws: ${hkpaws.length} animals`);
  const hfhd = await scrapeHFHD();
  console.log(`  ✅ HFHD: ${hfhd.length} animals`);
  const pgrs = await scrapePGRS();
  console.log(`  ✅ PGRS: ${pgrs.length} animals`);
  writeFileSync(
    outPath,
    emit({ hkdr, lapDogs: lap.dogs, lapCats: lap.cats, hkaac, spca, saa, hkpaws, hfhd, pgrs }),
  );
  const total =
    hkdr.length +
    lap.dogs.length +
    lap.cats.length +
    hkaac.length +
    spca.length +
    saa.length +
    hkpaws.length +
    hfhd.length +
    pgrs.length;
  console.log(`✅ Wrote ${total} listings → ${outPath}`);
} catch (err) {
  console.error(`❌ Refresh failed: ${err.message}`);
  console.error('Last good snapshot preserved — nothing was written.');
  process.exit(1);
}
