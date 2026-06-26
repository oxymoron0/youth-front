// Build-time SEO prerender: fetch all housings and inject a static, crawlable
// list into dist/index.html (inside <noscript>) so non-JS crawlers (e.g. Naver)
// index the housing content. The interactive SPA is unaffected.
import { readFile, writeFile } from 'node:fs/promises';

const API_BASE = process.env.SEO_API_BASE || 'https://youth.leorca.org';
const SOCO_LIST = 'https://soco.seoul.go.kr/youth/pgm/home/yohome/mainYoHomeListJson.json';
const DIST = new URL('../dist/index.html', import.meta.url);

const STATUS = {
  '01': '청약예정', '02': '청약중', '03': '추가모집', '04': '입주가능',
  '05': '공급완료', '06': '공급예정', '07': '청약마감',
};
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = (v) => (v == null ? null : `${Number(v).toLocaleString('ko-KR')}원`);

async function fetchOurApi() {
  const r = await fetch(`${API_BASE}/api/v1/housings`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`status ${r.status}`);
  const d = await r.json();
  return d.map((h) => ({
    name: h.home_name, gu: h.address_gu, dong: h.address_dong,
    status: h.supply_status, deposit: h.deposit_low, rental: h.rental_low,
  }));
}

async function fetchSoco() {
  const r = await fetch(SOCO_LIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'rowCount=200',
    signal: AbortSignal.timeout(15000),
  });
  const d = await r.json();
  return (d.resultList || []).map((h) => ({
    name: h.homeName, gu: h.adresGu, dong: null,
    status: h.supplyStatus,
    deposit: typeof h.moneyDepositLow === 'number' ? h.moneyDepositLow : null,
    rental: typeof h.moneyRentalLow === 'number' ? h.moneyRentalLow : null,
  }));
}

async function getHousings() {
  try {
    return await fetchOurApi();
  } catch (e) {
    console.warn(`[seo] our API failed (${e.message}); falling back to soco`);
    try {
      return await fetchSoco();
    } catch (e2) {
      console.warn(`[seo] soco fallback failed (${e2.message}); injecting header only`);
      return [];
    }
  }
}

function buildNoscript(items) {
  const lis = items
    .map((h) => {
      const loc = [h.gu, h.dong].filter(Boolean).join(' ');
      const label = STATUS[h.status] || h.status || '';
      const dep = won(h.deposit);
      const ren = won(h.rental);
      const rent = dep || ren ? ` · 보증금 ${dep || '-'} / 월 ${ren || '-'}` : '';
      return `<li>${esc(h.name)}${loc ? ` — ${esc(loc)}` : ''}${label ? ` · ${esc(label)}` : ''}${rent}</li>`;
    })
    .join('');
  const count = items.length;
  return `<noscript>
<section>
<h1>청년주택 트래커 — 서울 청년안심주택 지도</h1>
<p>서울시 청년안심주택의 위치·임대료·공급상태와 인근 지하철역, 금융지원 정보를 네이버 지도에서 한눈에 확인하세요.${count ? ` 수도권 청년 주택 ${count}곳을 검색하고 비교할 수 있습니다.` : ''}</p>
${count ? `<h2>청년안심주택 목록 (${count})</h2>\n<ul>${lis}</ul>` : ''}
</section>
</noscript>`;
}

const items = await getHousings();
let html = await readFile(DIST, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  console.error('[seo] #root marker not found; aborting injection');
  process.exit(0); // do not fail the build
}
html = html.replace(marker, `${marker}\n    ${buildNoscript(items)}`);
await writeFile(DIST, html);
console.log(`[seo] injected ${items.length} housings into dist/index.html`);
