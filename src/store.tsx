import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AdopterProfile, AppStatus, Application } from './types';
import { uid } from './util';

const PROFILE_KEY = 'adopthub.profile';
const APPS_KEY = 'adopthub.applications';
const FAVS_KEY = 'adopthub.favorites';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / unavailable — ignore in prototype
  }
}

export const STATUS_ORDER: AppStatus[] = ['submitted', 'reviewing', 'interview', 'approved'];

function nextStatus(s: AppStatus): AppStatus | null {
  const i = STATUS_ORDER.indexOf(s);
  if (i === -1 || i === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[i + 1];
}

interface StoreValue {
  profile: AdopterProfile | null;
  applications: Application[];
  favorites: string[];
  toast: string | null;
  showToast: (msg: string) => void;
  saveProfile: (p: AdopterProfile) => void;
  submitApplication: (title: string, orgId: string, url: string) => Application;
  advanceApplication: (id: string) => void;
  removeApplication: (id: string) => void;
  toggleFavorite: (petId: string) => void;
  resetAll: () => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdopterProfile | null>(() => load(PROFILE_KEY, null));
  const [applications, setApplications] = useState<Application[]>(() => load(APPS_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => load(FAVS_KEY, []));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const saveProfile = useCallback((p: AdopterProfile) => {
    setProfile(p);
    save(PROFILE_KEY, p);
  }, []);

  const submitApplication = useCallback(
    (title: string, orgId: string, url: string): Application => {
      const now = new Date().toISOString();
      const app: Application = {
        id: uid(),
        title,
        orgId,
        url,
        status: 'submitted',
        submittedAt: now,
        updatedAt: now,
        history: [{ status: 'submitted', at: now }],
      };
      setApplications((prev) => {
        const next = [app, ...prev];
        save(APPS_KEY, next);
        return next;
      });
      return app;
    },
    [],
  );

  const advanceApplication = useCallback((id: string) => {
    setApplications((prev) => {
      const next = prev.map((a) => {
        if (a.id !== id) return a;
        const ns = nextStatus(a.status);
        if (!ns) return a;
        const at = new Date().toISOString();
        return { ...a, status: ns, updatedAt: at, history: [...a.history, { status: ns, at }] };
      });
      save(APPS_KEY, next);
      return next;
    });
  }, []);

  const removeApplication = useCallback((id: string) => {
    setApplications((prev) => {
      const next = prev.filter((a) => a.id !== id);
      save(APPS_KEY, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((petId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(petId) ? prev.filter((x) => x !== petId) : [petId, ...prev];
      save(FAVS_KEY, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(APPS_KEY);
    localStorage.removeItem(FAVS_KEY);
    setProfile(null);
    setApplications([]);
    setFavorites([]);
  }, []);

  return (
    <StoreCtx.Provider
      value={{
        profile,
        applications,
        favorites,
        toast,
        showToast,
        saveProfile,
        submitApplication,
        advanceApplication,
        removeApplication,
        toggleFavorite,
        resetAll,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): StoreValue {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
