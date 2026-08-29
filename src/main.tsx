import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LangProvider } from './i18n';
import { StoreProvider } from './store';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </LangProvider>
  </StrictMode>,
);
