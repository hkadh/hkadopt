import { useLang } from '../i18n';
import { useStore } from '../store';
import type { Lang } from '../types';

export function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const { profile, applications, favorites, resetAll, showToast } = useStore();

  const onReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      resetAll();
      showToast(t('settings.resetDone'));
    }
  };

  return (
    <main className="container section narrow">
      <h1 className="page-title">{t('settings.title')}</h1>

      <section className="card form">
        <h2>🌐 {t('settings.lang')}</h2>
        <p className="field-hint">{t('settings.langHint')}</p>
        <div className="lang-cards">
          <button
            className={`lang-card ${lang === 'zh' ? 'active' : ''}`}
            onClick={() => setLang('zh' as Lang)}
            aria-pressed={lang === 'zh'}
          >
            <strong>繁體中文</strong>
            <span>香港 · 預設</span>
          </button>
          <button
            className={`lang-card ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en' as Lang)}
            aria-pressed={lang === 'en'}
          >
            <strong>English</strong>
            <span>Switch anytime</span>
          </button>
        </div>
      </section>

      <section className="card form">
        <h2>🗂️ {t('settings.data')}</h2>
        <p className="field-hint">{t('settings.dataHint')}</p>
        <ul className="data-summary">
          <li>📋 {t('nav.profile')}: {profile ? `✅ ${profile.name}` : '—'}</li>
          <li>💌 {t('nav.applications')}: {applications.length}</li>
          <li>❤️ {t('listing.fav')}: {favorites.length}</li>
        </ul>
        <button className="btn btn-danger" onClick={onReset}>
          🗑️ {t('settings.reset')}
        </button>
      </section>

      <section className="card form">
        <h2>ℹ️ {t('settings.note')}</h2>
        <p>{t('settings.noteBody')}</p>
      </section>
    </main>
  );
}
