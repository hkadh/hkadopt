import { BiName } from '../components/Bits';
import { useLang } from '../i18n';
import { useStore } from '../store';
import { getOrg } from '../data/orgs';
import { StatusBadge } from '../components/Bits';
import type { DictKey } from '../dict';

const TIMELINE = ['submitted', 'reviewing', 'interview', 'approved'] as const;

export function ApplicationsPage() {
  const { t, L, lang } = useLang();
  const { applications, advanceApplication, removeApplication } = useStore();

  if (applications.length === 0) {
    return (
      <main className="container section">
        <h1 className="page-title">{t('apps.title')}</h1>
        <p className="page-sub">{t('apps.sub')}</p>
        <div className="empty-state">
          <div className="empty-emoji">💌</div>
          <h3>{t('apps.none')}</h3>
          <p>{t('apps.noneHint')}</p>
          <a className="btn btn-primary" href="#/browse">
            {t('apps.noneCta')} →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container section narrow-wide">
      <h1 className="page-title">{t('apps.title')}</h1>
      <p className="page-sub">{t('apps.sub')}</p>
      <p className="demo-note">📌 {t('apps.manualNote')}</p>

      <div className="app-list">
        {applications.map((app) => {
          const org = getOrg(app.orgId);
          return (
            <div key={app.id} className="card app-card">
              <div className="app-pet">
                <div className="app-thumb" aria-hidden="true">
                  {app.title.slice(0, 1)}
                </div>
                <div>
                  <strong>{app.title}</strong>
                  <span className="app-org">
                    🏠 {org ? <BiName name={org.name} /> : app.orgId}
                  </span>
                </div>
              </div>

              <div className="app-status">
                <StatusBadge status={app.status} />
                <ol className="timeline">
                  {TIMELINE.map((s) => (
                    <li
                      key={s}
                      className={
                        app.history.some((h) => h.status === s)
                          ? 'done'
                          : s === 'reviewing' && app.status === 'submitted'
                            ? 'next'
                            : ''
                      }
                    >
                      {t(`status.${s}` as DictKey)}
                    </li>
                  ))}
                </ol>
                <span className="app-updated">
                  {t('apps.updatedAt')}:{' '}
                  {new Date(app.updatedAt).toLocaleString(lang === 'zh' ? 'zh-HK' : 'en-GB')}
                </span>
              </div>

              <div className="app-actions">
                <a className="btn btn-ghost btn-sm" href={app.url} target="_blank" rel="noreferrer noopener">
                  {t('apps.viewSource')}
                </a>
                {app.status !== 'approved' && app.status !== 'rejected' && (
                  <button className="btn btn-primary btn-sm" onClick={() => advanceApplication(app.id)}>
                    ⏩ {t('apps.advance')}
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm(t('apps.removeConfirm'))) removeApplication(app.id);
                  }}
                >
                  ✕ {t('apps.remove')}
                </button>
                <span className="app-updated">
                  {t('apps.submittedAt')}:{' '}
                  {new Date(app.submittedAt).toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-GB')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
