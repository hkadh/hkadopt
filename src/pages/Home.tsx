import { BiName } from '../components/Bits';
import { useLang } from '../i18n';
import { HKDR_DOGS, LAP_CATS, LAP_DOGS, LISTINGS, SNAPSHOT } from '../data/listings';
import { ORGS } from '../data/orgs';
import { ListingCard } from '../components/ListingCard';

export function HomePage() {
  const { t, L, lang } = useLang();
  const featured = [
    ...HKDR_DOGS.slice(0, 4),
    ...LAP_CATS.slice(0, 2),
    ...LAP_DOGS.slice(0, 2),
  ];
  const channels = ORGS.filter((o) => o.dogsUrl || o.catsUrl);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🐾 {t('hero.badge')}</span>
          <h1>
            {t('hero.title1')}
            <br />
            <em>{t('hero.title2')}</em>
          </h1>
          <p className="hero-sub">{t('hero.sub')}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary btn-lg" href="#/browse">
              🔍 {t('hero.ctaBrowse')}
            </a>
            <a className="btn btn-ghost btn-lg" href="#/orgs">
              🏠 {t('hero.ctaOrgs')}
            </a>
            <a className="btn btn-ghost btn-lg" href="#/profile">
              📋 {t('hero.ctaProfile')}
            </a>
          </div>
          <div className="hero-quick">
            <a href="#/browse?type=dog">🐶 {t('home.dogCta')}</a>
            <span>·</span>
            <a href="#/browse?type=cat">🐱 {t('home.catCta')}</a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{ORGS.length}</strong>
              <span>{t('hero.statOrgs')}</span>
            </div>
            <div>
              <strong>{LISTINGS.length}</strong>
              <span>{t('hero.statCases')}</span>
              <small>{t('hero.statCasesNote')}</small>
            </div>
            <div>
              <strong>~500 🐶</strong>
              <span>{t('hero.statHkdr')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">{t('how.title')}</h2>
        <p className="section-sub">{t('how.sub')}</p>
        <div className="steps">
          <div className="step-card">
            <div className="step-emoji">📋</div>
            <h3>{t('how.s1t')}</h3>
            <p>{t('how.s1d')}</p>
          </div>
          <div className="step-card">
            <div className="step-emoji">🧩</div>
            <h3>{t('how.s2t')}</h3>
            <p>{t('how.s2d')}</p>
          </div>
          <div className="step-card">
            <div className="step-emoji">🔗</div>
            <h3>{t('how.s3t')}</h3>
            <p>{t('how.s3d')}</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <h2 className="section-title">{t('home.featured')}</h2>
            <p className="section-sub">{t('home.featuredSub')}</p>
          </div>
          <a className="btn btn-ghost" href="#/browse">
            {t('home.viewAll')} →
          </a>
        </div>
        <div className="pet-grid">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        <p className="snapshot-note">🕐 {t('listing.snapshot')}</p>
      </section>

      <section className="container section">
        <h2 className="section-title">{t('home.channelsTitle')}</h2>
        <p className="section-sub">{t('home.channelsSub')}</p>
        <div className="channel-grid">
          {channels.map((o) => (
            <div key={o.id} className="card channel-card">
              <strong><BiName name={o.name} /></strong>
              <div className="channel-links">
                {o.dogsUrl && o.dogsUrl !== o.catsUrl && (
                  <a className="btn btn-ghost btn-sm" href={o.dogsUrl} target="_blank" rel="noreferrer noopener">
                    {t('channels.goDogs')}
                  </a>
                )}
                {o.catsUrl && o.dogsUrl !== o.catsUrl && (
                  <a className="btn btn-ghost btn-sm" href={o.catsUrl} target="_blank" rel="noreferrer noopener">
                    {t('channels.goCats')}
                  </a>
                )}
                {(o.dogsUrl === o.catsUrl || (!o.catsUrl && o.dogsUrl)) && (
                  <a className="btn btn-ghost btn-sm" href={(o.dogsUrl ?? o.catsUrl)!} target="_blank" rel="noreferrer noopener">
                    {t('channels.goAdoption')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="snapshot-note" style={{ marginTop: 10 }}>
          {lang === 'zh'
            ? `💡 香港估計有約二萬隻流浪狗等緊家。而家收錄咗 ${LISTINGS.length} 個真實個案（快照 ${SNAPSHOT}），仲有更多喺各機構專頁。`
            : `💡 An estimated ~20,000 stray dogs wait for homes in HK. ${LISTINGS.length} real cases are indexed here (snapshot ${SNAPSHOT}) — many more live on each org’s page.`}
        </p>
      </section>

      <section className="container section">
        <div className="org-cta">
          <h2>{t('home.orgCtaTitle')}</h2>
          <p>{t('home.orgCtaSub')}</p>
          <a className="btn btn-light" href="#/about">
            {t('nav.about')} →
          </a>
        </div>
      </section>
    </main>
  );
}
