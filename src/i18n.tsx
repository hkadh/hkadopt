import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ZH, type DictKey } from './dict';
import { EN } from './dict-en';
import type { Lang } from './types';

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey, p?: Record<string, string | number>) => string;
  L: <T extends { zh: string; en: string }>(o: T) => string;
  /** The other language's string, or '' when identical/absent — for bilingual labels. */
  A: <T extends { zh: string; en: string }>(o: T) => string;
}

const LangCtx = createContext<LangCtxValue | null>(null);

const LANG_KEY = 'adopthub.lang';

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'en' ? 'en' : 'zh';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant-HK' : 'en';
    document.title =
      lang === 'zh'
        ? '領養一站通 | 香港寵物領養平台'
        : 'HK Adopt Hub | Hong Kong Pet Adoption Platform';
  }, [lang]);

  const t = (k: DictKey, p?: Record<string, string | number>): string => {
    let s: string = (lang === 'zh' ? ZH : EN)[k] ?? String(k);
    if (p) for (const [key, val] of Object.entries(p)) s = s.replaceAll(`{${key}}`, String(val));
    return s;
  };

  const L = <T extends { zh: string; en: string }>(o: T): string => (lang === 'zh' ? o.zh : o.en);

  const A = <T extends { zh: string; en: string }>(o: T): string => {
    const main = L(o);
    const other = lang === 'zh' ? o.en : o.zh;
    if (!other) return '';
    const a = other.toLowerCase();
    const b = main.toLowerCase();
    // skip when redundant (one already contains the other)
    return b.includes(a) || a.includes(b) ? '' : other;
  };

  return <LangCtx.Provider value={{ lang, setLang, t, L, A }}>{children}</LangCtx.Provider>;
}

export function useLang(): LangCtxValue {
  const v = useContext(LangCtx);
  if (!v) throw new Error('useLang must be used inside LangProvider');
  return v;
}
