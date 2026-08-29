// Dev-only smoke check: SSR-renders every route of the app to catch runtime errors.
// Not part of the shipped app. Run: node scripts/ssr-check.mjs
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.document = { documentElement: { lang: '' }, title: '', createElement: () => ({ select: () => {}, }), body: { appendChild: () => {}, removeChild: () => {} } };
globalThis.window = {
  location: { hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  confirm: () => true,
};

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { App } = await vite.ssrLoadModule('/src/App.tsx');
  const i18nMod = await vite.ssrLoadModule('/src/i18n.tsx');
  const storeMod = await vite.ssrLoadModule('/src/store.tsx');

  const { LangProvider } = i18nMod;
  const { StoreProvider } = storeMod;
  const h = React.createElement;

  const renderAt = (route) => {
    window.location.hash = route;
    return renderToString(h(LangProvider, null, h(StoreProvider, null, h(App))));
  };

  const cases = [
    ['/', ['領養一站通', '一站睇晒', '真實待領養個案', '救狗之家', '快捷申請渠道', 'hongkongdogrescue.com/wp-content', 'lap.org.hk/pic']],
    ['/browse', ['搵毛孩', '資料快照', '載入更多', 'hongkongdogrescue.com/wp-content', '年齡', '體型', '品種', '只睇收藏', /共 \d+ 個真實個案/]],
    ['/browse?type=cat', ['貓隻', 'lap.org.hk/pic']],
    ['/browse?type=dog', ['狗隻', 'hongkongdogrescue.com/wp-content']],
    ['/orgs', ['領養機構', '香港愛護動物協會', '漁護署', 'TAILS Lantau', 'hongkongdogrescue.com', 'hk-aac.org.hk', '已收錄', '更多領養渠道', 'KirstensZoo', '西貢流浪之友']],
    ['/profile', ['我的領養者檔案']],
    ['/applications', ['我的申請', '仲未有任何記錄']],
    ['/settings', ['設定', '顯示語言']],
    ['/about', ['關於領養一站通', '資料來源', 'spca.org.hk']],
  ];

  let failed = 0;
  const has = (html, needle) =>
    needle instanceof RegExp ? needle.test(html) : html.includes(needle);
  for (const [route, needles] of cases) {
    const html = renderAt(route);
    const missing = needles.filter((n) => !has(html, n));
    if (missing.length) {
      failed++;
      console.log(`✗ zh ${route} — missing: ${missing.join(' | ')}`);
    } else {
      console.log(`✓ zh ${route} (${html.length} bytes)`);
    }
  }

  // English pass
  store.set('adopthub.lang', 'en');
  for (const [route, needles] of [
    ['/', ['HK Adopt Hub', 'Real adoption cases', 'Find a Pet']],
    ['/browse', ['real cases', 'View &amp; apply', 'Load more pets', 'Age', 'Size', 'Breed', 'Favourites only']],
    ['/orgs', ['Adoption Organisations', 'AFCD', 'cases indexed', 'More adoption channels', 'KirstensZoo']],
    ['/settings', ['Display language', 'English']],
  ]) {
    const html = renderAt(route);
    const missing = needles.filter((n) => !has(html, n));
    if (missing.length) {
      failed++;
      console.log(`✗ en ${route} — missing: ${missing.join(' | ')}`);
    } else {
      console.log(`✓ en ${route} (${html.length} bytes)`);
    }
  }

  console.log(failed === 0 ? 'ALL CHECKS PASSED' : `${failed} CHECK(S) FAILED`);
  process.exitCode = failed === 0 ? 0 : 1;
} finally {
  await vite.close();
}
