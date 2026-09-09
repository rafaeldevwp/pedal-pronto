import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readiness, week, performance, mesocycle, polarStatus } from './fixtures.mjs';
import fs from 'node:fs';

const OUT = new URL('./shots', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: '320-iphone-se-antigo', width: 320, height: 568 },
  { name: '360-android-comum',    width: 360, height: 800 },
  { name: '390-iphone-14',        width: 390, height: 844 },
  { name: '430-iphone-pro-max',   width: 430, height: 932 },
  { name: '768-ipad-retrato',     width: 768, height: 1024 },
  { name: '1024-ipad-paisagem',   width: 1024, height: 768 },
  { name: '1440-desktop',         width: 1440, height: 900 },
];
const tabs = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'treinos', label: 'Semana' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'glossario', label: 'Glossário' },
];

const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

async function stub(page) {
  await page.route('**/api/polar/status', (route) => route.fulfill(json(polarStatus)));
  await page.route('**/api/readiness*', (route) => route.fulfill(json(readiness)));
  await page.route('**/api/week*', (route) => route.fulfill(json(week)));
  await page.route('**/api/performance*', (route) => route.fulfill(json(performance)));
  await page.route('**/api/mesocycle*', (route) => route.fulfill(json(mesocycle)));
}

// Medições objetivas. Nada de "parece apertado": números que dá para discutir.
const measure = () => {
  const problems = [];
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 1)
    problems.push({ kind: 'overflow-pagina', detail: `a página rola ${doc.scrollWidth - doc.clientWidth}px na horizontal` });

  const viewportWidth = doc.clientWidth;
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;

    if (rect.right > viewportWidth + 1 && !el.closest('[style*="overflow"], .overflow-x-auto')) {
      const scrollable = el.closest('*');
      let ancestorScrolls = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === 'auto' || ov === 'scroll') { ancestorScrolls = true; break; }
      }
      if (!ancestorScrolls)
        problems.push({ kind: 'estoura-a-direita', tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0, 60), detail: `${Math.round(rect.right - viewportWidth)}px além da tela` });
    }

    const interactive = ['BUTTON', 'A', 'SUMMARY', 'INPUT', 'SELECT'].includes(el.tagName);
    if (interactive && (rect.height < 44 || rect.width < 44))
      problems.push({ kind: 'alvo-de-toque-pequeno', tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 30), detail: `${Math.round(rect.width)}x${Math.round(rect.height)}px (mínimo 44x44)` });

    const size = parseFloat(style.fontSize);
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasOwnText && size < 12)
      problems.push({ kind: 'texto-minusculo', tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 30), detail: `${size.toFixed(1)}px` });
  }

  // Comprimento de linha: acima de ~85 caracteres a leitura sofre.
  const longLines = [];
  for (const el of document.querySelectorAll('p, li, h1, h2, h3')) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    const chars = Math.round(rect.width / (size * 0.5));
    if (chars > 85 && (el.textContent || '').trim().length > 90)
      longLines.push({ tag: el.tagName.toLowerCase(), chars, text: (el.textContent || '').trim().slice(0, 40) });
  }
  if (longLines.length) problems.push({ kind: 'linha-longa-demais', detail: `${longLines.length} blocos acima de 85 caracteres por linha`, sample: longLines.slice(0, 3) });

  return {
    problems,
    pageHeight: document.body.scrollHeight,
    viewportHeight: doc.clientHeight,
    contentWidth: document.querySelector('main')?.getBoundingClientRect().width ?? null,
  };
};

const browser = await chromium.launch();
const report = {};

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await stub(page);
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  report[vp.name] = {};
  for (const tab of tabs) {
    await page.getByRole('button', { name: new RegExp(tab.label, 'i') }).first().click().catch(() => {});
    await page.waitForTimeout(1200);
    const result = await page.evaluate(measure);
    report[vp.name][tab.id] = result;
    await page.screenshot({ path: `${OUT}/${vp.name}--${tab.id}.png`, fullPage: true });
  }
  await context.close();
}

fs.writeFileSync(new URL('./report.json', import.meta.url).pathname, JSON.stringify(report, null, 2));

// Resumo legível
for (const [vp, tabsResult] of Object.entries(report)) {
  console.log(`\n=== ${vp} ===`);
  for (const [tab, data] of Object.entries(tabsResult)) {
    const counts = {};
    for (const p of data.problems) counts[p.kind] = (counts[p.kind] || 0) + 1;
    const rolagens = (data.pageHeight / data.viewportHeight).toFixed(1);
    console.log(`  ${tab.padEnd(10)} altura ${rolagens}x tela  largura conteúdo ${data.contentWidth ? Math.round(data.contentWidth) : '?'}px  ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ') || 'sem problemas medidos'}`);
  }
}
await browser.close();
