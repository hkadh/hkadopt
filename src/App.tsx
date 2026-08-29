import { useEffect, useState } from 'react';
import { Header, Footer } from './components/Chrome';
import { useStore } from './store';
import { HomePage } from './pages/Home';
import { BrowsePage } from './pages/Browse';
import { ProfilePage } from './pages/Profile';
import { ApplicationsPage } from './pages/Applications';
import { OrgsPage } from './pages/Orgs';
import { SettingsPage } from './pages/Settings';
import { AboutPage } from './pages/About';
import { useLang } from './i18n';

function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  const raw = hash.replace(/^#/, '') || '/';
  const qIdx = raw.indexOf('?');
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = new URLSearchParams(qIdx === -1 ? '' : raw.slice(qIdx + 1));
  return { path, query };
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      {toast}
    </div>
  );
}

function NotFound() {
  const { t } = useLang();
  return (
    <main className="container section">
      <div className="empty-state">
        <div className="empty-emoji">🐾</div>
        <h3>404</h3>
        <a className="btn btn-primary" href="#/">
          {t('common.backHome')}
        </a>
      </div>
    </main>
  );
}

export function App() {
  const { path, query } = useRoute();

  let page: React.ReactNode;
  if (path === '/') page = <HomePage />;
  else if (path === '/browse') page = <BrowsePage query={query} key={query.toString()} />;
  else if (path === '/profile') page = <ProfilePage />;
  else if (path === '/applications') page = <ApplicationsPage />;
  else if (path === '/orgs') page = <OrgsPage />;
  else if (path === '/settings') page = <SettingsPage />;
  else if (path === '/about') page = <AboutPage />;
  else page = <NotFound />;

  return (
    <div className="app-shell">
      <Header path={path} />
      {page}
      <Footer />
      <Toast />
    </div>
  );
}
