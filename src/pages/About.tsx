import { BiName } from '../components/Bits';
import { useLang } from '../i18n';
import { ORGS } from '../data/orgs';
import { SNAPSHOT } from '../data/listings';

export function AboutPage() {
  const { t, L } = useLang();
  return (
    <main className="container section narrow">
      <h1 className="page-title">{t('about.title')}</h1>

      <section className="card">
        <h2>💡 {t('about.whyTitle')}</h2>
        <p className="story">{t('about.whyBody')}</p>
      </section>

      <div className="mission-grid">
        <div className="card mission-card">
          <div className="step-emoji">🧩</div>
          <h3>{t('about.m1t')}</h3>
          <p>{t('about.m1d')}</p>
        </div>
        <div className="card mission-card">
          <div className="step-emoji">👆</div>
          <h3>{t('about.m2t')}</h3>
          <p>{t('about.m2d')}</p>
        </div>
        <div className="card mission-card">
          <div className="step-emoji">🏠</div>
          <h3>{t('about.m3t')}</h3>
          <p>{t('about.m3d')}</p>
        </div>
      </div>

<section className="card">
        <h2>📮 {t('about.contactTitle')}</h2>
        <p>{t('about.contactBody')}</p>
      </section>

      <section className="card">
        <h2>🔗 {t('about.sourcesTitle')}</h2>
        <p>{t('about.sourcesSub', { date: SNAPSHOT })}</p>
        <ul className="source-list">
          {ORGS.map((o) => (
            <li key={o.id}>
              <a href={o.website} target="_blank" rel="noreferrer noopener">
                <BiName name={o.name} /> ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="disclaimer">{t('about.disclaimer')}</p>
      </section>
    </main>
  );
}
