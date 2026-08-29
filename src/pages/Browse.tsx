import { BiName } from '../components/Bits';
import { useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { LISTINGS, SNAPSHOT } from '../data/listings';
import { ORGS } from '../data/orgs';
import { AGE_GROUPS, ageGroup, normBreed, type AgeGroup } from '../util';
import { ListingCard } from '../components/ListingCard';
import { useStore } from '../store';
import type { Gender, PetType, Size } from '../types';
import type { DictKey } from '../dict';

type TypeFilter = 'all' | 'dog' | 'cat';
type SortKey = 'default' | 'ageAsc' | 'ageDesc' | 'name';
const PAGE_SIZE = 24;

export function BrowsePage({ query }: { query: URLSearchParams }) {
  const { t, L, lang } = useLang();
  const { favorites } = useStore();
  const [type, setType] = useState<TypeFilter>(() =>
    query.get('type') === 'dog' || query.get('type') === 'cat' ? (query.get('type') as PetType) : 'all',
  );
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('');
  const [gender, setGender] = useState<Gender | 'any'>('any');
  const [age, setAge] = useState<AgeGroup | 'any'>('any');
  const [size, setSize] = useState<Size | 'any'>('any');
  const [breed, setBreed] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = LISTINGS.filter((l) => {
      if (type !== 'all' && l.type !== type) return false;
      if (org && l.orgId !== org) return false;
      if (gender !== 'any' && l.gender !== gender) return false;
      if (age !== 'any' && (l.ageMonths === undefined || ageGroup(l.ageMonths) !== age)) return false;
      if (size !== 'any' && l.size !== size) return false;
      if (breed && normBreed(l.breed, l.type) !== breed) return false;
      if (favOnly && !favorites.includes(l.id)) return false;
      if (needle && !l.name.toLowerCase().includes(needle)) return false;
      return true;
    });
    const byAge = (l: (typeof filtered)[number]) => l.ageMonths ?? Number.MAX_SAFE_INTEGER;
    switch (sortBy) {
      case 'ageAsc':
        return [...filtered].sort((a, b) => byAge(a) - byAge(b));
      case 'ageDesc':
        return [...filtered].sort((a, b) => byAge(b) - byAge(a));
      case 'name':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name, lang === 'zh' ? 'zh-Hant' : 'en'));
      default:
        return filtered;
    }
  }, [type, q, org, gender, age, size, breed, favOnly, favorites, sortBy, lang]);

  // Breed dropdown options follow the current type so the list stays relevant
  const breedOptions = useMemo(() => {
    const set = new Set<string>();
    for (const l of LISTINGS) {
      if (type === 'all' || l.type === type) {
        const canon = normBreed(l.breed, l.type);
        if (canon) set.add(canon);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [type]);

  const shown = results.slice(0, visible);
  const hasFilters =
    type !== 'all' || q !== '' || org !== '' || gender !== 'any' || age !== 'any' || size !== 'any' || breed !== '' || favOnly;

  const clear = () => {
    setType('all');
    setQ('');
    setOrg('');
    setGender('any');
    setAge('any');
    setSize('any');
    setBreed('');
    setFavOnly(false);
    setVisible(PAGE_SIZE);
  };

  const resetVisible = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setVisible(PAGE_SIZE);
  };

  const typeBtn = (v: TypeFilter, label: string, emoji: string) => (
    <button
      className={`pill ${type === v ? 'active' : ''}`}
      onClick={() => resetVisible(setType)(v)}
      aria-pressed={type === v}
    >
      {emoji} {label}
    </button>
  );

  const select = (
    value: string,
    onChange: (v: string) => void,
    label: string,
    options: { value: string; label: string }[],
    anyLabel?: string,
  ) => (
    <select className="org-select" value={value} onChange={(e) => resetVisible(onChange)(e.target.value)} aria-label={label}>
      <option value="any">{anyLabel ?? `${label}: ${t('filters.any')}`}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <main className="container section">
      <h1 className="page-title">{t('browse.title')}</h1>
      <p className="page-sub">{t('browse.sub')}</p>

      <div className="type-pills">
        {typeBtn('all', t('browse.all'), '🐾')}
        {typeBtn('dog', t('browse.dogs'), '🐶')}
        {typeBtn('cat', t('browse.cats'), '🐱')}
        <input
          className="search-box"
          type="search"
          placeholder={t('browse.search')}
          value={q}
          onChange={(e) => resetVisible(setQ)(e.target.value)}
          aria-label={t('browse.search')}
        />
      </div>

      <div className="filter-row">
        {select(org, (v) => setOrg(v === 'any' ? '' : v), t('filters.org'), ORGS.filter((o) => LISTINGS.some((l) => l.orgId === o.id)).map((o) => ({
          value: o.id,
          // Chinese name + short-form English only
          label: o.name.zh.includes(o.short.en) ? o.name.zh : `${o.name.zh} ${o.short.en}`,
        })))}
        {select(gender, (v) => setGender(v as Gender | 'any'), t('filters.gender'), [
          { value: 'male', label: t('filters.male') },
          { value: 'female', label: t('filters.female') },
        ])}
        {select(age, (v) => setAge(v as AgeGroup | 'any'), t('filters.age'), AGE_GROUPS.map((g) => ({ value: g, label: t(`pet.age.${g}` as DictKey) })))}
        {select(size, (v) => setSize(v as Size | 'any'), t('filters.size'), (['small', 'medium', 'large'] as Size[]).map((s) => ({ value: s, label: t(`pet.size.${s}` as DictKey) })))}
        {select(breed, (v) => setBreed(v === 'any' ? '' : v), t('filters.breed'), breedOptions.map((b) => ({ value: b, label: b })))}
        {select(sortBy, (v) => setSortBy(v === 'any' ? 'default' : (v as SortKey)), t('filters.sort'), [
          { value: 'ageAsc', label: t('sort.ageAsc') },
          { value: 'ageDesc', label: t('sort.ageDesc') },
          { value: 'name', label: t('sort.name') },
        ], t('filters.sort'))}
        <button
          className={`pill ${favOnly ? 'active' : ''} fav-pill`}
          onClick={() => resetVisible(setFavOnly)(!favOnly)}
          aria-pressed={favOnly}
          title={t('filters.favOnly')}
        >
          ❤️ {t('filters.favOnly')}{favorites.length > 0 ? ` (${favorites.length})` : ''}
        </button>
        {hasFilters && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              clear();
            }}
          >
            ✕ {t('filters.clear')}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🐾</div>
          <h3>{t('results.none')}</h3>
          <p>{t('results.noneHint')}</p>
          <a className="btn btn-primary" href="#/orgs">
            {t('nav.orgs')} →
          </a>
        </div>
      ) : (
        <>
          <div className="results-bar">
            <strong>{t('results.count', { n: results.length })}</strong>
            <small className="muted">🕐 {t('listing.snapshot')}</small>
          </div>
          <div className="pet-grid">
            {shown.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {visible < results.length && (
            <div className="load-more">
              <button className="btn btn-ghost btn-lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                ⬇️ {t('listing.loadMore')} ({results.length - visible})
              </button>
            </div>
          )}
        </>
      )}

      <p className="snapshot-note">📷 {t('listing.photoNote')}</p>

      <section className="section">
        <h2 className="section-title">{t('home.channelsTitle')}</h2>
        <p className="section-sub">{t('home.channelsSub')}</p>
        <div className="channel-grid">
          {ORGS.map((o) => {
            const same = o.dogsUrl === o.catsUrl;
            return (
              <div key={o.id} className="card channel-card">
                <strong><BiName name={o.name} /></strong>
                <div className="channel-links">
                  {o.dogsUrl && !same && (
                    <a className="btn btn-ghost btn-sm" href={o.dogsUrl} target="_blank" rel="noreferrer noopener">
                      {t('channels.goDogs')}
                    </a>
                  )}
                  {o.catsUrl && !same && (
                    <a className="btn btn-ghost btn-sm" href={o.catsUrl} target="_blank" rel="noreferrer noopener">
                      {t('channels.goCats')}
                    </a>
                  )}
                  {same && o.dogsUrl && (
                    <a className="btn btn-ghost btn-sm" href={o.dogsUrl} target="_blank" rel="noreferrer noopener">
                      {t('channels.goAdoption')}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="snapshot-note" style={{ marginTop: 10 }}>
          {lang === 'zh' ? '🔗 全部連結直達機構官方網站。' : '🔗 All links go directly to the organisations’ official websites.'}
        </p>
      </section>
    </main>
  );
}
