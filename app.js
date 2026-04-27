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
  const { ccy1, ccy2, month } = parseParamsFromUrl();
  state.ccy1 = ccy1;
  state.ccy2 = ccy2;
  state.month = month;
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
    const { ccy1, ccy2, month } = parseParamsFromUrl();
    state.ccy1 = ccy1;
    state.ccy2 = ccy2;
    state.month = month;

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
          ${holidays.map((h) => {
            const fullText = `${h.currency}: ${h.names.join(', ')}`;
            return `
              <div class="holiday-item" title="${escapeHtml(fullText)}">
                <strong>${escapeHtml(h.currency)}</strong>: ${escapeHtml(h.names.join(', '))}
              </div>
            `;
          }).join('')}
        </div>
      `
      : '';

    return `
      <div class="${classes}">
        <div class="day-head">
          <span class="date-number">${Number(ymd.slice(8, 10))}</span>
        </div>

        ${ymd === today ? '<div class="today-row"><span class="today-badge">今日</span></div>' : ''}

        <div class="swap-badge ${swapDays >= 3 ? 'strong' : ''}">
          ${swapDays}
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

function parseParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const validCodes = CURRENCIES.map((c) => c.code);

  let ccy1 = (params.get('ccy1') || '').toUpperCase();
  let ccy2 = (params.get('ccy2') || '').toUpperCase();
  let month = params.get('month');

  if (!validCodes.includes(ccy1) || !validCodes.includes(ccy2)) {
    ccy1 = 'USD';
    ccy2 = 'JPY';
  }

  if (!/^\d{4}-\d{2}$/.test(month || '')) {
    month = todayJstYmd().slice(0, 7);
  }

  return { ccy1, ccy2, month };
}

function updateUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set('ccy1', state.ccy1);
  params.set('ccy2', state.ccy2);
  params.set('month', state.month);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
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

function isSettlementBusinessDay(ccy1, ccy2, ymd) {
  if (isWeekend(ymd)) {
    return false;
  }

  return getPairHolidayDetails(ccy1, ccy2, ymd).length === 0;
}

function isRolloverDay(ymd) {
  return !isWeekend(ymd);
}

function nextRolloverDay(ymd) {
  let d = addDays(ymd, 1);

  while (!isRolloverDay(d)) {
    d = addDays(d, 1);
  }

  return d;
}

function addSettlementBusinessDays(ccy1, ccy2, ymd, businessDays) {
  let d = ymd;
  let count = 0;

  while (count < businessDays) {
    d = addDays(d, 1);

    if (isSettlementBusinessDay(ccy1, ccy2, d)) {
      count += 1;
    }
  }

  return d;
}

function spotDate(ccy1, ccy2, tradeDateYmd) {
  return addSettlementBusinessDays(ccy1, ccy2, tradeDateYmd, 2);
}

function rawSwapDaysForDate(ccy1, ccy2, ymd) {
  if (!isRolloverDay(ymd)) {
    return 0;
  }

  const beforeValueDate = spotDate(ccy1, ccy2, ymd);
  const nextTradeDate = nextRolloverDay(ymd);
  const afterValueDate = spotDate(ccy1, ccy2, nextTradeDate);

  return diffCalendarDays(beforeValueDate, afterValueDate);
}

function swapDaysForDate(ccy1, ccy2, ymd) {
  const current = rawSwapDaysForDate(ccy1, ccy2, ymd);

  if (!isRolloverDay(ymd)) {
    return current;
  }

  const weekday = fromYmd(ymd).getDay();
  const prevYmd = addDays(ymd, -1);
  const nextYmd = addDays(ymd, 1);
  const prev = rawSwapDaysForDate(ccy1, ccy2, prevYmd);
  const next = rawSwapDaysForDate(ccy1, ccy2, nextYmd);
  const holidayToday = getPairHolidayDetails(ccy1, ccy2, ymd).length > 0;
  const holidayYesterday = getPairHolidayDetails(ccy1, ccy2, prevYmd).length > 0;

  if (weekday === 2 && current >= 3 && next === 0) {
    return 0;
  }

  if (weekday === 3 && current === 0 && prev >= 3) {
    return prev;
  }

  if (weekday === 3 && holidayToday && current === 1 && next === 0) {
    return 0;
  }

  if (weekday === 4 && holidayYesterday && prev === 1 && current === 0) {
    return 1;
  }

  return current;
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
