import { useLang } from '../i18n';
import type { DictKey } from '../dict';

const NAV: { path: string; key: DictKey }[] = [
  { path: '/', key: 'nav.home' },
  { path: '/browse', key: 'nav.browse' },
  { path: '/orgs', key: 'nav.orgs' },
  { path: '/applications', key: 'nav.applications' },
  { path: '/about', key: 'nav.about' },
];

export function Header({ path }: { path: string }) {
  const { t, lang, setLang } = useLang();

  const isActive = (p: string) =>
    p === '/' ? path === '/' : path === p || path.startsWith(p + '/');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="#/">
          <img src="/paw.svg" alt="" width="34" height="34" />
          <span className="logo-text">
            <strong>{t('brand')}</strong>
            <small>{t('tagline')}</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.path} href={`#${n.path}`} className={isActive(n.path) ? 'active' : ''}>
              {t(n.key)}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a
            href="#/profile"
            className={`icon-link ${isActive('/profile') ? 'active' : ''}`}
            title={t('nav.profile')}
          >
            👤 <span>{t('nav.profile')}</span>
          </a>
          <a
            href="#/settings"
            className={`icon-link ${isActive('/settings') ? 'active' : ''}`}
            title={t('nav.settings')}
          >
            ⚙️ <span>{t('nav.settings')}</span>
          </a>
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              className={lang === 'zh' ? 'active' : ''}
              onClick={() => setLang('zh')}
              aria-pressed={lang === 'zh'}
            >
              繁
            </button>
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/paw.svg" alt="" width="28" height="28" />
            <strong>{t('brand')}</strong>
          </div>
          <p>{t('footer.blurb')}</p>
          <p className="footer-phase">🐾 {t('footer.phase2')}</p>
        </div>
        <div>
          <h4>{t('footer.links')}</h4>
          <a href="#/browse">{t('nav.browse')}</a>
          <a href="#/orgs">{t('nav.orgs')}</a>
          <a href="#/profile">{t('nav.profile')}</a>
          <a href="#/applications">{t('nav.applications')}</a>
          <a href="#/about">{t('nav.about')}</a>
          <a href="#/settings">{t('nav.settings')}</a>
        </div>
        <div>
          <h4>{t('about.contactTitle')}</h4>
          <p>{t('about.contactBody')}</p>
        </div>
      </div>
      <div className="container footer-rights">{t('footer.rights')}</div>
    </footer>
  );
}
