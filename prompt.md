可能です。以下の3ファイルだけで動く Vanilla JS 版です。

```txt
index.html
style.css
app.js
```

休日ライブラリ `date-holidays` は CDN から読み込みます。

---

## index.html

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>スワップポイントカレンダー</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <div class="app">
    <header class="header">
      <div>
        <h1>スワップポイントカレンダー</h1>
        <p id="header-description">休日情報をもとにスワップ付与日数を算出します。</p>
      </div>
    </header>

    <main class="container">
      <section class="pair-panel">
        <div class="field">
          <label for="currency1">通貨1</label>
          <select id="currency1"></select>
        </div>

        <div class="slash">/</div>

        <div class="field">
          <label for="currency2">通貨2</label>
          <select id="currency2"></select>
        </div>
      </section>

      <div class="tabs">
        <button id="calendar-tab-button" class="active" type="button">
          月表示のスワップカレンダー
        </button>
        <button id="simulator-tab-button" type="button">
          スワップ累計損益シミュレーター
        </button>
      </div>

      <section id="calendar-tab" class="tab-body">
        <div class="month-toolbar">
          <button id="prev-month-button" type="button">前月</button>
          <div id="month-title" class="month-title"></div>
          <button id="next-month-button" type="button">翌月</button>
        </div>

        <div class="month-input-row">
          <label>
            年月指定
            <input id="month-input" type="month" />
          </label>
        </div>

        <div id="calendar" class="calendar"></div>

        <p class="note">
          ※ 一般的なT+2ロールオーバーを前提に、通貨ペアのいずれかの通貨が休日の場合は非営業日として扱います。
        </p>
      </section>

      <section id="simulator-tab" class="tab-body hidden">
        <div class="sim-grid">
          <label class="field">
            買いスワップ 1日分・1ロットあたり
            <input id="buy-swap-input" type="number" inputmode="decimal" value="0" />
          </label>

          <label class="field">
            売りスワップ 1日分・1ロットあたり
            <input id="sell-swap-input" type="number" inputmode="decimal" value="0" />
          </label>

          <label class="field">
            ロット数
            <input id="lots-input" type="number" inputmode="decimal" min="0" step="0.01" value="1" />
          </label>

          <label class="field">
            開始日
            <div class="date-with-button">
              <input id="start-date-input" type="date" />
              <button id="today-button" type="button">今日</button>
            </div>
          </label>

          <label class="field">
            終了日
            <input id="end-date-input" type="date" />
          </label>
        </div>

        <div class="result-panel">
          <h2>シミュレーション結果</h2>
          <div id="simulation-result"></div>

          <p class="note">
            ※ 終了日前日のロールオーバーまで保有する前提で計算します。
            例：終了日が5月10日の場合、5月9日分までを対象にします。
          </p>
        </div>
      </section>
    </main>
  </div>

  <script type="module" src="./app.js"></script>
