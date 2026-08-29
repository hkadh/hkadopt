import { BiName } from '../components/Bits';
import { useLang } from '../i18n';
import { ORGS, CHANNELS } from '../data/orgs';
import { LISTINGS } from '../data/listings';
import { districtName } from '../util';

export function OrgsPage() {
  const { t, L, lang } = useLang();
  return (
    <main className="container section">
      <h1 className="page-title">{t('orgs.title')}</h1>
      <p className="page-sub">{t('orgs.sub')}</p>
      <p className="notice">✅ {t('orgs.sourceNote')}</p>

      <div className="org-grid">
        {ORGS.map((o) => (
          <div key={o.id} className="card org-tile">
            <div className="org-tile-head">
              <div className="org-logo" aria-hidden="true">
                {o.id === 'afcd' ? '🏛️' : o.dogsUrl && o.catsUrl && o.dogsUrl !== o.catsUrl ? '🏠' : '🐾'}
              </div>
              <h3><BiName name={o.name} /></h3>
            </div>
            <p className="org-desc">{L(o.desc)}</p>
            {LISTINGS.some((l) => l.orgId === o.id) && (
              <p className="org-areas org-count">
                {t('orgs.listedCount', { n: LISTINGS.filter((l) => l.orgId === o.id).length })}
              </p>
            )}
            <p className="org-areas">
              <strong>{t('orgs.districts')}:</strong>{' '}
              {o.districts.length === 0
                ? t('orgs.allHK')
                : o.districts.map((d) => districtName(d, lang)).join('、')}
            </p>
            {o.visitNote && (
              <p className="org-areas">
                🕐 {L(o.visitNote)}
              </p>
            )}
            {(o.phone || o.email) && (
              <p className="org-areas">
                <strong>{t('orgs.contact')}:</strong>{' '}
                {o.phone && <>☎️ {o.phone} </>}
                {o.email && (
                  <a href={`mailto:${o.email}`} className="org-mail">
                    ✉️ {o.email}
                  </a>
                )}
              </p>
            )}
            <div className="org-links">
              {o.dogsUrl && o.dogsUrl !== o.catsUrl && (
                <a className="btn btn-primary btn-sm" href={o.dogsUrl} target="_blank" rel="noreferrer noopener">
                  {t('channels.goDogs')}
                </a>
              )}
              {o.catsUrl && o.dogsUrl !== o.catsUrl && (
                <a className="btn btn-primary btn-sm" href={o.catsUrl} target="_blank" rel="noreferrer noopener">
                  {t('channels.goCats')}
                </a>
              )}
              {o.applyUrl && (
                <a className="btn btn-ghost btn-sm" href={o.applyUrl} target="_blank" rel="noreferrer noopener">
                  {t('channels.applyForm')}
                </a>
              )}
              <a className="btn btn-ghost btn-sm" href={o.website} target="_blank" rel="noreferrer noopener">
                {t('orgs.visit')}
              </a>
            </div>
          </div>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">{t('orgs.moreTitle')}</h2>
        <p className="section-sub">{t('orgs.moreSub')}</p>
        <div className="channel-grid">
          {CHANNELS.map((c) => {
            const icon = c.kind === 'instagram' ? '📸' : '🌐';
            return (
              <a
                key={c.url}
                className="card channel-card"
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <strong>{icon} <BiName name={c.name} /></strong>
                <span className="channel-go">{t('orgs.visit')} ↗</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
