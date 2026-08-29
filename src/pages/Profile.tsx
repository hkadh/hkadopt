import { useState } from 'react';
import { useLang } from '../i18n';
import { useStore } from '../store';
import type { AdopterProfile, Experience, Housing } from '../types';
import type { DictKey } from '../dict';

const HOUSING: Housing[] = ['private', 'hos', 'public', 'village', 'house'];
const HOUSING_KEY: Record<Housing, DictKey> = {
  private: 'housing.private',
  hos: 'housing.hos',
  public: 'housing.public',
  village: 'housing.village',
  house: 'housing.house',
};
const EXPERIENCE: Experience[] = ['none', 'some', 'expert'];
const EXP_KEY: Record<Experience, DictKey> = {
  none: 'exp.none',
  some: 'exp.some',
  expert: 'exp.expert',
};

interface Errors {
  name?: boolean;
  phone?: boolean;
  email?: boolean;
}

export function ProfilePage() {
  const { t, lang } = useLang();
  const { profile, saveProfile, showToast, applications } = useStore();
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<AdopterProfile>(
    () =>
      profile ?? {
        name: '',
        phone: '',
        email: '',
        housing: 'private',
        hasKids: false,
        hasPets: false,
        experience: 'none',
        dailyHours: 2,
        intro: '',
        createdAt: new Date().toISOString(),
      },
  );

  const set = <K extends keyof AdopterProfile>(k: K, v: AdopterProfile[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const isEdit = !!profile;

  const summary = (): string => {
    const yn = (b: boolean) => (lang === 'zh' ? (b ? '有' : '無') : b ? 'Yes' : 'No');
    if (lang === 'zh') {
      return [
        '【領養申請摘要】',
        `稱呼：${form.name}`,
        `聯絡電話：${form.phone}`,
        `電郵：${form.email}`,
        `住屋類型：${t(HOUSING_KEY[form.housing])}`,
        `家中有小朋友（12歲以下）：${yn(form.hasKids)}`,
        `家中現有寵物：${yn(form.hasPets)}`,
        `養寵物經驗：${t(EXP_KEY[form.experience])}`,
        `每日可陪伴時間：${form.dailyHours} 小時`,
        form.intro.trim() ? `自我介紹：${form.intro.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }
    return [
      '【Adoption Application Summary】',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      `Housing: ${t(HOUSING_KEY[form.housing])}`,
      `Children at home (under 12): ${yn(form.hasKids)}`,
      `Pets at home: ${yn(form.hasPets)}`,
      `Experience: ${t(EXP_KEY[form.experience])}`,
      `Daily time for the pet: ${form.dailyHours} hours`,
      form.intro.trim() ? `About me: ${form.intro.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const copySummary = async () => {
    const text = summary();
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('profile.copied'));
    } catch {
      // clipboard API unavailable (e.g. non-secure context) — fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(t('profile.copied'));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {
      name: !form.name.trim(),
      phone: !form.phone.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    };
    setErrors(errs);
    if (errs.name || errs.phone || errs.email) return;
    saveProfile({ ...form, name: form.name.trim(), createdAt: form.createdAt });
    showToast(isEdit ? t('profile.updated') : t('profile.saved'));
  };

  return (
    <main className="container section narrow">
      <h1 className="page-title">{t('profile.title')}</h1>
      <p className="page-sub">{t('profile.sub')}</p>
      {isEdit && (
        <div className="notice">
          ✅ {t('profile.haveOne')} <a href="#/applications">{t('profile.seeApps')} →</a>
        </div>
      )}

      <form className="card form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label className={`field ${errors.name ? 'has-error' : ''}`}>
            <span>{t('profile.name')} *</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('profile.namePh')}
            />
            {errors.name && <em>{t('profile.required')}</em>}
          </label>
          <label className={`field ${errors.phone ? 'has-error' : ''}`}>
            <span>{t('profile.phone')} *</span>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder={t('profile.phonePh')}
              inputMode="tel"
            />
            {errors.phone && <em>{t('profile.required')}</em>}
          </label>
        </div>

        <label className={`field ${errors.email ? 'has-error' : ''}`}>
          <span>{t('profile.email')} *</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
          />
          {errors.email && <em>{t('profile.badEmail')}</em>}
        </label>

        <label className="field">
          <span>{t('profile.housing')}</span>
          <select value={form.housing} onChange={(e) => set('housing', e.target.value as Housing)}>
            {HOUSING.map((h) => (
              <option key={h} value={h}>
                {t(HOUSING_KEY[h])}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label className="check-chip solo">
            <input
              type="checkbox"
              checked={form.hasKids}
              onChange={(e) => set('hasKids', e.target.checked)}
            />
            {t('profile.hasKids')}
          </label>
          <label className="check-chip solo">
            <input
              type="checkbox"
              checked={form.hasPets}
              onChange={(e) => set('hasPets', e.target.checked)}
            />
            {t('profile.hasPets')}
          </label>
        </div>

        <div className="field">
          <span>{t('profile.experience')}</span>
          <div className="radio-row">
            {EXPERIENCE.map((x) => (
              <label key={x} className="radio-chip">
                <input
                  type="radio"
                  name="experience"
                  checked={form.experience === x}
                  onChange={() => set('experience', x)}
                />
                {t(EXP_KEY[x])}
              </label>
            ))}
          </div>
        </div>

        <label className="field">
          <span>
            {t('profile.dailyHours')}: <strong>{form.dailyHours}</strong> {t('profile.hoursUnit')}
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={form.dailyHours}
            onChange={(e) => set('dailyHours', Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>{t('profile.intro')}</span>
          <textarea
            rows={4}
            value={form.intro}
            onChange={(e) => set('intro', e.target.value)}
            placeholder={t('profile.introPh')}
          />
        </label>

        <button className="btn btn-primary btn-lg" type="submit">
          {isEdit ? t('profile.update') : t('profile.create')}
        </button>
        {isEdit && (
          <>
            <button className="btn btn-ghost btn-lg" type="button" onClick={copySummary}>
              {t('profile.copy')}
            </button>
            <p className="form-footnote">{t('profile.copyHint')}</p>
          </>
        )}
        {applications.length > 0 && (
          <p className="form-footnote">
            💌 {applications.length} · <a href="#/applications">{t('profile.seeApps')}</a>
          </p>
        )}
      </form>
    </main>
  );
}