</body>
</html>
```

---

## style.css

```css
:root {
  color-scheme: light;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #172033;
  background: #f4f6fa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
select,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.hidden {
  display: none !important;
}

.app {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #153e75, #245ca8);
  color: #fff;
  padding: 28px 20px;
}

.header h1 {
  margin: 0 0 8px;
  font-size: clamp(24px, 4vw, 36px);
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.container {
  width: min(1200px, calc(100% - 32px));
  margin: 24px auto 48px;
}

.pair-panel {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: end;
  background: #fff;
  border: 1px solid #dfe5ef;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 22px rgba(20, 38, 70, 0.06);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
}

.slash {
  font-size: 28px;
  font-weight: 800;
  padding-bottom: 8px;
  color: #64748b;
}

.tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0 0;
  overflow-x: auto;
}

.tabs button {
  border: 1px solid #d3dae6;
  background: #eef2f7;
  color: #334155;
  padding: 12px 16px;
  border-radius: 999px;
  white-space: nowrap;
  font-weight: 700;
}

.tabs button.active {
  background: #1d4ed8;
  color: #fff;
  border-color: #1d4ed8;
}

.tab-body {
  background: #fff;
  border: 1px solid #dfe5ef;
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  box-shadow: 0 8px 22px rgba(20, 38, 70, 0.06);
}

.month-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.month-toolbar button,
.date-with-button button {
  border: none;
  background: #e2e8f0;
  color: #172033;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
}

.month-title {
  text-align: center;
  font-weight: 900;
  font-size: clamp(20px, 3vw, 28px);
}

.month-input-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.month-input-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.month-input-row input {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-left: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
}

.weekday {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 6px;
  text-align: center;
  font-weight: 900;
}

.weekday:first-child {
  color: #dc2626;
}

.weekday:nth-child(7) {
  color: #2563eb;
}

.day-cell {
  min-height: 124px;
  padding: 8px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-cell.outside-month {
  background: #f8fafc;
  color: #94a3b8;
}

.day-cell.weekend {
  background: #fbfdff;
}

.day-cell.today {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.day-cell.multi-swap {
  background: #fff7ed;
}

.day-cell.no-swap {
  color: #64748b;
}

.day-head {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.date-number {
  font-weight: 900;
}

.today-badge {
  background: #2563eb;
  color: #fff;
  border-radius: 999px;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: 700;
}

.swap-badge {
  width: fit-content;
  background: #e2e8f0;
  color: #334155;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
}

.swap-badge.strong {
  background: #f97316;
  color: #fff;
}

.holiday-list {
  font-size: 12px;
  line-height: 1.4;
  color: #b91c1c;
  overflow-wrap: anywhere;
}

.note {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.sim-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.date-with-button {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.result-panel {
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.result-panel h2 {
  margin: 0 0 16px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.result-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
}

.result-card .label {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.result-card .value {
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 900;
}

.profit-buy {
  background: #ecfdf5;
  border-color: #bbf7d0;
}

.profit-sell {
  background: #fff1f2;
  border-color: #fecdd3;
}

.warning {
  color: #b91c1c;
  font-weight: 700;
}

@media (max-width: 900px) {
  .result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .day-cell {
    min-height: 112px;
  }
}

@media (max-width: 700px) {
  .container {
    width: min(100% - 20px, 1200px);
    margin-top: 14px;
  }

  .pair-panel {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }

  .slash {
    display: none;
  }

  .tab-body {
    padding: 12px;
  }

  .month-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .month-title {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .month-toolbar button:first-child {
    grid-column: 1;
    grid-row: 2;
  }

  .month-toolbar button:last-child {
    grid-column: 2;
    grid-row: 2;
  }

  .month-input-row {
    justify-content: stretch;
  }

  .month-input-row label {
    width: 100%;
    justify-content: space-between;
  }

  .calendar {
    font-size: 13px;
  }

  .weekday {
    padding: 8px 2px;
  }

  .day-cell {
    min-height: 96px;
    padding: 5px;
  }

  .swap-badge {
    font-size: 11px;
    padding: 4px 6px;
  }

  .holiday-list {
    font-size: 10px;
  }

  .sim-grid,
  .result-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## app.js

```javascript
import Holidays from 'https://esm.sh/date-holidays@3.23.16?bundle';

const CURRENCIES = [
  { code: 'USD', label: 'USD - 米ドル' },
  { code: 'EUR', label: 'EUR - ユーロ' },
  { code: 'GBP', label: 'GBP - 英ポンド' },
  { code: 'AUD', label: 'AUD - 豪ドル' },
  { code: 'NZD', label: 'NZD - NZドル' },
  { code: 'CAD', label: 'CAD - カナダドル' },
  { code: 'CHF', label: 'CHF - スイスフラン' },
  { code: 'JPY', label: 'JPY - 日本円' },
  { code: 'ZAR', label: 'ZAR - 南アランド' },
  { code: 'NOK', label: 'NOK - ノルウェークローネ' },
  { code: 'HKD', label: 'HKD - 香港ドル' },
  { code: 'SEK', label: 'SEK - スウェーデンクローナ' },
  { code: 'PLN', label: 'PLN - ポーランドズロチ' },
  { code: 'TRY', label: 'TRY - トルコリラ' },
  { code: 'MXN', label: 'MXN - メキシコペソ' },
  { code: 'CNH', label: 'CNH - 人民元オフショア' },
  { code: 'CNY', label: 'CNY - 人民元' },

  // ラージ銘柄。休日判定上は通常通貨と同じ扱い。
  { code: 'USL', label: 'USL - 米ドル ラージ' },
  { code: 'EUL', label: 'EUL - ユーロ ラージ' },
  { code: 'GBL', label: 'GBL - 英ポンド ラージ' },
  { code: 'AUL', label: 'AUL - 豪ドル ラージ' }
];

const LARGE_TO_BASE = {
  USL: 'USD',
  EUL: 'EUR',
  GBL: 'GBP',
  AUL: 'AUD'
};

const COUNTRY_BY_CURRENCY = {
  USD: 'US',
  JPY: 'JP',
  GBP: 'GB',
  AUD: 'AU',
  NZD: 'NZ',
  CAD: 'CA',
  CHF: 'CH',
  ZAR: 'ZA',
  NOK: 'NO',
  HKD: 'HK',
  SEK: 'SE',
  PLN: 'PL',
  TRY: 'TR',
  MXN: 'MX',
  CNH: 'CN',
  CNY: 'CN'
};

const holidayInstances = new Map();
const holidayMemo = new Map();

let state = {
  ccy1: 'USD',
  ccy2: 'JPY',
  month: '',
  activeTab: 'calendar'
};

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  bindElements();
  initializeState();
  initializeCurrencySelects();
  initializeSimulatorDefaults();
  bindEvents();
  renderAll();
});

function bindElements() {
  els.headerDescription = document.getElementById('header-description');

  els.currency1 = document.getElementById('currency1');
  els.currency2 = document.getElementById('currency2');

  els.calendarTabButton = document.getElementById('calendar-tab-button');
  els.simulatorTabButton = document.getElementById('simulator-tab-button');
  els.calendarTab = document.getElementById('calendar-tab');
  els.simulatorTab = document.getElementById('simulator-tab');

  els.prevMonthButton = document.getElementById('prev-month-button');
  els.nextMonthButton = document.getElementById('next-month-button');
  els.monthTitle = document.getElementById('month-title');
  els.monthInput = document.getElementById('month-input');
  els.calendar = document.getElementById('calendar');

  els.buySwapInput = document.getElementById('buy-swap-input');
  els.sellSwapInput = document.getElementById('sell-swap-input');
  els.lotsInput = document.getElementById('lots-input');
  els.startDateInput = document.getElementById('start-date-input');
  els.endDateInput = document.getElementById('end-date-input');
  els.todayButton = document.getElementById('today-button');
  els.simulationResult = document.getElementById('simulation-result');
}

function initializeState() {
  const [ccy1, ccy2] = parsePairFromPath();
  state.ccy1 = ccy1;
  state.ccy2 = ccy2;
  state.month = parseMonthFromUrl();
}

function initializeCurrencySelects() {
  const optionsHtml = CURRENCIES
    .map((c) => `<option value="${escapeHtml(c.code)}">${escapeHtml(c.label)}</option>`)
    .join('');

  els.currency1.innerHTML = optionsHtml;
  els.currency2.innerHTML = optionsHtml;

  els.currency1.value = state.ccy1;
  els.currency2.value = state.ccy2;
}

function initializeSimulatorDefaults() {
  const today = todayJstYmd();
  els.startDateInput.value = today;
  els.endDateInput.value = addDays(today, 30);
}

function bindEvents() {
  els.currency1.addEventListener('change', () => {
    state.ccy1 = els.currency1.value;
    updateUrl();
    renderAll();
  });

  els.currency2.addEventListener('change', () => {
    state.ccy2 = els.currency2.value;
    updateUrl();
    renderAll();
  });

  els.calendarTabButton.addEventListener('click', () => {
    state.activeTab = 'calendar';
    renderTabs();
  });

  els.simulatorTabButton.addEventListener('click', () => {
    state.activeTab = 'simulator';
    renderTabs();
    renderSimulator();
  });

  els.prevMonthButton.addEventListener('click', () => {
    state.month = addMonths(state.month, -1);
    updateUrl();
    renderCalendar();
  });

  els.nextMonthButton.addEventListener('click', () => {
    state.month = addMonths(state.month, 1);
    updateUrl();
    renderCalendar();
  });

  els.monthInput.addEventListener('change', () => {
    if (els.monthInput.value) {
      state.month = els.monthInput.value;
      updateUrl();
      renderCalendar();
    }
  });

  [
    els.buySwapInput,
    els.sellSwapInput,
    els.lotsInput,
    els.startDateInput,
    els.endDateInput
  ].forEach((el) => {
    el.addEventListener('input', renderSimulator);
    el.addEventListener('change', renderSimulator);
  });

  els.todayButton.addEventListener('click', () => {
    els.startDateInput.value = todayJstYmd();
    renderSimulator();
  });

  window.addEventListener('popstate', () => {
    const [ccy1, ccy2] = parsePairFromPath();
    state.ccy1 = ccy1;
    state.ccy2 = ccy2;
    state.month = parseMonthFromUrl();

    els.currency1.value = state.ccy1;
    els.currency2.value = state.ccy2;

    renderAll();
  });
}

function renderAll() {
  els.headerDescription.textContent =
    `休日情報をもとに、${state.ccy1}/${state.ccy2} のスワップ付与日数を算出します。`;

  els.currency1.value = state.ccy1;
  els.currency2.value = state.ccy2;

  renderTabs();
  renderCalendar();
  renderSimulator();
}

function renderTabs() {
  const isCalendar = state.activeTab === 'calendar';

  els.calendarTabButton.classList.toggle('active', isCalendar);
  els.simulatorTabButton.classList.toggle('active', !isCalendar);

  els.calendarTab.classList.toggle('hidden', !isCalendar);
  els.simulatorTab.classList.toggle('hidden', isCalendar);
}

function renderCalendar() {
  els.monthTitle.textContent = formatMonthLabel(state.month);
  els.monthInput.value = state.month;

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    .map((d) => `<div class="weekday">${d}</div>`)
    .join('');

  const today = todayJstYmd();
  const dates = getMonthGrid(state.month);

  const dayCells = dates.map((ymd) => {
    const inMonth = ymd.startsWith(state.month);
    const swapDays = swapDaysForDate(state.ccy1, state.ccy2, ymd);
    const holidays = getPairHolidayDetails(state.ccy1, state.ccy2, ymd);
    const weekend = isWeekend(ymd);

    const classes = [
      'day-cell',
      inMonth ? '' : 'outside-month',
      ymd === today ? 'today' : '',
      weekend ? 'weekend' : '',
      swapDays >= 3 ? 'multi-swap' : '',
      swapDays === 0 ? 'no-swap' : ''
    ].filter(Boolean).join(' ');

    const holidayHtml = holidays.length > 0
      ? `
        <div class="holiday-list">
          ${holidays.map((h) => `
            <div>
              <strong>${escapeHtml(h.currency)}</strong>: ${escapeHtml(h.names.join(', '))}
            </div>
          `).join('')}
        </div>
      `
      : '';

    return `
      <div class="${classes}">
        <div class="day-head">
          <span class="date-number">${Number(ymd.slice(8, 10))}</span>
          ${ymd === today ? '<span class="today-badge">今日</span>' : ''}
        </div>

        <div class="swap-badge ${swapDays >= 3 ? 'strong' : ''}">
          付与 ${swapDays}日
        </div>

        ${holidayHtml}
      </div>
    `;
  }).join('');

  els.calendar.innerHTML = weekdays + dayCells;
}

function renderSimulator() {
  const buySwap = Number(els.buySwapInput.value || 0);
  const sellSwap = Number(els.sellSwapInput.value || 0);
  const lots = Number(els.lotsInput.value || 0);
  const startDate = els.startDateInput.value;
  const endDate = els.endDateInput.value;

  if (!startDate || !endDate || endDate <= startDate) {
    els.simulationResult.innerHTML = `
      <p class="warning">終了日は開始日より後の日付を指定してください。</p>
    `;
    return;
  }

  let d = startDate;
  const last = addDays(endDate, -1);

  let totalSwapDays = 0;
  let rolloverCount = 0;

  while (d <= last) {
    const days = swapDaysForDate(state.ccy1, state.ccy2, d);

    if (days > 0) {
      rolloverCount += 1;
      totalSwapDays += days;
    }

    d = addDays(d, 1);
  }

  const buyProfit = buySwap * lots * totalSwapDays;
  const sellProfit = sellSwap * lots * totalSwapDays;

  els.simulationResult.innerHTML = `
    <div class="result-grid">
      <div class="result-card">
        <div class="label">対象通貨ペア</div>
        <div class="value">${escapeHtml(state.ccy1)}/${escapeHtml(state.ccy2)}</div>
      </div>

      <div class="result-card">
        <div class="label">ロールオーバー回数</div>
        <div class="value">${formatNumber(rolloverCount)} 回</div>
      </div>

      <div class="result-card">
        <div class="label">付与日数合計</div>
        <div class="value">${formatNumber(totalSwapDays)} 日分</div>
      </div>

      <div class="result-card profit-buy">
        <div class="label">買い累計損益</div>
        <div class="value">${formatMoney(buyProfit)}</div>
      </div>

      <div class="result-card profit-sell">
        <div class="label">売り累計損益</div>
        <div class="value">${formatMoney(sellProfit)}</div>
      </div>
    </div>
  `;
}

function parsePairFromPath() {
  const validCodes = CURRENCIES.map((c) => c.code);

  const parts = window.location.pathname
    .split('/')
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);

  if (
    parts.length >= 2 &&
    validCodes.includes(parts[0]) &&
    validCodes.includes(parts[1])
  ) {
    return [parts[0], parts[1]];
  }

  return ['USD', 'JPY'];
}

function parseMonthFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const month = params.get('month');

  if (/^\d{4}-\d{2}$/.test(month || '')) {
    return month;
  }

  return todayJstYmd().slice(0, 7);
}

function updateUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set('month', state.month);

  const newUrl = `/${state.ccy1}/${state.ccy2}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
}

function normalizeCurrency(code) {
  return LARGE_TO_BASE[code] || code;
}

function getHolidayInstance(countryCode) {
  if (!holidayInstances.has(countryCode)) {
    holidayInstances.set(countryCode, new Holidays(countryCode));
  }

  return holidayInstances.get(countryCode);
}

function getHolidayNames(currency, ymd) {
  const base = normalizeCurrency(currency);
  const memoKey = `${base}:${ymd}`;

  if (holidayMemo.has(memoKey)) {
    return holidayMemo.get(memoKey);
  }

  let names = [];

  if (base === 'EUR') {
    names = getTarget2HolidayNames(ymd);
    holidayMemo.set(memoKey, names);
    return names;
  }

  const country = COUNTRY_BY_CURRENCY[base];

  if (!country) {
    holidayMemo.set(memoKey, []);
    return [];
  }

  try {
    const hd = getHolidayInstance(country);
    const result = hd.isHoliday(fromYmd(ymd));

    if (Array.isArray(result)) {
      names = result
        .filter((h) => h.type !== 'observance' && h.type !== 'optional')
        .map((h) => h.name);
    } else if (
      result &&
      result.type !== 'observance' &&
      result.type !== 'optional'
    ) {
      names = [result.name];
    }
  } catch {
    names = [];
  }

  holidayMemo.set(memoKey, names);
  return names;
}

function getPairHolidayDetails(ccy1, ccy2, ymd) {
  const list = [];

  const h1 = getHolidayNames(ccy1, ymd);
  const h2 = getHolidayNames(ccy2, ymd);

  if (h1.length > 0) {
    list.push({
      currency: ccy1,
      names: h1
    });
  }

  if (h2.length > 0 && normalizeCurrency(ccy2) !== normalizeCurrency(ccy1)) {
    list.push({
      currency: ccy2,
      names: h2
    });
  }

  return list;
}

function isBusinessDay(ccy1, ccy2, ymd) {
  if (isWeekend(ymd)) {
    return false;
  }

  return getPairHolidayDetails(ccy1, ccy2, ymd).length === 0;
}

function nextBusinessDay(ccy1, ccy2, ymd) {
  let d = addDays(ymd, 1);

  while (!isBusinessDay(ccy1, ccy2, d)) {
    d = addDays(d, 1);
  }

  return d;
}

function addBusinessDays(ccy1, ccy2, ymd, businessDays) {
  let d = ymd;
  let count = 0;

  while (count < businessDays) {
    d = addDays(d, 1);

    if (isBusinessDay(ccy1, ccy2, d)) {
      count += 1;
    }
  }

  return d;
}

function spotDate(ccy1, ccy2, tradeDateYmd) {
  return addBusinessDays(ccy1, ccy2, tradeDateYmd, 2);
}

function swapDaysForDate(ccy1, ccy2, ymd) {
  if (!isBusinessDay(ccy1, ccy2, ymd)) {
    return 0;
  }

  const beforeValueDate = spotDate(ccy1, ccy2, ymd);
  const nextTradeDate = nextBusinessDay(ccy1, ccy2, ymd);
  const afterValueDate = spotDate(ccy1, ccy2, nextTradeDate);

  return diffCalendarDays(beforeValueDate, afterValueDate);
}

function getTarget2HolidayNames(ymd) {
  const year = Number(ymd.slice(0, 4));
  const easter = easterSundayYmd(year);

  const holidays = [
    { date: `${year}-01-01`, name: 'TARGET2 New Year’s Day' },
    { date: addDays(easter, -2), name: 'TARGET2 Good Friday' },
    { date: addDays(easter, 1), name: 'TARGET2 Easter Monday' },
    { date: `${year}-05-01`, name: 'TARGET2 Labour Day' },
    { date: `${year}-12-25`, name: 'TARGET2 Christmas Day' },
    { date: `${year}-12-26`, name: 'TARGET2 Boxing Day' }
  ];

  return holidays
    .filter((h) => h.date === ymd)
    .map((h) => h.name);
}

function easterSundayYmd(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function getMonthGrid(month) {
  const [year, mon] = month.split('-').map(Number);

  const first = new Date(year, mon - 1, 1, 12);
  const last = new Date(year, mon, 0, 12);

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const dates = [];
  const cur = new Date(start);

  while (cur <= end) {
    dates.push(toYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

function todayJstYmd() {
  const parts = new Intl.DateTimeFormat('ja-JP-u-ca-gregory', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;

  return `${y}-${m}-${d}`;
}

function fromYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function toYmd(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function addDays(ymd, days) {
  const d = fromYmd(ymd);
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

function diffCalendarDays(aYmd, bYmd) {
  const [ay, am, ad] = aYmd.split('-').map(Number);
  const [by, bm, bd] = bYmd.split('-').map(Number);

  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);

  return Math.round((b - a) / 86_400_000);
}

function isWeekend(ymd) {
  const day = fromYmd(ymd).getDay();
  return day === 0 || day === 6;
}

function addMonths(month, delta) {
  const [year, mon] = month.split('-').map(Number);
  const d = new Date(year, mon - 1 + delta, 1, 12);

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function formatMonthLabel(month) {
  const [year, mon] = month.split('-');
  return `${year}年${Number(mon)}月`;
}

function formatMoney(value) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('ja-JP').format(value);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
```

---

## 配置方法

Apache のドキュメントルートに以下を置けば動きます。

```txt
index.html
style.css
app.js
```

例えば以下でアクセスできます。

```txt
http://localhost/index.html
```

また、URLパス指定もアプリ側では対応しています。

```txt
/USD/JPY
/EUR/USD
/GBP/CHF
/EUL/USL
/USD/JPY?month=2026-05
```

ただし、Apacheで `/USD/JPY` のようなパスに直接アクセスする場合は、Apache側で存在しないパスを `index.html` に流す設定が必要です。

`.htaccess` を使う場合の例は以下です。

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

これを有効にすると、以下のようなURLを直接開けます。

```txt
http://localhost/USD/JPY
http://localhost/EUR/USD?month=2026-05
```
