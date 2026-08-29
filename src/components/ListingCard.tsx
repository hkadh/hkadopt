import { useState } from 'react';
import { useLang } from '../i18n';
import type { Listing } from '../types';
import { getOrg } from '../data/orgs';
import { ageGroup, formatAge } from '../util';
import { useStore } from '../store';
import { PetAvatar } from './Bits';
import type { DictKey } from '../dict';

export function ListingCard({ listing }: { listing: Listing }) {
  const { t, L, lang } = useLang();
  const { favorites, toggleFavorite, applications, submitApplication, showToast } = useStore();
  const [imgFailed, setImgFailed] = useState(false);
  const faved = favorites.includes(listing.id);
  const org = getOrg(listing.orgId);
  const recorded = applications.some((a) => a.title === listing.name && a.orgId === listing.orgId);

  const record = () => {
    submitApplication(listing.name, listing.orgId, listing.url);
    showToast(`${t('listing.recorded')} ${org ? `· ${L(org.short)}` : ''}`);
  };

  const share = async () => {
    const shareUrl = listing.url;
    const shareTitle = `${listing.name}${org ? ` — ${L(org.short)}` : ''}`;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      }
      throw new Error('no web share');
    } catch {
      // share sheet dismissed or unavailable — copy instead
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        /* clipboard unavailable (e.g. insecure context) — nothing else to try */
      }
      showToast(t('listing.shareCopied'));
    }
  };

  const sexSym = listing.gender === 'female' ? '♀' : listing.gender === 'male' ? '♂' : '';

  return (
    <article className="pet-card">
      <a
        className="pet-card-link"
        href={listing.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={listing.name}
      />
      <button
        className={`fav-btn ${faved ? 'faved' : ''}`}
        onClick={() => toggleFavorite(listing.id)}
        aria-label={faved ? t('listing.faved') : t('listing.fav')}
        title={faved ? t('listing.faved') : t('listing.fav')}
      >
        {faved ? '❤️' : '🤍'}
      </button>

      {listing.img && !imgFailed ? (
        <div className="pet-photo" style={{ background: `hsl(${listing.hue} 60% 90%)` }}>
          <img
            src={listing.img}
            alt={`${listing.name} — ${org ? L(org.short) : ''} adoption photo`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
          {org && <span className="photo-credit">📷 {L(org.short)}</span>}
        </div>
      ) : (
        <PetAvatar emoji={listing.emoji} hue={listing.hue} />
      )}

      <div className="pet-card-body">
        <h3>
          {listing.name} {sexSym && <span className="sex-sym">{sexSym}</span>}
        </h3>
        <p className="pet-breed">
          {listing.type === 'dog' ? '🐶' : '🐱'}
          {listing.breed ? ` ${listing.breed}` : ''}
          {org ? ` · ${L(org.short)}` : ''}
        </p>
        {(listing.ageMonths !== undefined || listing.size) && (
          <div className="chip-row">
            {listing.ageMonths !== undefined && (
              <span
                className="chip"
                title={t(`pet.age.${ageGroup(listing.ageMonths)}` as DictKey)}
              >
                {formatAge(listing.ageMonths, lang)}
              </span>
            )}
            {listing.size && <span className="chip">{t(`pet.size.${listing.size}` as DictKey)}</span>}
          </div>
        )}
        {listing.note && <p className="pet-note">📍 {L(listing.note)}</p>}
      </div>
      <div className="listing-actions">
        <a
          className="btn btn-primary btn-sm btn-apply"
          href={listing.url}
          target="_blank"
          rel="noreferrer noopener"
          title={t('listing.apply')}
        >
          {(lang === 'zh' ? ['查看', '及', '申請'] : ['View', '&', 'apply']).map((w) => (
            <span key={w}>{w}</span>
          ))}
        </a>
        <button
          className="btn btn-ghost btn-sm"
          onClick={record}
          disabled={recorded}
          title={recorded ? t('listing.recorded') : t('listing.record')}
        >
          {recorded ? t('listing.recorded') : t('listing.record')}
        </button>
        <button
          className="btn btn-ghost btn-sm share-btn"
          onClick={share}
          title={t('listing.share')}
          aria-label={`${t('listing.share')} — ${listing.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {t('listing.share')}
        </button>
      </div>
    </article>
  );
}
