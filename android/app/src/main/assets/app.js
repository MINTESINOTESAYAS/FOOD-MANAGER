(() => {
  'use strict';

  const APP_NAME = 'Crave Ledger';
  const APP_VERSION = '1.3';
  const DEMO_EMAIL = 'demo@craveledger.app';
  const SESSION_KEY = 'crave.ledger.session.v1';
  const STARTED_KEY = 'crave.ledger.started.v1';
  const ACCOUNTS_KEY = 'crave.ledger.accounts.v1';
  const STORE_PREFIX = 'crave.ledger.data.v2:';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const appRoot = $('#app');
  const modalRoot = $('#modal-root');
  const toastRoot = $('#toast-root');

  const ICON_PATHS = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="11" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="18" width="7" height="3" rx="1.4"/>',
    sales: '<path d="M6 3.8h12a2 2 0 0 1 2 2v14.7a.7.7 0 0 1-1.1.6l-2.9-2-3 2-3-2-3 2-3-2V5.8a2 2 0 0 1 2-2Z"/><path d="M9 9h6M9 13h6"/>',
    menu: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c-2.2 2-3.3 4.3-3.3 7.1H17"/>',
    costs: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M7.5 9h9M7.5 13h5M7 2.8v4.4M17 2.8v4.4"/>',
    insights: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 2l.7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2.9Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m7 10 5 5 5-5"/>',
    arrowUp: '<path d="m7 14 5-5 5 5"/><path d="M12 9v12"/>',
    arrowDown: '<path d="m7 10 5 5 5-5"/><path d="M12 3v12"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    edit: '<path d="m15 5 4 4M4 20l4.3-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.3 16 4 20Z"/><path d="M12 20h8"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 14h11l1-14M9 7V4h6v3"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.4 4.4"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    eye: '<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    eyeOff: '<path d="m3 3 18 18M10.6 6.2A10.6 10.6 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-3 3.6M6.2 6.4C3.8 8 2.5 12 2.5 12s3.4 6 9.5 6c1 0 1.9-.2 2.8-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
    bank: '<path d="m3 9 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M4 18h16"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8a3 3 0 0 1-2 2.8M20 21v-2a4 4 0 0 0-3-3.9"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.4 7.6 7.6 4.3 7.6-4.3M12 12v9M8 5.3l8 4.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.3 2"/>',
    sparkle: '<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L15 19l2.2-.8L19 16Z"/>',
    bowl: '<path d="M4 12a8 8 0 0 0 16 0H4Z"/><path d="M3 12h18M8 19h8M9 8c0-1 .8-1.4.8-2.5M13 8c0-1 .8-1.4.8-2.5M17 8c0-1 .8-1.4.8-2.5"/>',
    leaf: '<path d="M20 4c-8 .1-14 2.5-14 9a5 5 0 0 0 5 5c6.5 0 8.9-6 9-14Z"/><path d="M4 21c3.5-5.5 7-8.5 12-11"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-7"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3"/>',
  };

  const icon = (name, size = 20, extraClass = '') =>
    `<svg class="icon ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.sparkle}</svg>`;

  const DEFAULT_INGREDIENTS = [
    { id: 'injera', name: 'Teff injera', unit: 'each', unitCost: 35, group: 'Bread & grains' },
    { id: 'berbere', name: 'Berbere spice', unit: 'kg', unitCost: 650, group: 'Spices' },
    { id: 'niter-kibbeh', name: 'Niter kibbeh', unit: 'kg', unitCost: 700, group: 'Dairy' },
    { id: 'onion', name: 'Red onion', unit: 'kg', unitCost: 75, group: 'Produce' },
    { id: 'tomato', name: 'Tomato', unit: 'kg', unitCost: 90, group: 'Produce' },
    { id: 'garlic', name: 'Garlic', unit: 'kg', unitCost: 280, group: 'Produce' },
    { id: 'red-lentils', name: 'Red lentils', unit: 'kg', unitCost: 180, group: 'Pantry' },
    { id: 'shiro-flour', name: 'Shiro flour', unit: 'kg', unitCost: 260, group: 'Pantry' },
    { id: 'chickpeas', name: 'Chickpeas', unit: 'kg', unitCost: 160, group: 'Pantry' },
    { id: 'beef', name: 'Beef', unit: 'kg', unitCost: 950, group: 'Meat' },
    { id: 'chicken', name: 'Chicken', unit: 'kg', unitCost: 600, group: 'Meat' },
    { id: 'tilapia', name: 'Fresh tilapia', unit: 'kg', unitCost: 800, group: 'Fish & eggs' },
    { id: 'rice', name: 'Rice', unit: 'kg', unitCost: 160, group: 'Bread & grains' },
    { id: 'potato', name: 'Potato', unit: 'kg', unitCost: 50, group: 'Produce' },
    { id: 'carrot', name: 'Carrot', unit: 'kg', unitCost: 60, group: 'Produce' },
    { id: 'cabbage', name: 'Cabbage', unit: 'kg', unitCost: 45, group: 'Produce' },
    { id: 'gomen', name: 'Gomen (collard greens)', unit: 'kg', unitCost: 90, group: 'Produce' },
    { id: 'oil', name: 'Vegetable oil', unit: 'L', unitCost: 300, group: 'Pantry' },
    { id: 'green-chilli', name: 'Green chilli', unit: 'kg', unitCost: 220, group: 'Produce' },
    { id: 'peas', name: 'Green peas', unit: 'kg', unitCost: 240, group: 'Produce' },
    { id: 'egg', name: 'Egg', unit: 'each', unitCost: 25, group: 'Fish & eggs' },
    { id: 'ayib', name: 'Ayib (Ethiopian cottage cheese)', unit: 'kg', unitCost: 450, group: 'Dairy' },
    { id: 'mitmita', name: 'Mitmita', unit: 'kg', unitCost: 800, group: 'Spices' },
    { id: 'spice-mix', name: 'Kikil spice mix', unit: 'kg', unitCost: 500, group: 'Spices' },
    { id: 'lemon', name: 'Lemon', unit: 'each', unitCost: 12, group: 'Produce' },
    { id: 'serving-tray', name: 'Serving tray / takeaway pack', unit: 'each', unitCost: 18, group: 'Packaging' },
  ];

  // Ethiopian starter dishes appear in the sample workspace only. New accounts start with
  // an empty menu so the owner enters their own dishes and recipe quantities by hand.
  const ETHIOPIAN_SAMPLE_MENU = [
    {
      id: 'firfir', name: 'Firfir (Fifir)', category: 'Traditional plates', icon: '🍲', tone: 'peach', price: 320,
      recipe: [
        { ingredientId: 'injera', quantity: 1.5 }, { ingredientId: 'onion', quantity: 0.05 },
        { ingredientId: 'tomato', quantity: 0.08 }, { ingredientId: 'berbere', quantity: 0.01 },
        { ingredientId: 'niter-kibbeh', quantity: 0.02 }, { ingredientId: 'beef', quantity: 0.05 },
        { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'beyaynetu', name: 'Beyaynetu', category: 'Vegetarian & fasting', icon: '🫓', tone: 'mint', price: 420, image: 'food/beyaynetu.jpg',
      recipe: [
        { ingredientId: 'injera', quantity: 2 }, { ingredientId: 'red-lentils', quantity: 0.06 },
        { ingredientId: 'shiro-flour', quantity: 0.05 }, { ingredientId: 'chickpeas', quantity: 0.04 },
        { ingredientId: 'cabbage', quantity: 0.08 }, { ingredientId: 'potato', quantity: 0.06 },
        { ingredientId: 'gomen', quantity: 0.05 }, { ingredientId: 'onion', quantity: 0.04 },
        { ingredientId: 'tomato', quantity: 0.04 }, { ingredientId: 'oil', quantity: 0.04 },
        { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'shiro', name: 'Shiro Wot', category: 'Vegetarian & fasting', icon: '🍲', tone: 'butter', price: 320, image: 'food/shiro.jpg',
      recipe: [
        { ingredientId: 'shiro-flour', quantity: 0.12 }, { ingredientId: 'onion', quantity: 0.06 },
        { ingredientId: 'tomato', quantity: 0.06 }, { ingredientId: 'garlic', quantity: 0.01 },
        { ingredientId: 'berbere', quantity: 0.01 }, { ingredientId: 'oil', quantity: 0.03 },
        { ingredientId: 'injera', quantity: 1.5 }, { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'kikil', name: 'Kikil (Kikel stew)', category: 'Meat dishes', icon: '🍲', tone: 'rose', price: 480,
      recipe: [
        { ingredientId: 'beef', quantity: 0.15 }, { ingredientId: 'onion', quantity: 0.05 },
        { ingredientId: 'tomato', quantity: 0.06 }, { ingredientId: 'potato', quantity: 0.08 },
        { ingredientId: 'garlic', quantity: 0.005 }, { ingredientId: 'spice-mix', quantity: 0.006 },
        { ingredientId: 'injera', quantity: 1 }, { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'tibs', name: 'Tibs', category: 'Meat dishes', icon: '🥩', tone: 'peach', price: 620, image: 'food/tibs.jpg',
      recipe: [
        { ingredientId: 'beef', quantity: 0.16 }, { ingredientId: 'onion', quantity: 0.07 },
        { ingredientId: 'tomato', quantity: 0.06 }, { ingredientId: 'green-chilli', quantity: 0.02 },
        { ingredientId: 'niter-kibbeh', quantity: 0.02 }, { ingredientId: 'spice-mix', quantity: 0.006 },
        { ingredientId: 'injera', quantity: 1 }, { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'fish-injera', name: 'Fish with injera', category: 'Fish', icon: '🐟', tone: 'lavender', price: 580,
      recipe: [
        { ingredientId: 'tilapia', quantity: 0.2 }, { ingredientId: 'lemon', quantity: 0.5 },
        { ingredientId: 'onion', quantity: 0.04 }, { ingredientId: 'tomato', quantity: 0.06 },
        { ingredientId: 'oil', quantity: 0.02 }, { ingredientId: 'spice-mix', quantity: 0.005 },
        { ingredientId: 'injera', quantity: 1 }, { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'vegetable-rice', name: 'Vegetable rice', category: 'Rice & sides', icon: '🍚', tone: 'butter', price: 340,
      recipe: [
        { ingredientId: 'rice', quantity: 0.16 }, { ingredientId: 'carrot', quantity: 0.08 },
        { ingredientId: 'peas', quantity: 0.05 }, { ingredientId: 'onion', quantity: 0.04 },
        { ingredientId: 'oil', quantity: 0.02 }, { ingredientId: 'spice-mix', quantity: 0.004 },
        { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'doro-wat', name: 'Doro Wat', category: 'Meat dishes', icon: '🍗', tone: 'rose', price: 680,
      recipe: [
        { ingredientId: 'chicken', quantity: 0.22 }, { ingredientId: 'egg', quantity: 1 },
        { ingredientId: 'berbere', quantity: 0.012 }, { ingredientId: 'onion', quantity: 0.1 },
        { ingredientId: 'niter-kibbeh', quantity: 0.025 }, { ingredientId: 'injera', quantity: 2 },
        { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'kitfo', name: 'Kitfo', category: 'Meat dishes', icon: '🥩', tone: 'peach', price: 750, image: 'food/kitfo.jpg',
      recipe: [
        { ingredientId: 'beef', quantity: 0.16 }, { ingredientId: 'niter-kibbeh', quantity: 0.02 },
        { ingredientId: 'mitmita', quantity: 0.004 }, { ingredientId: 'ayib', quantity: 0.04 },
        { ingredientId: 'gomen', quantity: 0.04 }, { ingredientId: 'injera', quantity: 1 },
        { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
    {
      id: 'misir-wat', name: 'Misir Wat', category: 'Vegetarian & fasting', icon: '🫘', tone: 'mint', price: 320,
      recipe: [
        { ingredientId: 'red-lentils', quantity: 0.12 }, { ingredientId: 'onion', quantity: 0.08 },
        { ingredientId: 'tomato', quantity: 0.07 }, { ingredientId: 'garlic', quantity: 0.006 },
        { ingredientId: 'berbere', quantity: 0.01 }, { ingredientId: 'oil', quantity: 0.025 },
        { ingredientId: 'injera', quantity: 1.5 }, { ingredientId: 'serving-tray', quantity: 1 },
      ],
    },
  ];

  const state = {
    user: null,
    store: null,
    page: 'overview',
    period: 'today',
    selectedDate: todayISO(),
    authMode: 'login',
    accountMenuOpen: false,
    taxEditorYear: new Date().getFullYear(),
    calendarMonth: todayISO().slice(0, 7),
    calendarSelectedDate: todayISO(),
  };

  let pageRevealObserver = null;
  let ethiopianGreetingTimer = null;
  let googleSession = null;
  let googleSyncTimer = null;
  let googleSyncPromise = null;
  let googleSyncQueued = false;
  let googleSyncState = { status: 'disconnected', message: 'Sign in to create a private Google Sheets backup.', lastSyncedAt: '' };

  function safeRead(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast('Could not save on this device. Check available storage.', 'error');
      return false;
    }
  }

  function todayISO() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function greetingForEthiopianTime(date = new Date()) {
    let hour;
    try {
      hour = Number(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Addis_Ababa', hour: '2-digit', hourCycle: 'h23',
      }).format(date));
    } catch {
      hour = (date.getUTCHours() + 3) % 24;
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function dateFromISO(iso) {
    const [year, month, day] = String(iso).split('-').map(Number);
    return new Date(year || 2026, (month || 1) - 1, day || 1, 12, 0, 0, 0);
  }

  function toISO(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function shiftDate(iso, amount) {
    const date = dateFromISO(iso);
    date.setDate(date.getDate() + amount);
    return toISO(date);
  }

  function rangeDayCount(start, end) {
    return Math.max(1, Math.round((dateFromISO(end) - dateFromISO(start)) / 86400000) + 1);
  }

  function dateLabel(iso, options = { month: 'short', day: 'numeric' }) {
    return dateFromISO(iso).toLocaleDateString('en-US', options);
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function uid(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function cloned(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeAnnualTaxByYear(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).reduce((entries, [year, amount]) => {
      const valueNumber = Number(amount);
      if (/^\d{4}$/.test(year) && Number.isFinite(valueNumber) && valueNumber >= 0) entries.push([year, valueNumber]);
      return entries;
    }, []));
  }

  function normalizeFastingDays(value) {
    if (!Array.isArray(value)) return [];
    const eventsByDate = new Map();
    value.forEach((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
      const date = String(entry.date || '');
      const year = Number(date.slice(0, 4));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || year < 1900 || year > 2100 || toISO(dateFromISO(date)) !== date) return;
      const traditions = [...new Set((Array.isArray(entry.traditions) ? entry.traditions : [])
        .filter((tradition) => tradition === 'orthodox' || tradition === 'muslim'))];
      if (!traditions.length) return;
      eventsByDate.set(date, { date, traditions, note: String(entry.note || '').trim().slice(0, 120) });
    });
    return [...eventsByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function createBaseStore() {
    return {
      settings: {
        restaurantName: 'Enat Kitchen', currency: 'ETB', monthlyRent: 45000,
        employeeCount: 5, monthlyPayroll: 138000, annualTaxByYear: {}, openDays: 26,
      },
      ingredients: cloned(DEFAULT_INGREDIENTS),
      menu: [],
      sales: [],
      calendarEvents: [],
      createdAt: new Date().toISOString(),
    };
  }

  function itemCost(item, store = state.store) {
    if (!item || !store) return 0;
    const ingredients = new Map(store.ingredients.map((ingredient) => [ingredient.id, ingredient]));
    return (item.recipe || []).reduce((total, line) => {
      const ingredient = ingredients.get(line.ingredientId);
      return total + (ingredient ? Number(line.quantity || 0) * Number(ingredient.unitCost || 0) : 0);
    }, 0);
  }

  function seedDemoSales(store) {
    const baseCounts = [14, 10, 12, 5, 9, 6, 8, 5, 4, 8];
    const weekdayFactors = [0.87, 0.82, 0.91, 1.0, 1.06, 1.2, 1.18];
    const now = todayISO();
    store.sales = [];
    for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
      const date = shiftDate(now, -dayOffset);
      const weekdayFactor = weekdayFactors[dateFromISO(date).getDay()];
      store.menu.forEach((menuItem, itemIndex) => {
        const gentleWave = ((dayOffset * 5 + itemIndex * 3) % 5) - 2;
        const quantity = Math.max(2, Math.round(baseCounts[itemIndex] * weekdayFactor + gentleWave));
        const hour = 11 + ((itemIndex * 3 + dayOffset) % 8);
        store.sales.push({
          id: `sample-${dayOffset}-${menuItem.id}`,
          date,
          quantity,
          unitPrice: Number(menuItem.price),
          unitCostAtSale: Number(itemCost(menuItem, store).toFixed(4)),
          itemId: menuItem.id,
          itemNameAtSale: menuItem.name,
          itemIconAtSale: menuItem.icon,
          createdAt: `${date}T${String(hour).padStart(2, '0')}:15:00`,
        });
      });
    }
  }

  function createDemoStore() {
    const store = createBaseStore();
    store.settings.annualTaxByYear = { [String(new Date().getFullYear())]: 480000 };
    store.menu = cloned(ETHIOPIAN_SAMPLE_MENU);
    seedDemoSales(store);
    return store;
  }

  function dataKey(email) {
    return `${STORE_PREFIX}${String(email || 'demo').toLowerCase()}`;
  }

  function loadStoreFor(email, isDemo = false) {
    let store = safeRead(dataKey(email), null);
    if (!store || !Array.isArray(store.ingredients) || !Array.isArray(store.menu) || !Array.isArray(store.sales)) {
      store = isDemo ? createDemoStore() : createBaseStore();
      safeWrite(dataKey(email), store);
    }
    const savedSettings = store.settings && typeof store.settings === 'object' && !Array.isArray(store.settings)
      ? store.settings
      : {};
    store.settings = {
      ...createBaseStore().settings,
      ...savedSettings,
      annualTaxByYear: savedSettings.annualTaxByYear === undefined
        ? (isDemo ? { [String(new Date().getFullYear())]: 480000 } : {})
        : normalizeAnnualTaxByYear(savedSettings.annualTaxByYear),
      currency: 'ETB',
    };
    if (!Array.isArray(store.sales)) store.sales = [];
    store.calendarEvents = normalizeFastingDays(store.calendarEvents);
    return store;
  }

  function setGoogleSyncState(status, message, lastSyncedAt = googleSyncState.lastSyncedAt) {
    googleSyncState = { status, message, lastSyncedAt };
    const statusElement = $('#google-sync-status', appRoot);
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.dataset.status = status;
    }
    const syncButton = $('[data-google-sync-now]', appRoot);
    if (syncButton) syncButton.disabled = status === 'syncing';
  }

  function googleSessionIsUsable() {
    return Boolean(googleSession?.accessToken && googleSession.email === state.user?.email
      && Date.now() < Number(googleSession.expiresAt || 0) - 30000);
  }

  function scheduleGoogleSync() {
    if (!googleSession || googleSession.email !== state.user?.email || state.user?.isDemo) return;
    setGoogleSyncState('pending', 'Saved on this device. Google Sheets backup will update shortly.');
    window.clearTimeout(googleSyncTimer);
    googleSyncTimer = window.setTimeout(() => {
      if (googleSyncPromise) {
        googleSyncQueued = true;
        return;
      }
      syncGoogleWorkspace({ quiet: true }).catch(() => {});
    }, 1500);
  }

  function normalizeGoogleStore(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const base = createBaseStore();
    const savedSettings = value.settings && typeof value.settings === 'object' && !Array.isArray(value.settings)
      ? value.settings
      : {};
    return {
      ...base,
      ...value,
      settings: {
        ...base.settings,
        ...savedSettings,
        annualTaxByYear: normalizeAnnualTaxByYear(savedSettings.annualTaxByYear),
        currency: 'ETB',
      },
      ingredients: Array.isArray(value.ingredients) ? value.ingredients : [],
      menu: Array.isArray(value.menu) ? value.menu : [],
      sales: Array.isArray(value.sales) ? value.sales : [],
      calendarEvents: normalizeFastingDays(value.calendarEvents),
      updatedAt: value.updatedAt || value.createdAt || new Date().toISOString(),
    };
  }

  function googleBackupTables(store, email) {
    const settings = store.settings || {};
    const annualTax = normalizeAnnualTaxByYear(settings.annualTaxByYear);
    const ingredientById = new Map(store.ingredients.map((ingredient) => [ingredient.id, ingredient]));
    const sortedSales = [...store.sales].sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))
      || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    const saleRows = sortedSales.map((sale) => {
      const quantity = Number(sale.quantity || 0);
      const unitCost = Number(sale.unitCostAtSale ?? itemCost(store.menu.find((item) => item.id === sale.itemId), store));
      const unitPrice = Number(sale.unitPrice || 0);
      return [sale.date || '', sale.createdAt || '', sale.itemNameAtSale || sale.itemId || '', quantity,
        unitPrice, quantity * unitPrice, unitCost, quantity * unitCost, quantity * (unitPrice - unitCost), sale.id || ''];
    });
    const menuRows = store.menu.map((item) => [item.id || '', item.name || '', item.category || '', Number(item.price || 0),
      item.icon || '', item.image || (item.imageData ? 'Custom photo (included in backup snapshot)' : ''), item.recipe?.length || 0,
      itemCost(item, store)]);
    const recipeRows = store.menu.flatMap((item) => (item.recipe || []).map((line) => {
      const ingredient = ingredientById.get(line.ingredientId);
      const quantity = Number(line.quantity || 0);
      return [item.name || '', item.id || '', ingredient?.name || line.ingredientId || '', line.ingredientId || '',
        quantity, ingredient?.unit || '', Number(ingredient?.unitCost || 0), quantity * Number(ingredient?.unitCost || 0)];
    }));
    const datesWithSales = [...new Set(store.sales.map((sale) => sale.date).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))))].sort();
    const dailyRows = datesWithSales.map((date) => {
      const stats = calculateStats(date, date, store);
      return [date, stats.saleCount, stats.quantity, stats.revenue, stats.foodCost, stats.taxes,
        stats.rent, stats.payroll, stats.profit, stats.margin];
    });
    const taxRows = Object.entries(annualTax).sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
      .map(([year, amount]) => [Number(year), amount, 'Manually entered annual tax (ETB)']);
    const fastingRows = store.calendarEvents.map((event) => [event.date, event.traditions.join(', '), event.note || '']);

    return {
      Overview: [
        ['Crave Ledger private workspace backup', ''],
        ['Restaurant', settings.restaurantName || ''],
        ['Owner Google account', email],
        ['Currency', 'ETB'],
        ['Backup prepared at (UTC)', new Date().toISOString()],
        ['Sales entries', store.sales.length],
        ['Menu dishes', store.menu.length],
        ['Ingredients', store.ingredients.length],
        ['Manually tagged fasting dates', store.calendarEvents.length],
        ['Backup details', 'Full restore data is kept in the hidden Backup Snapshot tab.'],
      ],
      Settings: [
        ['Setting', 'Value'],
        ['Restaurant name', settings.restaurantName || ''],
        ['Currency', 'ETB'],
        ['Monthly rent (ETB)', Number(settings.monthlyRent || 0)],
        ['Employee count', Number(settings.employeeCount || 0)],
        ['Monthly payroll (ETB)', Number(settings.monthlyPayroll || 0)],
        ['Open days per month', Number(settings.openDays || 0)],
        ['Annual tax by year (ETB)', JSON.stringify(annualTax)],
      ],
      'Annual Tax': [['Tax year', 'Annual tax (ETB)', 'Entry method'], ...(taxRows.length ? taxRows : [['', '', 'No annual tax entered yet']])],
      Ingredients: [['Ingredient ID', 'Ingredient', 'Group', 'Unit', 'Unit cost (ETB)'],
        ...store.ingredients.map((ingredient) => [ingredient.id || '', ingredient.name || '', ingredient.group || '', ingredient.unit || '', Number(ingredient.unitCost || 0)])],
      Menu: [['Dish ID', 'Dish', 'Category', 'Selling price (ETB)', 'Icon', 'Photo', 'Recipe lines', 'Estimated plate cost (ETB)'], ...menuRows],
      Recipes: [['Dish', 'Dish ID', 'Ingredient', 'Ingredient ID', 'Quantity per serving', 'Unit', 'Unit cost (ETB)', 'Line cost (ETB)'], ...recipeRows],
      Sales: [['Date', 'Recorded at', 'Dish', 'Quantity', 'Price each (ETB)', 'Revenue (ETB)', 'Cost each at sale (ETB)', 'Ingredient cost (ETB)', 'Contribution before overhead (ETB)', 'Sale ID'], ...saleRows],
      'Fasting Calendar': [['Date', 'Manually tagged communities', 'Note'], ...fastingRows],
      'Daily Profit': [['Date', 'Sale entries', 'Items sold', 'Revenue (ETB)', 'Food cost (ETB)', 'Allocated annual tax (ETB)', 'Allocated rent (ETB)', 'Allocated payroll (ETB)', 'Profit (ETB)', 'Margin (%)'], ...dailyRows],
    };
  }

  async function syncGoogleWorkspace({ quiet = true } = {}) {
    if (!googleSession || !state.user || state.user.isDemo || googleSession.email !== state.user.email) {
      throw new Error('Sign in with Google to connect this workspace to its private spreadsheet.');
    }
    if (!googleSessionIsUsable()) {
      setGoogleSyncState('reauth', 'Google access expired. Reconnect Google to continue backing up.');
      throw new Error('Google access expired. Reconnect Google to continue backing up.');
    }
    if (googleSyncPromise) {
      googleSyncQueued = true;
      return googleSyncPromise;
    }

    googleSyncPromise = (async () => {
      do {
        googleSyncQueued = false;
        if (!googleSession || !state.user || googleSession.email !== state.user.email) return;
        const session = googleSession;
        const workspace = cloned(state.store);
        setGoogleSyncState('syncing', 'Updating your private Google Sheets backup…');
        try {
          const result = await window.CraveGoogleSheets.saveWorkspace(
            session.email, session.accessToken, workspace, googleBackupTables(workspace, session.email),
          );
          if (googleSession === session && state.user?.email === session.email) {
            session.spreadsheetId = result.spreadsheetId;
            setGoogleSyncState('synced', `Backed up to your private Google Sheet · ${new Date(result.savedAt).toLocaleString()}`, result.savedAt);
          }
        } catch (error) {
          if (googleSession === session) {
            const message = error.message || 'Google Sheets backup could not be updated.';
            setGoogleSyncState(/expired|reconnect/i.test(message) ? 'reauth' : 'error', message);
          }
          if (!quiet) showToast(error.message || 'Google Sheets backup failed. Your local copy is safe.', 'error');
          throw error;
        }
      } while (googleSyncQueued && googleSession && state.user?.email === googleSession.email);
    })();

    try {
      await googleSyncPromise;
    } finally {
      googleSyncPromise = null;
      if (googleSyncQueued && googleSession && state.user?.email === googleSession.email) {
        googleSyncQueued = false;
        scheduleGoogleSync();
      }
    }
  }

  function saveStore() {
    if (!state.user || !state.store) return;
    state.store.updatedAt = new Date().toISOString();
    safeWrite(dataKey(state.user.email), state.store);
    scheduleGoogleSync();
  }

  function clearGoogleConnection() {
    window.clearTimeout(googleSyncTimer);
    googleSyncTimer = null;
    googleSession = null;
    googleSyncQueued = false;
    setGoogleSyncState('disconnected', 'Sign in to create a private Google Sheets backup.', '');
  }

  function enterDemo() {
    clearGoogleConnection();
    state.user = { email: DEMO_EMAIL, name: 'Hana Bekele', isDemo: true };
    state.store = loadStoreFor(DEMO_EMAIL, true);
    state.page = 'overview';
    state.period = 'today';
    state.selectedDate = todayISO();
    state.accountMenuOpen = false;
    safeWrite(SESSION_KEY, { email: DEMO_EMAIL, name: 'Hana Bekele', isDemo: true });
    try { localStorage.setItem(STARTED_KEY, '1'); } catch { /* local preview can still run without persistence */ }
    renderApp();
  }

  function restoreSession() {
    const session = safeRead(SESSION_KEY, null);
    if (session?.email === DEMO_EMAIL || session?.isDemo) {
      state.user = { email: DEMO_EMAIL, name: 'Hana Bekele', isDemo: true };
      state.store = loadStoreFor(DEMO_EMAIL, true);
      return true;
    }
    if (session?.email && session.provider === 'google') {
      // Google access tokens are intentionally memory-only. Require fresh OAuth
      // before loading a cloud-linked workspace so a blank local starter cannot
      // accidentally overwrite the newest spreadsheet on a returning device.
      return false;
    }
    if (session?.email) {
      const accounts = safeRead(ACCOUNTS_KEY, []);
      const account = Array.isArray(accounts) && accounts.find((entry) => entry.email === session.email);
      if (account) {
        state.user = { email: account.email, name: account.name, isDemo: false };
        state.store = loadStoreFor(account.email, false);
        return true;
      }
    }
    return false;
  }

  function formatMoney(amount, _currency = 'ETB', compact = false) {
    const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    const number = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: compact || Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2,
      notation: compact ? 'compact' : 'standard',
    }).format(value);
    return `ETB ${number}`;
  }

  function formatPercent(value, digits = 1) {
    return `${Number(value || 0).toFixed(digits)}%`;
  }

  function getDateRange(period = state.period, selectedDate = state.selectedDate) {
    if (period === 'week') return { start: shiftDate(selectedDate, -6), end: selectedDate };
    if (period === 'month') {
      const date = dateFromISO(selectedDate);
      return { start: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`, end: selectedDate };
    }
    return { start: selectedDate, end: selectedDate };
  }

  function annualTaxForYear(year, store = state.store) {
    if (!store) return 0;
    const amount = Number(store.settings.annualTaxByYear?.[String(year)] || 0);
    return Number.isFinite(amount) ? Math.max(0, amount) : 0;
  }

  function annualTaxForRange(start, end, store = state.store) {
    if (!store) return 0;
    const endDate = dateFromISO(end);
    let cursor = dateFromISO(start);
    if (cursor > endDate) return 0;
    let total = 0;
    while (cursor <= endDate) {
      const year = cursor.getFullYear();
      const monthEnd = new Date(year, cursor.getMonth() + 1, 0, 12, 0, 0, 0);
      const segmentEnd = monthEnd < endDate ? monthEnd : endDate;
      const daysInMonth = monthEnd.getDate();
      const monthlyOpenDays = Math.max(1, Math.min(daysInMonth, Number(store.settings.openDays || 30)));
      const allocatedDays = Math.min(rangeDayCount(toISO(cursor), toISO(segmentEnd)), monthlyOpenDays);
      total += (annualTaxForYear(year, store) / 12) * allocatedDays / monthlyOpenDays;
      cursor = dateFromISO(shiftDate(toISO(segmentEnd), 1));
    }
    return total;
  }

  function calculateStats(start, end, store = state.store) {
    if (!store) return { revenue: 0, foodCost: 0, taxes: 0, rent: 0, payroll: 0, costs: 0, profit: 0, margin: 0, quantity: 0, days: 1 };
    const settings = store.settings;
    const days = rangeDayCount(start, end);
    const openDays = Math.max(1, Number(settings.openDays || 30));
    const allocatedDays = Math.min(days, openDays);
    const matching = store.sales.filter((sale) => sale.date >= start && sale.date <= end);
    let revenue = 0;
    let foodCost = 0;
    const taxes = annualTaxForRange(start, end, store);
    let quantity = 0;
    for (const sale of matching) {
      const qty = Number(sale.quantity || 0);
      const lineRevenue = qty * Number(sale.unitPrice || 0);
      revenue += lineRevenue;
      foodCost += qty * Number(sale.unitCostAtSale ?? itemCost(store.menu.find((item) => item.id === sale.itemId), store));
      quantity += qty;
    }
    const rent = Number(settings.monthlyRent || 0) * allocatedDays / openDays;
    const payroll = Number(settings.monthlyPayroll || 0) * allocatedDays / openDays;
    const costs = foodCost + taxes + rent + payroll;
    const profit = revenue - costs;
    return { revenue, foodCost, taxes, rent, payroll, costs, profit, margin: revenue ? profit / revenue * 100 : 0, quantity, days, allocatedDays, saleCount: matching.length };
  }

  function statsForPeriod(period = state.period, selectedDate = state.selectedDate) {
    const range = getDateRange(period, selectedDate);
    return { ...calculateStats(range.start, range.end), ...range };
  }

  function statsForDay(date) {
    return calculateStats(date, date);
  }

  function menuMetrics(item) {
    const cost = itemCost(item);
    const profit = Number(item.price || 0) - cost;
    return { cost, profit, margin: Number(item.price || 0) ? profit / Number(item.price) * 100 : 0 };
  }

  function initials(name) {
    return String(name || 'Owner').trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('') || 'O';
  }

  function brandMarkup() {
    return `<a class="brand-lockup" href="#overview" data-route="overview" aria-label="Crave Ledger overview">
      <span class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 6l14 12M19 6 5 18" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="12" r="2.1" fill="currentColor"/></svg></span>
      <span class="brand-type"><span>CRAVE</span><small>OWNER'S DESK</small></span>
    </a>`;
  }

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'sales', label: 'Sales', icon: 'sales' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'menu', label: 'Menu & recipes', icon: 'menu' },
    { id: 'costs', label: 'Costs', icon: 'costs' },
    { id: 'insights', label: 'Insights', icon: 'insights' },
  ];

  function navMarkup(mobile = false) {
    return NAV_ITEMS.map((item) => `<button class="nav-item ${state.page === item.id ? 'active' : ''}" data-route="${item.id}" aria-label="${item.label}" ${state.page === item.id ? 'aria-current="page"' : ''}>
      <span class="nav-icon">${icon(item.icon, mobile ? 21 : 19)}</span><span class="nav-label">${item.label}</span>
    </button>`).join('');
  }

  function accountMenuMarkup() {
    if (!state.accountMenuOpen) return '';
    return `<div class="account-popover" role="menu">
      <div class="popover-profile"><span class="avatar avatar-large">${escapeHTML(initials(state.user.name))}</span><div><strong>${escapeHTML(state.user.name)}</strong><span>${escapeHTML(state.user.email)}</span></div></div>
      <div class="popover-workspace"><span class="status-dot"></span>${state.user.isDemo ? 'Sample workspace' : 'Personal workspace'}<span class="local-badge">ON DEVICE</span></div>
      <button class="popover-action" data-account-settings>${icon('settings', 17)}<span>Account & data</span>${icon('chevron', 16)}</button>
      <button class="popover-action signout-action" data-signout>${icon('logout', 17)}<span>Sign out</span></button>
    </div>`;
  }

  function shellTopbar() {
    return `<header class="app-topbar">
      <div class="mobile-brand">${brandMarkup()}<span class="mobile-demo-tag">${state.user.isDemo ? 'DEMO' : 'LIVE'}</span></div>
      <div class="topbar-spacer"></div>
      <button class="topbar-quick" data-open-sale aria-label="Log a sale" title="Log a sale">${icon('plus', 17)}<span>Log sale</span></button>
      <div class="account-anchor">
        <button class="account-button" data-account-toggle aria-expanded="${state.accountMenuOpen}" aria-label="Open account menu">
          <span class="avatar">${escapeHTML(initials(state.user.name))}</span><span class="account-button-copy"><strong>${escapeHTML(state.user.name.split(' ')[0])}</strong><small>${state.user.isDemo ? 'Demo owner' : 'Restaurant owner'}</small></span>${icon('down', 15, 'account-chevron')}
        </button>${accountMenuMarkup()}
      </div>
    </header>`;
  }

  function sidebarMarkup() {
    return `<aside class="sidebar">
      ${brandMarkup()}
      <div class="sidebar-section-label">WORKSPACE</div>
      <nav class="sidebar-nav" aria-label="Main navigation">${navMarkup()}</nav>
      <div class="sidebar-bottom">
        <div class="sidebar-help"><span class="help-orb">${icon('sparkle', 17)}</span><div><strong>Make every plate count.</strong><small>Costs, sales & clear next steps.</small></div></div>
        <button class="sidebar-settings ${state.page === 'settings' ? 'active' : ''}" data-route="settings">${icon('settings', 18)}<span>Account & data</span></button>
        <div class="sidebar-user"><span class="avatar">${escapeHTML(initials(state.user.name))}</span><div class="sidebar-user-copy"><strong>${escapeHTML(state.user.name)}</strong><small>${escapeHTML(state.store.settings.restaurantName)}</small></div><button class="sidebar-more" data-account-toggle aria-label="Account menu">${icon('more', 19)}</button></div>
      </div>
    </aside>`;
  }

  function renderApp() {
    if (!state.user || !state.store) return renderAuth();
    const pages = {
      overview: renderDashboard,
      sales: renderSales,
      calendar: renderCalendar,
      menu: renderMenu,
      costs: renderCosts,
      insights: renderInsights,
      settings: renderSettings,
    };
    const page = (pages[state.page] || renderDashboard)();
    appRoot.innerHTML = `<div class="app-shell">
      ${sidebarMarkup()}
      <div class="workspace">
        ${shellTopbar()}
        <main class="page-content" id="main-content">${page}</main>
        <footer class="app-footer"><span>Made for the people behind the pass.</span><span>${googleSessionIsUsable() ? 'On this device + your private Google Sheet' : 'Numbers stay on this device'} <i class="footer-dot"></i> Crave Ledger · v${APP_VERSION}</span></footer>
      </div>
      <nav class="mobile-nav" aria-label="Main navigation">${navMarkup(true)}</nav>
    </div>`;
    bindAppEvents();
    setupPageReveals();
    syncEthiopianGreetingClock();
  }

  function setupPageReveals() {
    pageRevealObserver?.disconnect();
    pageRevealObserver = null;
    const content = $('#main-content', appRoot);
    if (!content || !('IntersectionObserver' in window) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    pageRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
    [...content.children].forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 32, 128)}ms`);
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.classList.add('is-revealed');
      } else {
        pageRevealObserver.observe(element);
      }
    });
  }

  function syncEthiopianGreetingClock() {
    const updateGreeting = () => {
      const greeting = $('#dashboard-greeting', appRoot);
      if (!greeting) {
        if (ethiopianGreetingTimer !== null) window.clearInterval(ethiopianGreetingTimer);
        ethiopianGreetingTimer = null;
        return;
      }
      greeting.textContent = `${greetingForEthiopianTime()}, ${greeting.dataset.name}.`;
    };
    updateGreeting();
    if ($('#dashboard-greeting', appRoot) && ethiopianGreetingTimer === null) {
      ethiopianGreetingTimer = window.setInterval(updateGreeting, 60_000);
    }
  }

  function renderPageHeading(eyebrow, title, description, actions = '') {
    return `<div class="page-heading"><div class="page-heading-copy"><div class="eyebrow"><span class="eyebrow-dot"></span>${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="page-heading-actions">${actions}</div></div>`;
  }

  function periodToggleMarkup() {
    return `<div class="period-toggle" role="group" aria-label="Report period">
      <button data-period="today" class="${state.period === 'today' ? 'active' : ''}">Today</button>
      <button data-period="week" class="${state.period === 'week' ? 'active' : ''}">7 days</button>
      <button data-period="month" class="${state.period === 'month' ? 'active' : ''}">Month</button>
    </div>`;
  }

  function dateControlMarkup() {
    const label = state.selectedDate === todayISO() ? 'Today' : dateLabel(state.selectedDate, { month: 'short', day: 'numeric', year: 'numeric' });
    return `<label class="date-control" aria-label="Choose report end date">${icon('calendar', 17)}<span>${label}</span>${icon('down', 14)}<input type="date" id="date-picker" value="${state.selectedDate}" aria-label="Choose a date" /></label>`;
  }

  function trendPercent(current, previous) {
    if (!Number.isFinite(previous) || Math.abs(previous) < 0.01) return current >= 0 ? 0 : -100;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  function trendSparkline(values) {
    const max = Math.max(1, ...values);
    const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${26 - (Math.max(0, value) / max) * 21}`).join(' ');
    return `<svg class="mini-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="100" cy="${26 - (Math.max(0, values.at(-1) || 0) / max) * 21}" r="2.2" fill="currentColor"/></svg>`;
  }

  function renderDashboard() {
    const stats = statsForPeriod();
    const todayStats = statsForDay(state.selectedDate);
    const previousRangeEnd = shiftDate(state.selectedDate, state.period === 'week' ? -7 : -1);
    const selectedCalendarDate = dateFromISO(state.selectedDate);
    const previousMonthEndDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 0, 12);
    const previousMonthDay = Math.min(selectedCalendarDate.getDate(), previousMonthEndDate.getDate());
    const previousMonthDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() - 1, previousMonthDay, 12);
    const previousMonthISO = toISO(previousMonthDate);
    const previousRange = state.period === 'month'
      ? { start: `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}-01`, end: previousMonthISO }
      : state.period === 'week'
        ? { start: shiftDate(state.selectedDate, -13), end: shiftDate(state.selectedDate, -7) }
        : { start: previousRangeEnd, end: previousRangeEnd };
    const previous = calculateStats(previousRange.start, previousRange.end);
    const profitTrend = trendPercent(stats.profit, previous.profit);
    const rangeText = state.period === 'today'
      ? dateLabel(state.selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })
      : state.period === 'week'
        ? `${dateLabel(stats.start, { month: 'short', day: 'numeric' })} – ${dateLabel(stats.end, { month: 'short', day: 'numeric' })}`
        : dateFromISO(state.selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const periodName = state.period === 'today' ? 'TODAY' : state.period === 'week' ? 'LAST 7 DAYS' : 'MONTH TO DATE';
    const chartData = Array.from({ length: 7 }, (_, index) => {
      const date = shiftDate(state.selectedDate, index - 6);
      return { date, ...statsForDay(date) };
    });
    const previousSeven = Array.from({ length: 7 }, (_, index) => statsForDay(shiftDate(state.selectedDate, index - 13)));
    const bestInsight = getInsights()[0];
    const latestSales = [...state.store.sales].sort((a, b) => `${b.date}${b.createdAt || ''}`.localeCompare(`${a.date}${a.createdAt || ''}`)).slice(0, 5);
    const costSummary = [
      { name: 'Ingredients', value: stats.foodCost, color: '#ec683d' },
      { name: 'Payroll', value: stats.payroll, color: '#8768c5' },
      { name: 'Rent', value: stats.rent, color: '#f2b957' },
      { name: 'Tax reserve', value: stats.taxes, color: '#54a982' },
    ];
    const totalCosts = costSummary.reduce((sum, part) => sum + part.value, 0);
    const periodSales = stats.revenue;
    const periodLabel = state.period === 'today' ? 'for this day' : state.period === 'week' ? 'across 7 days' : 'so far this month';
    const lead = state.user.name.split(' ')[0];

    return `${renderPageHeading(`${escapeHTML(state.store.settings.restaurantName)} · ${rangeText}`, `<span id="dashboard-greeting" data-name="${escapeHTML(lead)}">${greetingForEthiopianTime()}, ${escapeHTML(lead)}.</span>`, `A fresh look at what's coming in, going out, and staying yours.`, `<div class="dashboard-filters">${periodToggleMarkup()}${dateControlMarkup()}</div>`)}
      ${state.user.isDemo ? `<div class="demo-note">${icon('info', 15)}<span>Sample numbers, ready to explore.</span><button data-create-account>Make it yours ${icon('arrowRight', 14)}</button></div>` : ''}
      <section class="profit-banner" aria-label="Profit summary">
        <div class="profit-banner-main">
          <div class="profit-banner-label"><span class="profit-bullet"></span> NET PROFIT <span class="profit-separator">/</span> ${periodName}</div>
          <div class="profit-amount">${formatMoney(stats.profit)}</div>
          <div class="profit-banner-meta">
            <span class="trend-chip ${profitTrend >= 0 ? 'positive' : 'negative'}">${icon(profitTrend >= 0 ? 'arrowUpRight' : 'arrowDown', 13)} ${Math.abs(profitTrend).toFixed(1)}%</span>
            <span>${profitTrend >= 0 ? 'up' : 'down'} from the prior period</span>
            <span class="meta-divider"></span><span>${formatPercent(stats.margin)} margin</span>
          </div>
        </div>
        <div class="profit-banner-side">
          <div class="banner-side-cell"><span>SALES ${periodLabel.toUpperCase()}</span><strong>${formatMoney(stats.revenue)}</strong></div>
          <div class="banner-side-cell"><span>PROFIT PER DAY</span><strong>${formatMoney(stats.profit / Math.max(1, stats.days))}</strong></div>
          ${trendSparkline(chartData.map((day) => day.profit))}
        </div>
        <div class="profit-decoration" aria-hidden="true"><span></span><span></span><span></span></div>
      </section>

      <section class="metric-grid" aria-label="Business metrics">
        ${metricCard('Sales', formatMoney(stats.revenue), `${stats.quantity.toLocaleString()} plates & drinks`, 'sales', 'orange', `${stats.saleCount} menu lines`)}
        ${metricCard('Ingredient spend', formatMoney(stats.foodCost), `${stats.revenue ? formatPercent(stats.foodCost / stats.revenue * 100) : '0%'} of sales`, 'package', 'purple', 'recipe-based cost')}
        ${metricCard('Rent + payroll', formatMoney(stats.rent + stats.payroll), 'Allocated monthly overhead', 'bank', 'butter', 'fixed costs')}
        ${metricCard('Tax reserve', formatMoney(stats.taxes), 'Annual tax allocated here', 'bank', 'mint', 'allocated share')}
      </section>

      <section class="dashboard-panels">
        <article class="panel chart-panel">
          <div class="panel-heading"><div><div class="eyebrow">THE LAST FEW SERVICES</div><h2>Sales & costs</h2><p>Daily totals ending ${dateLabel(state.selectedDate, { month: 'short', day: 'numeric' })}</p></div><span class="panel-icon orange-icon">${icon('chart', 18)}</span></div>
          ${renderTrendChart(chartData)}
          <div class="chart-legend"><span><i class="legend-dot sales-dot"></i>Sales</span><span><i class="legend-dot costs-dot"></i>Total costs</span><span class="chart-legend-note">${formatMoney(todayStats.profit)} profit ${state.selectedDate === todayISO() ? 'today' : 'on selected day'}</span></div>
        </article>
        <article class="panel breakdown-panel">
          <div class="panel-heading"><div><div class="eyebrow">WHERE IT GOES</div><h2>Cost breakdown</h2><p>${state.period === 'today' ? 'Your costs today' : `Your costs ${periodLabel}`}</p></div><span class="panel-icon purple-icon">${icon('chart', 18)}</span></div>
          <div class="donut-layout">
            ${renderDonut(costSummary, totalCosts)}
            <div class="breakdown-list">${costSummary.map((part) => `<div class="breakdown-row"><span class="breakdown-label"><i style="--part-color:${part.color}"></i>${part.name}</span><strong>${formatMoney(part.value)}</strong></div>`).join('')}</div>
          </div>
          <div class="breakdown-foot"><span>Total costs</span><strong>${formatMoney(totalCosts)}</strong></div>
        </article>
      </section>

      <section class="dashboard-lower">
        <article class="panel recent-panel">
          <div class="panel-heading"><div><div class="eyebrow">ON THE BOOKS</div><h2>Recent sales</h2><p>Your latest menu movement</p></div><button class="text-button" data-route="sales">All sales ${icon('arrowRight', 15)}</button></div>
          ${latestSales.length ? `<div class="recent-list">${latestSales.map((sale) => renderRecentSale(sale)).join('')}</div>` : emptyState('No sales logged yet', 'Add your first sale to see daily profit come to life.', 'Log a sale', 'open-sale')}
        </article>
        <article class="panel insight-teaser">
          <div class="insight-card-top"><span class="insight-orb">${icon('sparkle', 20)}</span><span class="insight-label">A SMART LITTLE NUDGE</span><span class="insight-rule">BASED ON YOUR DATA</span></div>
          <h2>${escapeHTML(bestInsight.title)}</h2><p>${escapeHTML(bestInsight.body)}</p>
          <div class="insight-teaser-bottom"><span class="insight-confident"><i></i>Made for ${escapeHTML(state.store.settings.restaurantName)}</span><button class="round-arrow" data-route="insights" aria-label="Read all insights">${icon('arrowRight', 17)}</button></div>
        </article>
      </section>
      <div class="formula-note">${icon('info', 14)} Daily profit includes recipe ingredients, allocated annual tax, and a fair share of rent and payroll.</div>`;
  }

  function metricCard(label, value, note, iconName, tone, tag) {
    return `<article class="metric-card"><div class="metric-card-top"><span>${label}</span><span class="metric-icon ${tone}">${icon(iconName, 17)}</span></div><strong class="metric-value">${value}</strong><div class="metric-card-bottom"><span>${note}</span><span class="metric-tag">${tag}</span></div></article>`;
  }

  function renderTrendChart(days) {
    const width = 740;
    const height = 220;
    const left = 56;
    const right = 14;
    const top = 16;
    const bottom = 30;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const maxValue = Math.max(10, ...days.flatMap((day) => [day.revenue, day.costs])) * 1.18;
    const x = (index) => left + (innerWidth * index / Math.max(1, days.length - 1));
    const y = (value) => top + innerHeight - (Math.max(0, value) / maxValue) * innerHeight;
    const pointsFor = (key) => days.map((day, index) => `${x(index).toFixed(1)},${y(day[key]).toFixed(1)}`);
    const salesPoints = pointsFor('revenue');
    const costPoints = pointsFor('costs');
    const salesPath = `M ${salesPoints.join(' L ')}`;
    const costsPath = `M ${costPoints.join(' L ')}`;
    const salesArea = `${salesPath} L ${x(days.length - 1).toFixed(1)},${(top + innerHeight).toFixed(1)} L ${x(0).toFixed(1)},${(top + innerHeight).toFixed(1)} Z`;
    const lines = [0, 0.33, 0.66, 1].map((portion) => {
      const value = maxValue * portion;
      const lineY = y(value);
      return `<g><line x1="${left}" y1="${lineY}" x2="${width - right}" y2="${lineY}" stroke="#f0eae5" stroke-dasharray="3 5"/><text x="0" y="${lineY + 4}" fill="#a59a94" font-size="10">${formatMoney(value, state.store.settings.currency, true)}</text></g>`;
    }).join('');
    const xLabels = days.map((day, index) => `<text x="${x(index)}" y="${height - 5}" text-anchor="middle" fill="#a59a94" font-size="10">${dateLabel(day.date, { weekday: 'short' })}</text>`).join('');
    const circles = days.map((day, index) => `<circle cx="${x(index)}" cy="${y(day.revenue)}" r="3.7" fill="#fff" stroke="#ec683d" stroke-width="2"/><circle cx="${x(index)}" cy="${y(day.costs)}" r="3.2" fill="#fff" stroke="#8c70c8" stroke-width="2"/>`).join('');
    return `<div class="chart-wrap"><svg class="trend-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Sales and costs over seven days">${lines}<defs><linearGradient id="salesAreaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#ec683d" stop-opacity=".14"/><stop offset="100%" stop-color="#ec683d" stop-opacity="0"/></linearGradient></defs><path d="${salesArea}" fill="url(#salesAreaFill)"/><path d="${salesPath}" fill="none" stroke="#ec683d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${costsPath}" fill="none" stroke="#8c70c8" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="5 5"/>${circles}${xLabels}</svg></div>`;
  }

  function renderDonut(parts, total) {
    if (total <= 0) return `<div class="donut-chart donut-empty"><div class="donut-hole"><strong>${formatMoney(0, state.store.settings.currency, true)}</strong><span>costs</span></div></div>`;
    let cursor = 0;
    const stops = parts.map((part) => {
      const start = cursor;
      cursor += part.value / total * 100;
      return `${part.color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
    }).join(', ');
    return `<div class="donut-chart" style="background:conic-gradient(${stops})"><div class="donut-hole"><strong>${formatMoney(total, state.store.settings.currency, true)}</strong><span>total cost</span></div></div>`;
  }

  function dishThumbMarkup(item, className = 'dish-thumb', fallbackName = item?.name || 'Ethiopian dish') {
    const source = item?.imageData || item?.image || '';
    const visual = source
      ? `<img src="${escapeHTML(source)}" alt="${escapeHTML(fallbackName)} photo" loading="lazy" />`
      : escapeHTML(item?.icon || '🍽️');
    return `<span class="${className} ${item?.tone || 'peach'} ${source ? 'photo-thumb' : ''}">${visual}</span>`;
  }

  function renderRecentSale(sale) {
    const item = state.store.menu.find((entry) => entry.id === sale.itemId);
    const name = sale.itemNameAtSale || item?.name || 'Menu item';
    const visualItem = item || { icon: sale.itemIconAtSale || '🍽️', tone: 'peach' };
    const lineRevenue = Number(sale.quantity) * Number(sale.unitPrice);
    return `<div class="recent-row">${dishThumbMarkup(visualItem, `dish-thumb ${visualItem.tone || 'peach'}`, name)}<div class="recent-copy"><strong>${escapeHTML(name)}</strong><span>${dateLabel(sale.date)} <i>·</i> ${Number(sale.quantity).toLocaleString()} sold</span></div><strong class="recent-amount">${formatMoney(lineRevenue)}</strong></div>`;
  }

  function emptyState(title, body, actionLabel, action) {
    const attributes = action === 'open-sale' ? 'data-open-sale' : action === 'add-menu' ? 'data-add-menu' : action === 'add-ingredient' ? 'data-add-ingredient' : '';
    return `<div class="empty-state"><span class="empty-orb">${icon('bowl', 23)}</span><strong>${title}</strong><p>${body}</p><button class="secondary-button" ${attributes}>${actionLabel}</button></div>`;
  }

  function renderSales() {
    const stats = statsForPeriod();
    const sales = [...state.store.sales]
      .filter((sale) => sale.date >= stats.start && sale.date <= stats.end)
      .sort((a, b) => `${b.date}${b.createdAt || ''}`.localeCompare(`${a.date}${a.createdAt || ''}`));
    const actions = `<div class="dashboard-filters">${periodToggleMarkup()}${dateControlMarkup()}<button class="primary-button compact-button" data-open-sale>${icon('plus', 16)}<span>Log sale</span></button></div>`;
    const rows = sales.map((sale) => {
      const menuItem = state.store.menu.find((item) => item.id === sale.itemId);
      const revenue = Number(sale.quantity) * Number(sale.unitPrice);
      const food = Number(sale.quantity) * Number(sale.unitCostAtSale ?? itemCost(menuItem));
      const contribution = revenue - food;
      const itemName = sale.itemNameAtSale || menuItem?.name || 'Menu item';
      const visualItem = menuItem || { icon: sale.itemIconAtSale || '🍽️', tone: 'peach' };
      return `<tr><td><span class="table-date">${dateLabel(sale.date, { month: 'short', day: 'numeric' })}</span></td><td><div class="table-dish">${dishThumbMarkup(visualItem, 'dish-thumb small-thumb', itemName)}<span>${escapeHTML(itemName)}</span></div></td><td>${Number(sale.quantity).toLocaleString()}</td><td class="numeric-cell">${formatMoney(revenue)}</td><td class="numeric-cell muted-cell">${formatMoney(food)}</td><td class="numeric-cell contribution-cell">${formatMoney(contribution)}</td><td><button class="table-delete" data-delete-sale="${escapeHTML(sale.id)}" aria-label="Delete sale">${icon('trash', 15)}</button></td></tr>`;
    }).join('');
    const mobileRows = sales.map((sale) => {
      const menuItem = state.store.menu.find((item) => item.id === sale.itemId);
      const revenue = Number(sale.quantity) * Number(sale.unitPrice);
      const food = Number(sale.quantity) * Number(sale.unitCostAtSale ?? itemCost(menuItem));
      const contribution = revenue - food;
      const visualItem = menuItem || { icon: sale.itemIconAtSale || '🍽️', tone: 'peach' };
      const itemName = sale.itemNameAtSale || menuItem?.name || 'Menu item';
      return `<article class="sale-mobile-card"><div class="sale-mobile-main">${dishThumbMarkup(visualItem, 'dish-thumb small-thumb', itemName)}<div><strong>${escapeHTML(itemName)}</strong><small>${dateLabel(sale.date, { month: 'short', day: 'numeric' })} · ${Number(sale.quantity)} sold</small></div><button class="table-delete" data-delete-sale="${escapeHTML(sale.id)}" aria-label="Delete sale">${icon('trash', 15)}</button></div><div class="sale-mobile-meta"><span>Sales <b>${formatMoney(revenue)}</b></span><span>Ingredients <b>${formatMoney(food)}</b></span><span>After food <b class="contribution-cell">${formatMoney(contribution)}</b></span></div></article>`;
    }).join('');

    return `${renderPageHeading('INCOME & DAILY LOG', 'Sales, accounted for.', `Every plate sold adds a clearer picture of your day at ${escapeHTML(state.store.settings.restaurantName)}.`, actions)}
      <section class="sales-summary-grid">
        ${summaryTile('Sales recorded', formatMoney(stats.revenue), `${stats.quantity.toLocaleString()} items sold`, 'orange')}
        ${summaryTile('Ingredient cost', formatMoney(stats.foodCost), 'From each saved recipe', 'purple')}
        ${summaryTile('After food + tax', formatMoney(stats.revenue - stats.foodCost - stats.taxes), 'Before rent & payroll share', 'mint')}
      </section>
      <section class="panel sales-table-panel">
        <div class="panel-heading sales-table-heading"><div><div class="eyebrow">${state.period === 'today' ? 'DAILY ACTIVITY' : state.period === 'week' ? '7-DAY ACTIVITY' : 'MONTH-TO-DATE ACTIVITY'}</div><h2>Sale entries <span class="count-pill">${sales.length}</span></h2></div><span class="table-period-note">${dateLabel(stats.start, { month: 'short', day: 'numeric' })}${stats.start !== stats.end ? ` – ${dateLabel(stats.end, { month: 'short', day: 'numeric' })}` : ''}</span></div>
        ${sales.length ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>DATE</th><th>MENU ITEM</th><th>QTY</th><th class="numeric-cell">SALES</th><th class="numeric-cell">FOOD COST</th><th class="numeric-cell">AFTER FOOD</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="sales-mobile-list">${mobileRows}</div>` : emptyState('Nothing logged in this period', 'Add a menu item and quantity. We’ll work out the ingredient cost, annual tax share, and profit for you.', 'Log a sale', 'open-sale')}
      </section>
      <div class="formula-note">${icon('info', 14)} Sale contribution subtracts recipe cost. Daily profit also includes annual tax allocation, rent, and payroll.</div>`;
  }

  function shiftCalendarMonth(month, amount) {
    const [yearValue, monthValue] = String(month || todayISO().slice(0, 7)).split('-').map(Number);
    const shifted = new Date(yearValue || new Date().getFullYear(), (monthValue || 1) - 1 + Number(amount || 0), 1, 12);
    return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
  }

  function calendarSalesForMonth(month) {
    const salesByDate = new Map();
    state.store.sales.forEach((sale) => {
      if (!String(sale.date || '').startsWith(`${month}-`)) return;
      const day = salesByDate.get(sale.date) || { revenue: 0, entries: 0, quantity: 0 };
      const quantity = Number(sale.quantity || 0);
      day.revenue += quantity * Number(sale.unitPrice || 0);
      day.entries += 1;
      day.quantity += quantity;
      salesByDate.set(sale.date, day);
    });
    return salesByDate;
  }

  function compareFastingSales(salesByDate, fastingByDate) {
    const comparison = {
      fasting: { total: 0, days: 0, average: 0 },
      other: { total: 0, days: 0, average: 0 },
    };
    salesByDate.forEach((day, date) => {
      const group = fastingByDate.has(date) ? comparison.fasting : comparison.other;
      group.total += day.revenue;
      group.days += 1;
    });
    Object.values(comparison).forEach((group) => {
      group.average = group.days ? group.total / group.days : 0;
    });
    return comparison;
  }

  function renderCalendar() {
    const month = /^\d{4}-\d{2}$/.test(state.calendarMonth || '') ? state.calendarMonth : todayISO().slice(0, 7);
    state.calendarMonth = month;
    const [year, monthNumber] = month.split('-').map(Number);
    const monthIndex = monthNumber - 1;
    const monthDate = new Date(year, monthIndex, 1, 12);
    const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate();
    const firstWeekday = new Date(year, monthIndex, 1, 12).getDay();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const fastingEvents = normalizeFastingDays(state.store.calendarEvents).filter((entry) => entry.date.startsWith(`${month}-`));
    const fastingByDate = new Map(fastingEvents.map((entry) => [entry.date, entry]));
    const salesByDate = calendarSalesForMonth(month);
    const comparison = compareFastingSales(salesByDate, fastingByDate);
    if (!state.calendarSelectedDate?.startsWith(`${month}-`)) state.calendarSelectedDate = `${month}-01`;
    const selectedDate = state.calendarSelectedDate;
    const selectedEvent = fastingByDate.get(selectedDate);
    const selectedSales = salesByDate.get(selectedDate);
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayMarkup = weekdayNames.map((day) => `<span class="calendar-weekday">${day}</span>`).join('');
    const cellMarkup = Array.from({ length: cellCount }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) return '<span class="calendar-day calendar-day-empty" aria-hidden="true"></span>';
      const date = `${month}-${String(dayNumber).padStart(2, '0')}`;
      const dayEvent = fastingByDate.get(date);
      const daySales = salesByDate.get(date);
      const tags = [
        dayEvent?.traditions.includes('orthodox') ? { code: 'O', label: 'Orthodox', fullLabel: 'Orthodox Christian', className: 'orthodox' } : null,
        dayEvent?.traditions.includes('muslim') ? { code: 'M', label: 'Muslim', fullLabel: 'Muslim', className: 'muslim' } : null,
      ].filter(Boolean);
      const tagsMarkup = tags.map((tag) => `<span class="calendar-fast-tag ${tag.className}" title="${tag.fullLabel} fasting"><b>${tag.code}</b><span>${tag.label}</span></span>`).join('');
      const tagsDescription = tags.length ? `${tags.map((tag) => tag.fullLabel).join(' and ')} fasting` : 'no fasting tag';
      const salesDescription = daySales ? `sales ${formatMoney(daySales.revenue)}` : 'no sales logged';
      const dateDescription = `${dateLabel(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${tagsDescription}, ${salesDescription}`;
      const compactSales = daySales
        ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(daySales.revenue)
        : '—';
      return `<button type="button" class="calendar-day ${dayEvent ? 'has-fasting' : ''} ${date === selectedDate ? 'selected' : ''} ${date === todayISO() ? 'is-today' : ''}" data-calendar-date="${date}" aria-label="${escapeHTML(dateDescription)}" aria-pressed="${date === selectedDate}">
        <span class="calendar-day-top"><span class="calendar-day-number">${dayNumber}</span><span class="calendar-fast-tags">${tagsMarkup}</span></span>
        <span class="calendar-day-sales">${compactSales}</span>
        <span class="calendar-day-entries">${daySales ? `${daySales.entries} ${daySales.entries === 1 ? 'entry' : 'entries'}` : 'No sales'}</span>
      </button>`;
    }).join('');
    const fastingAverage = comparison.fasting.days ? formatMoney(comparison.fasting.average) : '—';
    const otherAverage = comparison.other.days ? formatMoney(comparison.other.average) : '—';
    const orthodoxChecked = selectedEvent?.traditions.includes('orthodox') ? 'checked' : '';
    const muslimChecked = selectedEvent?.traditions.includes('muslim') ? 'checked' : '';
    const traditionSummary = selectedEvent?.traditions.map((tradition) => tradition === 'orthodox' ? 'Orthodox Christian' : 'Muslim').join(' + ') || 'No fasting tags';
    const actions = `<span class="calendar-heading-hint">${icon('info', 15)} Manual dates only</span>`;

    return `${renderPageHeading('COMMUNITY & SALES CALENDAR', 'Mark the days that shape demand.', 'Manually tag Orthodox Christian and Muslim fasting days, then compare them with your recorded sales. Dates are never auto-generated.', actions)}
      <section class="calendar-summary-grid" aria-label="Fasting day sales comparison">
        <article class="calendar-summary-card"><span class="calendar-summary-label">Marked fasting dates</span><strong>${fastingEvents.length}</strong><small>in ${escapeHTML(monthLabel)}</small></article>
        <article class="calendar-summary-card fasting-summary"><span class="calendar-summary-label">Average sales on tagged days</span><strong>${fastingAverage}</strong><small>${comparison.fasting.days} days with recorded sales</small></article>
        <article class="calendar-summary-card"><span class="calendar-summary-label">Average sales on other days</span><strong>${otherAverage}</strong><small>${comparison.other.days} days with recorded sales</small></article>
      </section>
      <section class="calendar-layout">
        <article class="panel calendar-board">
          <div class="calendar-board-heading"><div><div class="eyebrow">DAILY SALES · ETB</div><h2>${escapeHTML(monthLabel)}</h2><p>Choose a date to add or edit its fasting tags.</p></div><div class="calendar-month-actions"><button type="button" class="calendar-month-arrow" data-calendar-shift="-1" aria-label="Previous month">${icon('chevron', 16, 'calendar-chevron-prev')}</button><button type="button" class="calendar-today-button" data-calendar-today>Today</button><button type="button" class="calendar-month-arrow" data-calendar-shift="1" aria-label="Next month">${icon('chevron', 16)}</button></div></div>
          <div class="calendar-weekdays" aria-hidden="true">${weekdayMarkup}</div>
          <div class="calendar-grid" role="group" aria-label="${escapeHTML(monthLabel)} calendar">${cellMarkup}</div>
          <div class="calendar-legend"><span><i class="calendar-legend-dot orthodox"></i>O · Orthodox Christian</span><span><i class="calendar-legend-dot muslim"></i>M · Muslim</span><span class="calendar-legend-etb">Daily sales shown in ETB</span></div>
        </article>
        <aside class="panel fasting-editor">
          <div class="fasting-editor-heading"><span class="fasting-editor-icon">${icon('calendar', 18)}</span><div><div class="eyebrow">MANUAL FASTING LOG</div><h2>Mark a fasting day</h2></div></div>
          <div class="calendar-selected-summary"><span>${escapeHTML(dateLabel(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}</span><strong>${selectedSales ? formatMoney(selectedSales.revenue) : 'No sales recorded'}</strong><small>${selectedSales ? `${selectedSales.entries} sale ${selectedSales.entries === 1 ? 'entry' : 'entries'} · ${selectedSales.quantity.toLocaleString()} items` : 'Add sales as usual to compare later'}</small></div>
          <form id="fasting-day-form" class="fasting-day-form">
            <label class="field-label">Date<input type="date" id="calendar-date-input" name="date" min="1900-01-01" max="2100-12-31" value="${selectedDate}" required /></label>
            <fieldset class="fasting-options"><legend>Fasting community</legend>
              <label class="fasting-option"><input type="checkbox" name="orthodox" value="orthodox" ${orthodoxChecked} /><span class="fasting-option-mark orthodox">O</span><span>Orthodox Christian fast</span></label>
              <label class="fasting-option"><input type="checkbox" name="muslim" value="muslim" ${muslimChecked} /><span class="fasting-option-mark muslim">M</span><span>Muslim fast</span></label>
            </fieldset>
            <label class="field-label">Note (optional)<input type="text" name="note" maxlength="120" value="${escapeHTML(selectedEvent?.note || '')}" placeholder="e.g. Wednesday fast or Ramadan" /></label>
            <div class="fasting-form-actions">${selectedEvent ? '<button type="button" class="danger-button" data-clear-fasting>Remove tags</button>' : '<span></span>'}<button type="submit" class="primary-button compact-button">Save fasting day ${icon('check', 15)}</button></div>
          </form>
          <div class="calendar-manual-note">${icon('info', 14)} ${selectedEvent ? `Tagged: ${escapeHTML(traditionSummary)}.` : 'Select one or both communities. You can add an optional note for the observance.'} The comparison is descriptive; it does not assume fasting caused a sales change.</div>
        </aside>
      </section>
      <div class="formula-note">${icon('info', 14)} Sales averages use only calendar days with logged sale entries. Dates without recorded sales are excluded from both averages.</div>`;
  }

  function summaryTile(label, value, caption, tone) {
    return `<article class="summary-tile"><div class="summary-tile-label"><span class="metric-icon ${tone}">${icon(tone === 'orange' ? 'sales' : tone === 'purple' ? 'package' : 'chart', 17)}</span><span>${label}</span></div><strong>${value}</strong><small>${caption}</small></article>`;
  }

  function renderMenu() {
    const menu = state.store.menu;
    const averageMargin = menu.length ? menu.reduce((sum, item) => sum + menuMetrics(item).margin, 0) / menu.length : 0;
    const avgCost = menu.length ? menu.reduce((sum, item) => sum + itemCost(item), 0) / menu.length : 0;
    const actions = `<button class="primary-button compact-button" data-add-menu>${icon('plus', 16)}<span>Add menu item</span></button>`;
    const cards = menu.map((item) => {
      const metrics = menuMetrics(item);
      const recipeParts = (item.recipe || []).map((line) => {
        const ingredient = state.store.ingredients.find((entry) => entry.id === line.ingredientId);
        return `<span class="recipe-chip">${ingredient ? escapeHTML(ingredient.name) : 'Ingredient'} <small>${Number(line.quantity).toLocaleString('en-US', { maximumFractionDigits: 3 })} ${escapeHTML(ingredient?.unit || '')}</small></span>`;
      }).join('');
      return `<article class="menu-card">
        <div class="menu-card-top">${dishThumbMarkup(item, 'dish-thumb menu-thumb')}<button class="more-button" data-edit-menu="${escapeHTML(item.id)}" aria-label="Edit ${escapeHTML(item.name)}">${icon('more', 19)}</button></div>
        <div class="menu-card-heading"><div><span class="menu-category">${escapeHTML(item.category || 'Menu item')}</span><h2>${escapeHTML(item.name)}</h2></div><strong class="menu-price">${formatMoney(item.price)}</strong></div>
        <div class="menu-metrics"><div><span>INGREDIENT COST</span><strong>${formatMoney(metrics.cost)}</strong></div><div><span>PLATE CONTRIBUTION</span><strong>${formatMoney(metrics.profit)}</strong></div><div><span>BEFORE FIXED COSTS</span><strong class="${metrics.margin < 55 ? 'warning-text' : 'success-text'}">${formatPercent(metrics.margin)}</strong></div></div>
        <div class="margin-meter"><span style="width:${Math.max(0, Math.min(100, metrics.margin))}%"></span></div>
        <div class="recipe-preview"><div class="recipe-preview-heading"><span>YOUR RECIPE</span><button data-edit-menu="${escapeHTML(item.id)}">Edit recipe ${icon('arrowRight', 13)}</button></div><div class="recipe-chips">${recipeParts || '<span class="recipe-chip">No ingredients added</span>'}</div></div>
      </article>`;
    }).join('');
    return `${renderPageHeading('PRICING & PLATE COSTS · ETB', 'Enter your Ethiopian menu by hand.', 'Add dishes like Firfir, Beyaynetu, Shiro, Kikil, Tibs, fish, and rice. Set each ETB price and its serving recipe yourself.', actions)}
      <section class="menu-stats-grid">
        ${summaryTile('Menu items', `${menu.length}`, 'Active dishes & drinks', 'orange')}
        ${summaryTile('Average ingredient cost', formatMoney(avgCost), 'Cost per serving', 'purple')}
        ${summaryTile('Average plate margin', formatPercent(averageMargin), 'Before annual tax & overhead', 'mint')}
      </section>
      ${menu.length ? `<section class="menu-grid">${cards}</section>` : emptyState('Start with an Ethiopian dish', 'Manually add its name, ETB selling price, and the ingredients used for one serving.', 'Add menu item', 'add-menu')}
      <div class="formula-note">${icon('info', 14)} Plate contribution = menu price − recipe ingredients. Annual tax, rent, and payroll are allocated in daily profit.</div>`;
  }

  function renderCosts() {
    const settings = state.store.settings;
    const taxYear = Number(state.taxEditorYear || new Date().getFullYear());
    const annualTax = Number(settings.annualTaxByYear?.[String(taxYear)] || 0);
    const ingredients = [...state.store.ingredients].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
    const byGroup = ingredients.reduce((result, ingredient) => {
      const group = ingredient.group || 'Other';
      (result[group] ||= []).push(ingredient);
      return result;
    }, {});
    const ingredientGroups = Object.entries(byGroup).map(([group, items]) => `<section class="ingredient-group"><div class="ingredient-group-heading"><span class="ingredient-group-mark">${icon(group === 'Meat' || group === 'Fish & eggs' ? 'bowl' : group === 'Produce' ? 'leaf' : 'package', 16)}</span><h3>${escapeHTML(group)}</h3><span class="ingredient-count">${items.length}</span></div><div class="ingredient-list">${items.map((ingredient) => `<div class="ingredient-row"><div class="ingredient-name"><strong>${escapeHTML(ingredient.name)}</strong><small>${escapeHTML(ingredient.group || 'Other')}</small></div><div class="ingredient-price"><strong>${formatMoney(ingredient.unitCost)}</strong><span>per ${escapeHTML(ingredient.unit)}</span></div><button class="icon-button ingredient-edit" data-edit-ingredient="${escapeHTML(ingredient.id)}" aria-label="Edit ${escapeHTML(ingredient.name)}">${icon('edit', 15)}</button></div>`).join('')}</div></section>`).join('');
    const actions = `<button class="secondary-button compact-button" data-add-ingredient>${icon('plus', 16)}<span>Add ingredient</span></button>`;

    return `${renderPageHeading('RENT · PEOPLE · TAX · INGREDIENTS', 'Know what it costs to open.', 'Set monthly overhead, enter one tax amount per year, and keep supplier prices current. Annual tax is spread across profit periods.', '')}
      <section class="panel assumptions-panel">
        <div class="panel-heading assumptions-heading"><div><div class="eyebrow">MONTHLY & ANNUAL MUST-HAVES</div><h2>Operating costs</h2><p>Used to calculate true daily profit.</p></div><span class="panel-icon orange-icon">${icon('bank', 18)}</span></div>
        <form id="fixed-cost-form">
          <div class="assumptions-grid">
            <label class="field-label">Monthly rent<span class="field-input-wrap">${icon('bank', 16)}<input type="number" name="monthlyRent" min="0" step="0.01" value="${Number(settings.monthlyRent)}" required /><small>ETB / month</small></span></label>
            <label class="field-label">Team members<span class="field-input-wrap">${icon('users', 16)}<input type="number" name="employeeCount" min="0" step="1" value="${Number(settings.employeeCount)}" required /><small>people</small></span></label>
            <label class="field-label">Monthly payroll<span class="field-input-wrap">${icon('users', 16)}<input type="number" name="monthlyPayroll" min="0" step="0.01" value="${Number(settings.monthlyPayroll)}" required /><small>ETB / month</small></span></label>
            <label class="field-label open-days-field">Open days per month<span class="field-input-wrap">${icon('calendar', 16)}<input type="number" name="openDays" min="1" max="31" step="1" value="${Number(settings.openDays)}" required /><small>days</small></span></label>
            <label class="field-label">Tax year<span class="field-input-wrap">${icon('calendar', 16)}<input type="number" id="tax-year-input" name="taxYear" min="2000" max="2100" step="1" value="${taxYear}" required /><small>year</small></span></label>
            <label class="field-label">Annual tax<span class="field-input-wrap">${icon('bank', 16)}<input type="number" id="annual-tax-input" name="annualTax" min="0" step="0.01" value="${annualTax.toFixed(2)}" required /><small>ETB / year</small></span></label>
          </div>
          <div class="assumptions-footer"><span>${icon('info', 14)} Rent and payroll use open days; annual tax is allocated across the year for profit estimates.</span><button class="primary-button compact-button" type="submit">Save costs ${icon('check', 15)}</button></div>
        </form>
      </section>
      <section class="panel ingredients-panel">
        <div class="panel-heading ingredients-heading"><div><div class="eyebrow">YOUR RECIPE BUILDING BLOCKS</div><h2>Ingredient costs <span class="count-pill">${ingredients.length}</span></h2><p>Set the purchase cost per unit. Linked recipes update automatically.</p></div><div class="ingredient-heading-actions">${actions}</div></div>
        ${ingredients.length ? `<div class="ingredient-groups">${ingredientGroups}</div>` : emptyState('No ingredients yet', 'Add your first supplier item and link it to a recipe.', 'Add ingredient', 'add-ingredient')}
      </section>
      <div class="formula-note">${icon('info', 14)} Ingredient cost is stored per purchase unit. Recipes multiply that cost by the quantity used per serving.</div>`;
  }

  function renderInsights() {
    const insights = getInsights();
    const stats = calculateStats(getDateRange('month', state.selectedDate).start, state.selectedDate);
    const openDays = Math.max(1, Number(state.store.settings.openDays));
    const taxYear = dateFromISO(state.selectedDate).getFullYear();
    const dailyFixed = (Number(state.store.settings.monthlyRent) + Number(state.store.settings.monthlyPayroll) + annualTaxForYear(taxYear) / 12) / openDays;
    const currentFoodRate = stats.revenue ? stats.foodCost / stats.revenue * 100 : 0;
    const denominator = 1 - currentFoodRate / 100;
    const breakEven = denominator > 0 ? dailyFixed / denominator : 0;
    const coverage = breakEven ? statsForDay(state.selectedDate).revenue / breakEven * 100 : 0;
    const actions = `<div class="insight-refresh-note">${icon('sparkle', 16)} Updates when your prices or sales change</div>`;
    return `${renderPageHeading('SMALL MOVES · HEALTHIER MARGINS', 'A few good ideas, from your numbers.', 'Practical nudges based on the ingredients, prices, and sales you’ve entered.', actions)}
      <section class="insights-intro"><div class="insights-intro-copy"><span class="insights-intro-mark">${icon('sparkle', 24)}</span><div><div class="eyebrow">YOUR MONTH, SO FAR</div><h2>${formatMoney(stats.profit)} in estimated profit</h2><p>${formatMoney(stats.revenue)} in sales across ${stats.quantity.toLocaleString()} items. ${stats.revenue ? `That’s a ${formatPercent(stats.margin)} net margin after allocated annual tax and operating overhead.` : 'Log a few sales to unlock recommendations tailored to your restaurant.'}</p></div></div><div class="insights-privacy">${icon('lock', 14)} Private to this workspace</div></section>
      <section class="insight-card-grid">${insights.map((entry, index) => `<article class="insight-card insight-card-${index + 1}"><div class="insight-card-top"><span class="insight-card-icon ${entry.tone || 'orange'}">${icon(entry.icon || 'sparkle', 19)}</span><span class="insight-number">0${index + 1}</span></div><span class="insight-card-kicker">${escapeHTML(entry.kicker)}</span><h2>${escapeHTML(entry.title)}</h2><p>${escapeHTML(entry.body)}</p>${entry.action ? `<div class="insight-action-note">${icon('arrowUpRight', 15)} ${escapeHTML(entry.action)}</div>` : ''}</article>`).join('')}</section>
      <section class="insight-bottom-grid">
        <article class="panel breakeven-panel"><div class="panel-heading"><div><div class="eyebrow">A USEFUL DAILY TARGET</div><h2>Your break-even number</h2><p>Revenue needed to cover today's food, annual tax & allocated fixed costs.</p></div><span class="panel-icon purple-icon">${icon('chart', 18)}</span></div><div class="breakeven-number">${formatMoney(breakEven)}<span>/ open day</span></div><div class="breakeven-meter"><span style="width:${Math.max(0, Math.min(100, coverage))}%"></span></div><div class="breakeven-foot"><span>Sales on ${dateLabel(state.selectedDate, { month: 'short', day: 'numeric' })}</span><strong>${formatMoney(statsForDay(state.selectedDate).revenue)}</strong><span class="breakeven-status ${coverage >= 100 ? 'status-good' : 'status-watch'}">${coverage >= 100 ? 'Target reached' : `${Math.max(0, 100 - coverage).toFixed(0)}% to go`}</span></div></article>
        <article class="panel insight-method-panel"><span class="method-icon">${icon('info', 17)}</span><div><h2>How these ideas work</h2><p>Crave Ledger uses transparent rules, not black-box predictions. Recommendations use your entered recipe costs, menu prices, annual tax amount, and recorded sales. Good estimates still deserve a quick check against your books.</p><button class="text-button" data-route="costs">Review cost assumptions ${icon('arrowRight', 14)}</button></div></article>
      </section>`;
  }

  function getInsights() {
    const store = state.store;
    const monthRange = getDateRange('month', state.selectedDate);
    const stats = calculateStats(monthRange.start, monthRange.end);
    const recentRange = { start: shiftDate(state.selectedDate, -29), end: state.selectedDate };
    const recentSales = store.sales.filter((sale) => sale.date >= recentRange.start && sale.date <= recentRange.end);
    const counts = new Map();
    recentSales.forEach((sale) => counts.set(sale.itemId, (counts.get(sale.itemId) || 0) + Number(sale.quantity || 0)));
    const bestSeller = [...store.menu].sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0))[0];
    const lowestMargin = [...store.menu].sort((a, b) => menuMetrics(a).margin - menuMetrics(b).margin)[0];
    const foodPercent = stats.revenue ? stats.foodCost / stats.revenue * 100 : 0;
    const result = [];

    if (!stats.revenue) {
      result.push({
        kicker: 'FIRST THINGS FIRST', icon: 'sales', tone: 'orange',
        title: 'Start with one real sale.',
        body: 'Choose a menu item and quantity. We’ll subtract its saved ingredient recipe. Your annual tax, rent, and payroll are then included in daily profit.',
        action: 'A good first step takes under a minute.',
      });
    } else if (foodPercent > 32) {
      result.push({
        kicker: 'FOOD-COST WATCH', icon: 'package', tone: 'orange',
        title: `Ingredients are ${formatPercent(foodPercent)} of sales.`,
        body: 'That is above the usual 28–32% watch range. Check portion weights and supplier invoices first; small recipe changes add up across a full month.',
        action: 'Start with your highest-volume recipe.',
      });
    } else {
      result.push({
        kicker: 'FOOD-COST CHECK', icon: 'leaf', tone: 'mint',
        title: foodPercent >= 24 ? `Your ${formatPercent(foodPercent)} food-cost rate is in range.` : `A lean ${formatPercent(foodPercent)} of sales goes to ingredients.`,
        body: foodPercent >= 24
          ? 'Your recipe spend is sitting inside a common 28–32% planning range. Keep checking supplier prices so a quiet increase does not eat into that cushion.'
          : 'That can be a strong sign of thoughtful sourcing. Double-check portion sizes and update your invoices so the margin stays real, not just estimated.',
        action: 'Revisit unit costs whenever a delivery changes.',
      });
    }

    if (lowestMargin) {
      const metrics = menuMetrics(lowestMargin);
      const targetMargin = 65;
      const denominator = 1 - targetMargin / 100;
      const suggested = denominator > 0 ? Math.ceil((metrics.cost / denominator) * 2) / 2 : Number(lowestMargin.price);
      const hasSales = (counts.get(lowestMargin.id) || 0) > 0;
      result.push({
        kicker: 'MENU MARGIN', icon: 'menu', tone: 'purple',
        title: metrics.margin < targetMargin ? `Revisit ${lowestMargin.name}.` : `${lowestMargin.name} has room to shine.`,
        body: metrics.margin < targetMargin
          ? `It currently returns about ${formatMoney(metrics.profit)} per serving after recipe cost, before annual tax and overhead. A price near ${formatMoney(suggested)} would bring its estimated margin closer to ${targetMargin}% (before annual tax and overhead).`
          : `At ${formatPercent(metrics.margin)} after recipe cost, before annual tax and overhead, this is your thinnest plate margin. Check its portion and perceived value before changing a popular price.`,
        action: hasSales ? `${(counts.get(lowestMargin.id) || 0).toLocaleString()} servings sold in the last 30 days.` : 'Add sales to see demand beside this margin.',
      });
    } else {
      result.push({ kicker: 'MENU MARGIN', icon: 'menu', tone: 'purple', title: 'Add a dish to see its plate profit.', body: 'Build a menu item with its selling price and ingredient recipe. Your estimated profit updates every time an ingredient price changes.', action: 'Recipes are under Menu & recipes.' });
    }

    if (bestSeller) {
      const count = counts.get(bestSeller.id) || 0;
      const bestMetrics = menuMetrics(bestSeller);
      result.push({
        kicker: 'WHAT GUESTS LOVE', icon: 'sparkle', tone: 'butter',
        title: count ? `${bestSeller.name} is your most ordered item.` : 'Your next bestseller is waiting.',
        body: count
          ? `${count.toLocaleString()} servings moved in the last 30 days, at about ${formatMoney(bestMetrics.profit)} contribution each after ingredients, before annual tax and overhead. Try pairing it with a high-margin drink.`
          : 'Once you log a few sales, we’ll surface the menu items guests reach for most and the contribution they bring in.',
        action: count ? `${formatMoney(bestMetrics.profit * count)} estimated contribution over 30 days.` : 'A quick sale log is all it takes to begin.',
      });
    } else {
      result.push({ kicker: 'WHAT GUESTS LOVE', icon: 'sparkle', tone: 'butter', title: 'Your next bestseller is waiting.', body: 'Add a menu item and start logging sales. We’ll show which plates are doing the most work for your business.', action: 'No guesses—just the data you enter.' });
    }

    return result.slice(0, 3);
  }

  function timestampForStore(store) {
    const timestamp = Date.parse(store?.updatedAt || store?.createdAt || '');
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  async function connectGoogleWorkspace(profile, authorization, { preservePage = false } = {}) {
    const existingUser = state.user && !state.user.isDemo ? state.user : null;
    if (existingUser && existingUser.email.toLowerCase() !== profile.email.toLowerCase()) {
      throw new Error(`This workspace belongs to ${existingUser.email}. Sign in with that same Google account to back it up.`);
    }
    const currentPage = preservePage ? state.page : 'overview';
    const cachedLocalStore = existingUser ? cloned(state.store) : safeRead(dataKey(profile.email), null);
    const hasLocalStore = Boolean(cachedLocalStore && Array.isArray(cachedLocalStore.sales));
    const localStore = existingUser
      ? cloned(state.store)
      : hasLocalStore ? loadStoreFor(profile.email, false) : createBaseStore();
    googleSession = {
      email: profile.email,
      accessToken: authorization.accessToken,
      expiresAt: Date.now() + (Number(authorization.expiresIn) || 3600) * 1000,
      spreadsheetId: '',
    };
    state.user = { email: profile.email, name: profile.name || profile.email.split('@')[0], isDemo: false, provider: 'google' };
    state.store = localStore;
    state.page = currentPage;
    state.period = 'today';
    state.selectedDate = todayISO();
    state.accountMenuOpen = false;
    setGoogleSyncState('syncing', 'Checking your private Google Sheets backup…');

    let remoteStore = null;
    try {
      const remote = await window.CraveGoogleSheets.loadWorkspace(profile.email, authorization.accessToken);
      googleSession.spreadsheetId = remote.spreadsheetId;
      remoteStore = normalizeGoogleStore(remote.store);
    } catch (error) {
      if (!hasLocalStore && !existingUser) {
        googleSession = null;
        state.user = null;
        state.store = null;
        renderAuth();
        const authError = $('#auth-error', appRoot);
        if (authError) authError.textContent = `Google sign-in worked, but the private spreadsheet could not be opened: ${error.message || 'check the connection and OAuth setup, then retry.'}`;
        return;
      }
      safeWrite(dataKey(profile.email), localStore);
      safeWrite(SESSION_KEY, { email: profile.email, name: state.user.name, provider: 'google' });
      try { localStorage.setItem(STARTED_KEY, '1'); } catch { /* optional launch marker */ }
      renderApp();
      setGoogleSyncState(/expired|reconnect/i.test(error.message || '') ? 'reauth' : 'error', error.message || 'Could not open the Google Sheets backup.');
      showToast('Signed in, but the spreadsheet is not reachable yet. Your on-device workspace is safe.', 'error');
      return;
    }

    const useRemote = Boolean(remoteStore && (!hasLocalStore
      || timestampForStore(remoteStore) >= timestampForStore(localStore)));
    if (useRemote) {
      state.store = remoteStore;
      safeWrite(dataKey(profile.email), remoteStore);
      setGoogleSyncState('synced', 'Restored the latest workspace from your private Google Sheet.', remoteStore.updatedAt || remoteStore.createdAt || '');
    } else {
      state.store = localStore;
      state.store.updatedAt = new Date().toISOString();
      safeWrite(dataKey(profile.email), state.store);
      setGoogleSyncState('pending', remoteStore ? 'Uploading the newer on-device workspace…' : 'Creating your private Google Sheets backup…');
    }
    renderApp();
    if (!useRemote) {
      try {
        await syncGoogleWorkspace({ quiet: false });
      } catch {
        // Keep the signed-in session usable; the settings panel will show the sync error.
      }
    }
    safeWrite(SESSION_KEY, { email: profile.email, name: state.user.name, provider: 'google' });
    try { localStorage.setItem(STARTED_KEY, '1'); } catch { /* optional launch marker */ }
    showToast(useRemote ? `Welcome back, ${state.user.name.split(' ')[0]}.` : 'Google sign-in is ready. Your workspace backup is connected.');
  }

  async function startGoogleSignIn({ preservePage = false } = {}) {
    const button = $('[data-google-sign-in], [data-google-connect]', appRoot);
    const originalLabel = button?.innerHTML || '';
    const authError = $('#auth-error', appRoot);
    if (authError) authError.textContent = '';
    if (button) {
      button.disabled = true;
      button.innerHTML = `<span class="google-button-spinner" aria-hidden="true"></span><span>Connecting to Google…</span>`;
    }
    try {
      if (!window.CraveGoogleSheets) throw new Error('Google backup is unavailable in this app version. Update the app and try again.');
      const authorization = await window.CraveGoogleSheets.authorize();
      const profile = await window.CraveGoogleSheets.getProfile(authorization.accessToken);
      await connectGoogleWorkspace(profile, authorization, { preservePage });
    } catch (error) {
      if (authError) authError.textContent = error.message || 'Google sign-in could not be completed.';
      else showToast(error.message || 'Google sign-in could not be completed.', 'error');
    } finally {
      if (button?.isConnected) {
        button.disabled = false;
        button.innerHTML = originalLabel;
      }
    }
  }

  function renderSettings() {
    const settings = state.store.settings;
    const googleConnected = !state.user.isDemo && googleSessionIsUsable();
    const backupStatus = state.user.isDemo
      ? 'The sample workspace is never uploaded. Sign in to your own account to create a backup.'
      : googleSyncState.message;
    const googleActions = state.user.isDemo
      ? ''
      : `${googleConnected ? `<button class="secondary-button" data-google-sync-now>${icon('refresh', 16)}<span>Back up now</span></button>` : ''}<button class="${googleConnected ? 'secondary-button' : 'primary-button'} google-connect-button" data-google-connect><span class="google-mark" aria-hidden="true">G</span><span>${googleConnected ? 'Reconnect Google' : 'Connect Google & back up'}</span></button>${googleConnected && googleSession.spreadsheetId ? `<a class="secondary-button google-sheet-link" href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(googleSession.spreadsheetId)}/edit" target="_blank" rel="noopener noreferrer">Open private sheet ${icon('arrowUpRight', 15)}</a>` : ''}`;
    const accountStorageCopy = googleConnected
      ? 'Your workspace is saved on this device and backed up to a private spreadsheet in this Google account.'
      : 'Your workspace is saved on this device. Connect Google Sheets to add a private cloud backup.';
    return `${renderPageHeading('YOUR PLACE · YOUR DATA', 'A little housekeeping.', 'Make Crave Ledger fit your restaurant and decide what happens to your numbers.', '')}
      <section class="settings-grid">
        <article class="panel settings-profile-panel"><div class="panel-heading"><div><div class="eyebrow">THE RESTAURANT</div><h2>Workspace details</h2><p>Give your workspace a name. All totals are in ETB.</p></div><span class="panel-icon orange-icon">${icon('settings', 18)}</span></div>
          <form id="profile-form" class="profile-form"><label class="field-label">Restaurant name<input type="text" name="restaurantName" maxlength="60" value="${escapeHTML(settings.restaurantName)}" required /></label><label class="field-label">Currency<span class="currency-readonly"><strong>ETB</strong><span>Ethiopian birr · fixed</span></span></label><button class="primary-button compact-button" type="submit">Save workspace ${icon('check', 15)}</button></form>
        </article>
        <article class="panel settings-account-panel"><div class="panel-heading"><div><div class="eyebrow">SIGNED IN AS</div><h2>${escapeHTML(state.user.name)}</h2><p>${escapeHTML(state.user.email)}</p></div><span class="avatar avatar-large">${escapeHTML(initials(state.user.name))}</span></div><div class="local-only-note"><span class="local-note-icon">${icon(googleConnected ? 'check' : 'lock', 16)}</span><div><strong>${googleConnected ? 'Device + private Google Sheet' : 'On-device workspace'}</strong><p>${escapeHTML(accountStorageCopy)}</p></div></div><button class="secondary-button signout-settings" data-signout>${icon('logout', 16)}<span>Sign out</span></button></article>
      </section>
      <section class="panel google-backup-panel"><div class="panel-heading"><div><div class="eyebrow">FREE, OWNER-CONTROLLED BACKUP</div><h2>Google Sheets backup</h2><p>Your own private spreadsheet—no backup server or subscription.</p></div><span class="google-backup-icon">${icon('lock', 18)}</span></div>
        <div class="google-backup-body"><div class="google-backup-copy"><div class="google-sync-status" id="google-sync-status" data-status="${escapeHTML(googleSyncState.status)}" role="status">${escapeHTML(backupStatus)}</div><p>Backs up restaurant settings, ingredients, recipes, menu items, sales history, annual tax entries, fasting tags, and a restore snapshot. It is created in the signed-in Google account and is private unless you share it.</p><p class="google-free-note">No paid trial or billing setup is used. Google’s free storage and API quotas apply; see the setup note before enabling sync.</p></div><div class="google-backup-actions">${googleActions}</div></div>
      </section>
      <section class="panel data-panel"><div class="panel-heading"><div><div class="eyebrow">TAKE YOUR NUMBERS WITH YOU</div><h2>Backup & reset</h2><p>Export a copy before switching devices, or restore a previous backup.</p></div><span class="panel-icon purple-icon">${icon('package', 18)}</span></div><div class="data-actions"><button class="secondary-button" data-export>${icon('download', 16)}<span>Export workspace</span></button><label class="secondary-button import-button">${icon('upload', 16)}<span>Import backup</span><input type="file" id="import-file" accept="application/json,.json" /></label><button class="danger-button" data-reset>${icon('refresh', 16)}<span>Reset workspace</span></button></div><p class="data-caption">Exports contain your restaurant profile, ingredient list, menu recipes, sales history, and manually tagged fasting days.</p></section>
      <section class="panel photo-credits-panel"><div class="panel-heading"><div><div class="eyebrow">SAMPLE MENU PHOTOGRAPHY</div><h2>Dish photo credits</h2><p>Real reference photos, resized for this app and cropped in menu thumbnails.</p></div><span class="panel-icon orange-icon">${icon('bowl', 18)}</span></div><div class="photo-credit-list">
        <div><strong>Beyaynetu</strong><span>Photo by Yonatan Solomon · <a href="https://commons.wikimedia.org/wiki/File:Beyaynetu_ethiopian_food.jpg">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></span></div>
        <div><strong>Shiro Wot</strong><span>Photo by David Stanley · <a href="https://commons.wikimedia.org/wiki/File:Ethiopian_Shiro_(11354785095).jpg">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a></span></div>
        <div><strong>Tibs</strong><span>Photo by Arnold Gatilao · <a href="https://commons.wikimedia.org/wiki/File:Ye_Bere_Tibs_-_tenderized,_lean,_cubed_beef,_cooked_in_berbere_sauce._-Ethiopian_-Oakland_(14987170060).jpg">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a></span></div>
        <div><strong>Kitfo</strong><span>Photo by Michael T. · <a href="https://commons.wikimedia.org/wiki/File:Kitfo_(Ethiopian_Tartar).jpg">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a></span></div>
      </div><p class="data-caption">These are sample photos, not your restaurant’s plates. Replace them with your own exact dish photos when you add menu items. The resized Beyaynetu and Kitfo assets remain under their listed CC BY-SA licenses.</p></section>
      <section class="settings-security-note">${icon('info', 17)}<p><strong>Privacy & billing:</strong> Google authorization happens on-device; Crave Ledger does not send data through a third-party backup server. Standard Sheets API use has no additional cost, and sync requests are batched and debounced. Google may charge for API quota overages later in 2026, so do not add a billing account unless you explicitly choose to. Your account’s free Drive/Sheets storage limit still applies.</p></section>`;
  }

  function renderAuth() {
    const isSignup = state.authMode === 'signup';
    appRoot.innerHTML = `<main class="auth-layout">
      <section class="auth-story">
        ${brandMarkup()}
        <div class="auth-story-copy"><span class="auth-overline">A LITTLE CLARITY FOR THE BIG DAYS</span><h1>Know your<br/><em>numbers.</em><br/>Grow your table.</h1><p>Daily profit, plate by plate. A calmer way to see what your restaurant is earning.</p></div>
        <div class="auth-plate-art" aria-hidden="true"><div class="plate-shadow"></div><div class="plate-outer"><div class="plate-inner"><span class="plate-herb herb-one"></span><span class="plate-herb herb-two"></span><span class="plate-herb herb-three"></span><span class="plate-food food-one"></span><span class="plate-food food-two"></span><span class="plate-food food-three"></span><span class="plate-center"></span></div></div><span class="art-spark art-spark-one">✳</span><span class="art-spark art-spark-two">✳</span></div>
        <div class="auth-story-footer"><span>INDEPENDENT BY NATURE</span><span>BUILT FOR RESTAURANTS <i></i></span></div>
      </section>
      <section class="auth-panel"><div class="auth-form-wrap">
        <div class="auth-mobile-brand">${brandMarkup()}</div>
        <div class="auth-form-heading"><span class="auth-form-kicker">${isSignup ? 'A FRESH START' : 'WELCOME BACK'}</span><h2>${isSignup ? 'Create your account.' : 'Good to see you.'}</h2><p>${isSignup ? 'Set up a private workspace for your restaurant.' : 'Sign in to check in on your restaurant.'}</p></div>
        <button class="google-auth-button" type="button" data-google-sign-in><span class="google-mark" aria-hidden="true">G</span><span class="google-auth-copy"><strong>Continue with Google</strong><small>Sync to your private Google Sheet</small></span>${icon('arrowRight', 17)}</button>
        <div class="auth-divider google-auth-divider"><span></span><small>OR USE AN ON-DEVICE ACCOUNT</small><span></span></div>
        <div class="auth-tabs"><button class="${!isSignup ? 'active' : ''}" data-auth-mode="login">Sign in</button><button class="${isSignup ? 'active' : ''}" data-auth-mode="signup">Create account</button></div>
        <form id="auth-form" class="auth-form" novalidate>
          ${isSignup ? `<label class="field-label">Your name<span class="auth-input-wrap">${icon('users', 17)}<input name="name" type="text" autocomplete="name" placeholder="e.g. Hana Bekele" maxlength="50" required /></span></label>` : ''}
          ${isSignup ? `<label class="field-label">Restaurant name<span class="auth-input-wrap">${icon('bowl', 17)}<input name="restaurant" type="text" autocomplete="organization" placeholder="e.g. Enat Kitchen" maxlength="60" required /></span></label>` : ''}
          <label class="field-label">Email address<span class="auth-input-wrap">${icon('mail', 17)}<input name="email" type="email" autocomplete="email" placeholder="you@restaurant.com" required /></span></label>
          <label class="field-label">Password<span class="auth-input-wrap">${icon('lock', 17)}<input name="password" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" placeholder="${isSignup ? 'At least 8 characters' : 'Your password'}" minlength="8" required /><button type="button" class="password-toggle" data-toggle-password aria-label="Show password">${icon('eye', 16)}</button></span></label>
          ${isSignup ? `<p class="auth-local-hint">${icon('lock', 13)} Your password is hashed and kept on this device.</p>` : ''}
          <p class="auth-error" id="auth-error" role="alert"></p>
          <button class="primary-button auth-submit" type="submit">${isSignup ? 'Create my workspace' : 'Sign in'} ${icon('arrowRight', 17)}</button>
        </form>
        <div class="auth-divider"><span></span><small>OR TAKE A LOOK AROUND</small><span></span></div>
        <button class="demo-button" data-enter-demo><span class="demo-button-icon">${icon('sparkle', 17)}</span><span><strong>Explore the sample workspace</strong><small>See a restaurant with sample sales & costs</small></span>${icon('arrowRight', 16)}</button>
        <p class="auth-legal">By continuing, you agree to keep your restaurant numbers private and use this tool as an estimate—not a substitute for tax or accounting advice.</p>
      </div></section>
    </main>`;
    bindAuthEvents();
    syncEthiopianGreetingClock();
  }

  function bindAppEvents() {
    $$('[data-route]', appRoot).forEach((button) => button.addEventListener('click', (event) => {
      event.preventDefault();
      state.page = button.dataset.route;
      state.accountMenuOpen = false;
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    $$('[data-period]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.period = button.dataset.period;
      renderApp();
    }));
    const datePicker = $('#date-picker', appRoot);
    datePicker?.addEventListener('change', () => {
      if (datePicker.value) {
        state.selectedDate = datePicker.value;
        renderApp();
      }
    });
    $$('[data-open-sale]', appRoot).forEach((button) => button.addEventListener('click', openSaleModal));
    $$('[data-add-menu]', appRoot).forEach((button) => button.addEventListener('click', () => openMenuModal()));
    $$('[data-edit-menu]', appRoot).forEach((button) => button.addEventListener('click', () => openMenuModal(button.dataset.editMenu)));
    $$('[data-add-ingredient]', appRoot).forEach((button) => button.addEventListener('click', () => openIngredientModal()));
    $$('[data-edit-ingredient]', appRoot).forEach((button) => button.addEventListener('click', () => openIngredientModal(button.dataset.editIngredient)));
    $$('[data-delete-sale]', appRoot).forEach((button) => button.addEventListener('click', () => deleteSale(button.dataset.deleteSale)));
    $$('[data-account-toggle]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.accountMenuOpen = !state.accountMenuOpen;
      renderApp();
    }));
    $$('[data-account-settings]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.page = 'settings';
      state.accountMenuOpen = false;
      renderApp();
    }));
    $$('[data-signout]', appRoot).forEach((button) => button.addEventListener('click', signOut));
    $$('[data-google-connect]', appRoot).forEach((button) => button.addEventListener('click', () => startGoogleSignIn({ preservePage: true })));
    $$('[data-google-sync-now]', appRoot).forEach((button) => button.addEventListener('click', async () => {
      try {
        await syncGoogleWorkspace({ quiet: false });
        showToast('Google Sheets backup is up to date.');
      } catch { /* the sync status and toast explain how to recover */ }
    }));
    $$('[data-create-account]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.authMode = 'signup';
      renderAuth();
    }));
    $$('[data-calendar-shift]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.calendarMonth = shiftCalendarMonth(state.calendarMonth, Number(button.dataset.calendarShift));
      state.calendarSelectedDate = `${state.calendarMonth}-01`;
      renderApp();
    }));
    $('[data-calendar-today]', appRoot)?.addEventListener('click', () => {
      state.calendarSelectedDate = todayISO();
      state.calendarMonth = state.calendarSelectedDate.slice(0, 7);
      renderApp();
    });
    $$('[data-calendar-date]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.calendarSelectedDate = button.dataset.calendarDate;
      state.calendarMonth = state.calendarSelectedDate.slice(0, 7);
      renderApp();
    }));
    $('#calendar-date-input', appRoot)?.addEventListener('change', (event) => {
      const date = String(event.currentTarget.value || '');
      if (!date) return;
      state.calendarSelectedDate = date;
      state.calendarMonth = date.slice(0, 7);
      renderApp();
    });
    $('#fasting-day-form', appRoot)?.addEventListener('submit', saveFastingDay);
    $('[data-clear-fasting]', appRoot)?.addEventListener('click', () => removeFastingDay(state.calendarSelectedDate));
    $('#fixed-cost-form', appRoot)?.addEventListener('submit', saveFixedCosts);
    $('#tax-year-input', appRoot)?.addEventListener('change', (event) => {
      const year = String(event.currentTarget.value || '');
      const amount = state.store.settings.annualTaxByYear?.[year] || 0;
      const taxInput = $('#annual-tax-input', appRoot);
      if (taxInput) taxInput.value = Number(amount).toFixed(2);
    });
    $('#profile-form', appRoot)?.addEventListener('submit', saveProfile);
    $$('[data-export]', appRoot).forEach((button) => button.addEventListener('click', exportWorkspace));
    $('#import-file', appRoot)?.addEventListener('change', importWorkspace);
    $$('[data-reset]', appRoot).forEach((button) => button.addEventListener('click', resetWorkspace));
  }

  function bindAuthEvents() {
    $('[data-google-sign-in]', appRoot)?.addEventListener('click', () => startGoogleSignIn());
    $$('[data-auth-mode]', appRoot).forEach((button) => button.addEventListener('click', () => {
      state.authMode = button.dataset.authMode;
      renderAuth();
    }));
    $('[data-enter-demo]', appRoot)?.addEventListener('click', enterDemo);
    $('[data-toggle-password]', appRoot)?.addEventListener('click', () => {
      const input = $('input[name="password"]', appRoot);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      const toggle = $('[data-toggle-password]', appRoot);
      toggle.innerHTML = icon(input.type === 'password' ? 'eye' : 'eyeOff', 16);
      toggle.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    });
    $('#auth-form', appRoot)?.addEventListener('submit', handleAuthSubmit);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    const error = $('#auth-error', appRoot);
    const submit = $('button[type="submit"]', form);
    const isSignup = state.authMode === 'signup';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = 'Enter a valid email address to continue.';
      return;
    }
    if (password.length < 8) {
      error.textContent = 'Use a password with at least 8 characters.';
      return;
    }
    submit.disabled = true;
    submit.innerHTML = 'One moment…';
    error.textContent = '';
    try {
      const accounts = safeRead(ACCOUNTS_KEY, []);
      const accountList = Array.isArray(accounts) ? accounts : [];
      if (isSignup) {
        if (email === DEMO_EMAIL) {
          error.textContent = 'That address is reserved for the sample workspace. Use a different email.';
          submit.disabled = false;
          submit.innerHTML = `Create my workspace ${icon('arrowRight', 17)}`;
          return;
        }
        if (accountList.some((account) => account.email === email)) {
          error.textContent = 'An account with that email already exists on this device. Sign in instead.';
          submit.disabled = false;
          submit.innerHTML = `Create my workspace ${icon('arrowRight', 17)}`;
          return;
        }
        if (!window.crypto?.subtle) throw new Error('Secure password hashing is unavailable here. Open this app over HTTPS or in its Android app.');
        const salt = randomSalt();
        const passwordHash = await hashPassword(password, salt);
        const account = {
          email,
          name: String(formData.get('name') || 'Restaurant owner').trim() || 'Restaurant owner',
          salt,
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        accountList.push(account);
        safeWrite(ACCOUNTS_KEY, accountList);
        clearGoogleConnection();
        state.user = { email: account.email, name: account.name, isDemo: false };
        state.store = createBaseStore();
        state.store.settings.restaurantName = String(formData.get('restaurant') || 'My restaurant').trim() || 'My restaurant';
        safeWrite(dataKey(email), state.store);
        state.page = 'overview';
        state.period = 'today';
        state.selectedDate = todayISO();
        state.accountMenuOpen = false;
        safeWrite(SESSION_KEY, { email: account.email, name: account.name });
        try { localStorage.setItem(STARTED_KEY, '1'); } catch { /* optional launch marker */ }
        renderApp();
        showToast('Your private workspace is ready.');
      } else {
        const account = accountList.find((entry) => entry.email === email);
        if (!account || !account.salt || !account.passwordHash) {
          throw new Error('We could not find that account on this device. Create an account here or use the sample workspace.');
        }
        if (!window.crypto?.subtle) throw new Error('Secure password checking is unavailable in this browser.');
        const passwordHash = await hashPassword(password, account.salt);
        if (passwordHash !== account.passwordHash) throw new Error('That email and password do not match this device.');
        clearGoogleConnection();
        state.user = { email: account.email, name: account.name, isDemo: false };
        state.store = loadStoreFor(account.email, false);
        state.page = 'overview';
        state.period = 'today';
        state.selectedDate = todayISO();
        state.accountMenuOpen = false;
        safeWrite(SESSION_KEY, { email: account.email, name: account.name });
        try { localStorage.setItem(STARTED_KEY, '1'); } catch { /* optional launch marker */ }
        renderApp();
        showToast(`Welcome back, ${account.name.split(' ')[0]}.`);
      }
    } catch (authError) {
      error.textContent = authError.message || 'Something went wrong. Please try again.';
      submit.disabled = false;
      submit.innerHTML = `${isSignup ? 'Create my workspace' : 'Sign in'} ${icon('arrowRight', 17)}`;
    }
  }

  function randomSalt() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  }

  async function hashPassword(password, salt) {
    const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const digest = await window.crypto.subtle.deriveBits({
      name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256',
    }, key, 256);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
  }

  function signOut() {
    clearGoogleConnection();
    state.user = null;
    state.store = null;
    state.page = 'overview';
    state.authMode = 'login';
    state.accountMenuOpen = false;
    try { localStorage.removeItem(SESSION_KEY); } catch { /* optional */ }
    renderAuth();
  }

  function showToast(message, type = 'success') {
    if (!toastRoot) return;
    toastRoot.innerHTML = `<div class="toast toast-${type}" role="status"><span class="toast-icon">${icon(type === 'error' ? 'info' : 'check', 16)}</span><span>${escapeHTML(message)}</span></div>`;
    const toast = $('.toast', toastRoot);
    requestAnimationFrame(() => toast?.classList.add('visible'));
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast?.classList.remove('visible');
      window.setTimeout(() => { if (toastRoot.contains(toast)) toastRoot.innerHTML = ''; }, 240);
    }, 3200);
  }

  function openModal(title, subtitle, body, size = 'normal') {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal-card modal-${size}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="modal-heading"><div><span class="modal-kicker">CRAVE LEDGER</span><h2>${escapeHTML(title)}</h2>${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ''}</div><button class="modal-close" data-close-modal aria-label="Close">${icon('close', 18)}</button></div>${body}</section></div>`;
    $$('[data-close-modal]', modalRoot).forEach((button) => button.addEventListener('click', closeModal));
    $('[data-modal-backdrop]', modalRoot)?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeModal();
    });
    document.body.classList.add('modal-open');
    window.setTimeout(() => $('input,select', $('.modal-card', modalRoot))?.focus(), 60);
  }

  function closeModal() {
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
  }

  function openSaleModal() {
    if (!state.store.menu.length) {
      showToast('Add a menu item before logging a sale.', 'error');
      state.page = 'menu';
      renderApp();
      return;
    }
    const options = state.store.menu.map((item) => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)} · ${formatMoney(item.price)}</option>`).join('');
    openModal('Log a sale', 'Add dishes sold. Ingredient cost is calculated now; annual tax is allocated in daily profit.', `<form id="sale-form" class="modal-form">
      <label class="field-label">Menu item<select name="itemId" required>${options}</select></label>
      <div class="form-two-col"><label class="field-label">Quantity sold<input type="number" name="quantity" min="1" step="1" value="1" required /></label><label class="field-label">Sale price each (ETB)<input type="number" name="unitPrice" min="0" step="0.01" value="${Number(state.store.menu[0].price).toFixed(2)}" required /></label></div>
      <label class="field-label">Sale date<input type="date" name="date" value="${state.selectedDate}" required /></label>
      <div class="sale-live-preview" id="sale-live-preview"></div>
      <div class="modal-form-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">Add to sales ${icon('arrowRight', 16)}</button></div>
    </form>`);
    const form = $('#sale-form', modalRoot);
    const itemInput = $('select[name="itemId"]', form);
    const qtyInput = $('input[name="quantity"]', form);
    const priceInput = $('input[name="unitPrice"]', form);
    const updatePreview = () => {
      const item = state.store.menu.find((entry) => entry.id === itemInput.value) || state.store.menu[0];
      const quantity = Math.max(0, Number(qtyInput.value || 0));
      const price = Math.max(0, Number(priceInput.value || 0));
      const recipeCost = itemCost(item) * quantity;
      $('#sale-live-preview', modalRoot).innerHTML = `<span>${quantity} × ${escapeHTML(item.name)}</span><div><small>${formatMoney(recipeCost)} ingredients</small><strong>${formatMoney(quantity * price - recipeCost)} contribution before annual tax</strong></div>`;
    };
    itemInput.addEventListener('change', () => {
      const item = state.store.menu.find((entry) => entry.id === itemInput.value);
      if (item) priceInput.value = Number(item.price).toFixed(2);
      updatePreview();
    });
    qtyInput.addEventListener('input', updatePreview);
    priceInput.addEventListener('input', updatePreview);
    updatePreview();
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const item = state.store.menu.find((entry) => entry.id === itemInput.value);
      const quantity = Math.floor(Number(qtyInput.value));
      const unitPrice = Number(priceInput.value);
      const date = $('input[name="date"]', form).value;
      if (!item || quantity < 1 || unitPrice < 0 || !date) return;
      state.store.sales.push({
        id: uid('sale'), date, quantity, unitPrice,
        unitCostAtSale: Number(itemCost(item).toFixed(4)),
        itemId: item.id, itemNameAtSale: item.name, itemIconAtSale: item.icon || '🍽️', createdAt: new Date().toISOString(),
      });
      state.selectedDate = date;
      state.period = 'today';
      saveStore();
      closeModal();
      renderApp();
      showToast('Sale added. Your daily profit is up to date.');
    });
  }

  function openMenuModal(itemId = null, draftOverride = null) {
    const existing = state.store.menu.find((entry) => entry.id === itemId);
    const draft = draftOverride || (existing ? cloned(existing) : {
      id: null, name: '', category: 'Traditional plates', icon: '🍽️', tone: 'peach', price: 0, image: '', imageData: '',
      recipe: state.store.ingredients.length ? [{ ingredientId: state.store.ingredients[0].id, quantity: 0.1 }] : [],
    });
    const title = existing ? 'Edit menu item' : 'Add a menu item';
    const ingredientOptions = (selectedId) => state.store.ingredients.map((ingredient) => `<option value="${escapeHTML(ingredient.id)}" ${ingredient.id === selectedId ? 'selected' : ''}>${escapeHTML(ingredient.name)} · ${formatMoney(ingredient.unitCost)}/${escapeHTML(ingredient.unit)}</option>`).join('');
    const recipeRows = (draft.recipe || []).map((line, index) => `<div class="recipe-edit-row" data-recipe-row>
      <select data-line-ingredient aria-label="Recipe ingredient">${ingredientOptions(line.ingredientId)}</select>
      <label class="recipe-quantity"><input type="number" data-line-quantity min="0.001" step="0.001" value="${Number(line.quantity || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}" aria-label="Quantity used" /><span data-line-unit>${escapeHTML(state.store.ingredients.find((entry) => entry.id === line.ingredientId)?.unit || '')}</span></label>
      <button type="button" class="remove-line" data-remove-line="${index}" aria-label="Remove ingredient">${icon('close', 15)}</button>
    </div>`).join('');
    const recipeBlock = state.store.ingredients.length
      ? `<div class="recipe-editor-heading"><div><strong>Recipe per serving</strong><small>Choose the amount used for one plate.</small></div><button type="button" class="text-button" data-add-recipe-line>${icon('plus', 14)} Add ingredient</button></div><div class="recipe-edit-list">${recipeRows || '<div class="recipe-empty">Add ingredients to calculate a plate cost.</div>'}</div>`
      : `<div class="recipe-empty">Add an ingredient first in Costs.</div>`;

    openModal(title, 'Set the ETB selling price and ingredients per serving. Annual tax is accounted for in daily profit.', `<form id="menu-form" class="modal-form">
      <div class="form-two-col"><label class="field-label">Dish name<input type="text" name="name" value="${escapeHTML(draft.name)}" maxlength="60" placeholder="e.g. Firfir, Shiro Wot, Tibs" required /></label><label class="field-label">Category<select name="category"><option ${draft.category === 'Traditional plates' ? 'selected' : ''}>Traditional plates</option><option ${draft.category === 'Vegetarian & fasting' ? 'selected' : ''}>Vegetarian & fasting</option><option ${draft.category === 'Meat dishes' ? 'selected' : ''}>Meat dishes</option><option ${draft.category === 'Fish' ? 'selected' : ''}>Fish</option><option ${draft.category === 'Rice & sides' ? 'selected' : ''}>Rice & sides</option><option ${draft.category === 'Breakfast' ? 'selected' : ''}>Breakfast</option><option ${draft.category === 'Drinks' ? 'selected' : ''}>Drinks</option><option ${draft.category === 'Other' ? 'selected' : ''}>Other</option></select></label></div>
      <div class="form-two-col"><label class="field-label">Selling price (ETB)<input type="number" name="price" value="${Number(draft.price || 0).toFixed(2)}" min="0" step="1" required /></label><label class="field-label">Fallback emoji<input type="text" name="icon" value="${escapeHTML(draft.icon || '🍽️')}" maxlength="4" /></label></div>
      <div class="dish-photo-field" id="dish-photo-field"><div class="dish-photo-field-copy"><strong>Exact dish photo <span>OPTIONAL</span></strong><small>Use a real photo of this dish from your kitchen — no generated images.</small></div><div class="dish-photo-controls"><div class="dish-photo-preview" id="dish-photo-preview">${(draft.imageData || draft.image) ? `<img src="${escapeHTML(draft.imageData || draft.image)}" alt="Current ${escapeHTML(draft.name || 'dish')} photo" />` : `<span>${escapeHTML(draft.icon || '🍽️')}</span>`}</div><label class="photo-upload-button">${icon('upload', 14)} Choose photo<input type="file" id="menu-photo-input" accept="image/*" capture="environment" /></label><span id="photo-remove-slot"></span></div></div>
      <div class="recipe-editor">${recipeBlock}</div>
      <div class="recipe-cost-summary" id="recipe-cost-summary"></div>
      <div class="modal-form-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button>${existing ? `<button type="button" class="danger-button" data-delete-menu="${escapeHTML(existing.id)}">${icon('trash', 14)} Remove</button>` : ''}<button class="primary-button" type="submit">${existing ? 'Save changes' : 'Add to menu'} ${icon('arrowRight', 16)}</button></div>
    </form>`, 'wide');
    const form = $('#menu-form', modalRoot);
    let photoData = draft.imageData || '';
    let photoPath = draft.image || '';
    const readDraft = () => ({
      id: existing?.id || draft.id || null,
      name: $('input[name="name"]', form)?.value || '',
      category: $('select[name="category"]', form)?.value || 'Traditional plates',
      price: Number($('input[name="price"]', form)?.value || 0),
      icon: $('input[name="icon"]', form)?.value || '🍽️',
      tone: draft.tone || 'peach',
      image: photoPath,
      imageData: photoData,
      recipe: $$('[data-recipe-row]', form).map((row) => ({
        ingredientId: $('[data-line-ingredient]', row)?.value,
        quantity: Number($('[data-line-quantity]', row)?.value || 0),
      })).filter((line) => line.ingredientId),
    });
    const updateLines = () => {
      $$('[data-recipe-row]', form).forEach((row) => {
        $('[data-line-ingredient]', row)?.addEventListener('change', () => {
          const ingredient = state.store.ingredients.find((entry) => entry.id === $('[data-line-ingredient]', row).value);
          $('[data-line-unit]', row).textContent = ingredient?.unit || '';
          updateSummary();
        });
        $('[data-line-quantity]', row)?.addEventListener('input', updateSummary);
      });
    };
    const updateSummary = () => {
      const menuDraft = readDraft();
      const currentCost = itemCost(menuDraft);
      const profit = menuDraft.price - currentCost;
      const margin = menuDraft.price ? profit / menuDraft.price * 100 : 0;
      const perIngredient = menuDraft.recipe.map((line) => {
        const ingredient = state.store.ingredients.find((entry) => entry.id === line.ingredientId);
        return line.quantity * Number(ingredient?.unitCost || 0);
      });
      $('#recipe-cost-summary', modalRoot).innerHTML = `<span>Estimated plate cost</span><strong>${formatMoney(currentCost)}</strong><span class="summary-separator"></span><span>Plate contribution</span><strong class="${margin < 55 ? 'warning-text' : 'success-text'}">${formatMoney(profit)} <small>· ${formatPercent(margin)}</small></strong>`;
    };
    const renderPhotoPreview = () => {
      const source = photoData || photoPath;
      const preview = $('#dish-photo-preview', modalRoot);
      if (preview) {
        preview.innerHTML = source
          ? `<img src="${escapeHTML(source)}" alt="${escapeHTML($('input[name="name"]', form)?.value || 'Dish')} photo preview" />`
          : `<span>${escapeHTML($('input[name="icon"]', form)?.value || '🍽️')}</span>`;
      }
      const removeSlot = $('#photo-remove-slot', modalRoot);
      if (removeSlot) {
        removeSlot.innerHTML = source ? '<button type="button" class="photo-remove-button" data-remove-photo>Remove photo</button>' : '';
        $('[data-remove-photo]', removeSlot)?.addEventListener('click', () => {
          photoData = '';
          photoPath = '';
          renderPhotoPreview();
        });
      }
    };
    $('#menu-photo-input', form)?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
        showToast('Choose an image under 12 MB.', 'error');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => showToast('Could not read that photo. Try a JPG or PNG.', 'error');
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => showToast('Could not open that image. Try a JPG or PNG.', 'error');
        image.onload = () => {
          const maxSide = 720;
          const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) {
            showToast('This device could not prepare the photo.', 'error');
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          photoData = canvas.toDataURL('image/jpeg', 0.78);
          photoPath = '';
          renderPhotoPreview();
          showToast('Real dish photo added. It stays in this workspace.');
        };
        image.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    });
    renderPhotoPreview();
    updateLines();
    updateSummary();
    $('[data-add-recipe-line]', modalRoot)?.addEventListener('click', () => {
      const updated = readDraft();
      const ingredientId = state.store.ingredients[0]?.id;
      if (ingredientId) updated.recipe.push({ ingredientId, quantity: 0.1 });
      openMenuModal(existing?.id || null, updated);
    });
    $$('[data-remove-line]', modalRoot).forEach((button) => button.addEventListener('click', () => {
      const updated = readDraft();
      updated.recipe.splice(Number(button.dataset.removeLine), 1);
      openMenuModal(existing?.id || null, updated);
    }));
    $('[data-delete-menu]', modalRoot)?.addEventListener('click', () => {
      if (!window.confirm(`Remove ${existing.name} from the active menu? Past sales will remain in your history.`)) return;
      state.store.menu = state.store.menu.filter((entry) => entry.id !== existing.id);
      saveStore();
      closeModal();
      renderApp();
      showToast('Menu item removed. Past sales remain recorded.');
    });
    $$('input, select', form).forEach((input) => input.addEventListener('input', updateSummary));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const next = readDraft();
      next.name = next.name.trim();
      next.price = Math.max(0, Number(next.price));
      if (!next.name) return;
      if (next.recipe.some((line) => !Number.isFinite(line.quantity) || line.quantity <= 0)) {
        showToast('Each recipe quantity must be greater than zero.', 'error');
        return;
      }
      if (existing) {
        const index = state.store.menu.findIndex((entry) => entry.id === existing.id);
        state.store.menu[index] = { ...state.store.menu[index], ...next };
      } else {
        state.store.menu.push({ ...next, id: uid('dish') });
      }
      saveStore();
      closeModal();
      renderApp();
      showToast(existing ? 'Menu item updated. Plate margins refreshed.' : 'Menu item added.');
    });
  }

  function openIngredientModal(ingredientId = null) {
    const existing = state.store.ingredients.find((entry) => entry.id === ingredientId);
    const units = ['kg', 'g', 'L', 'mL', 'each', 'bunch', 'can', 'pack'];
    const groups = ['Produce', 'Meat', 'Fish & eggs', 'Dairy', 'Bread & grains', 'Spices', 'Pantry', 'Drinks', 'Packaging', 'Other'];
    openModal(existing ? 'Update ingredient cost' : 'Add an ingredient', 'Enter the supplier cost for one purchase unit.', `<form id="ingredient-form" class="modal-form">
      <label class="field-label">Ingredient name<input type="text" name="name" value="${escapeHTML(existing?.name || '')}" maxlength="60" placeholder="e.g. Teff flour or berbere" required /></label>
      <div class="form-two-col"><label class="field-label">Cost per unit<span class="money-input-wrap"><span>${escapeHTML(currencySymbol(state.store.settings.currency))}</span><input type="number" name="unitCost" min="0" step="0.01" value="${Number(existing?.unitCost || 0).toFixed(2)}" required /></span></label><label class="field-label">Purchase unit<select name="unit">${units.map((unit) => `<option value="${unit}" ${existing?.unit === unit ? 'selected' : ''}>${unit}</option>`).join('')}</select></label></div>
      <label class="field-label">Ingredient group<select name="group">${groups.map((group) => `<option value="${group}" ${(existing?.group || 'Other') === group ? 'selected' : ''}>${group}</option>`).join('')}</select></label>
      <div class="modal-form-actions">${existing ? `<button type="button" class="danger-button" data-delete-ingredient="${escapeHTML(existing.id)}">${icon('trash', 15)} Remove</button>` : '<span></span>'}<button class="primary-button" type="submit">${existing ? 'Save cost' : 'Add ingredient'} ${icon('arrowRight', 16)}</button></div>
    </form>`);
    const form = $('#ingredient-form', modalRoot);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const ingredient = {
        id: existing?.id || uid('ingredient'),
        name: String(formData.get('name') || '').trim(),
        unitCost: Number(formData.get('unitCost') || 0),
        unit: String(formData.get('unit') || 'kg'),
        group: String(formData.get('group') || 'Other'),
      };
      if (!ingredient.name || !Number.isFinite(ingredient.unitCost) || ingredient.unitCost < 0) return;
      if (existing) {
        const index = state.store.ingredients.findIndex((entry) => entry.id === existing.id);
        state.store.ingredients[index] = ingredient;
      } else {
        state.store.ingredients.push(ingredient);
      }
      saveStore();
      closeModal();
      renderApp();
      showToast(existing ? 'Ingredient cost updated across your recipes.' : 'Ingredient added to your cost list.');
    });
    $('[data-delete-ingredient]', modalRoot)?.addEventListener('click', () => {
      const used = state.store.menu.some((item) => item.recipe.some((line) => line.ingredientId === existing.id));
      if (used) {
        showToast('This ingredient is used in a recipe. Edit that recipe first.', 'error');
        return;
      }
      if (!window.confirm(`Remove ${existing.name} from your ingredients?`)) return;
      state.store.ingredients = state.store.ingredients.filter((entry) => entry.id !== existing.id);
      saveStore();
      closeModal();
      renderApp();
      showToast('Ingredient removed.');
    });
  }

  function currencySymbol(_currency) {
    return 'ETB';
  }

  function deleteSale(saleId) {
    const sale = state.store.sales.find((entry) => entry.id === saleId);
    if (!sale || !window.confirm(`Remove this ${sale.itemNameAtSale || 'sale'} entry?`)) return;
    state.store.sales = state.store.sales.filter((entry) => entry.id !== saleId);
    saveStore();
    renderApp();
    showToast('Sale entry removed.');
  }

  function saveFastingDay(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const date = String(values.get('date') || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number(date.slice(0, 4)) < 1900 || Number(date.slice(0, 4)) > 2100 || toISO(dateFromISO(date)) !== date) {
      showToast('Choose a valid calendar date between 1900 and 2100.', 'error');
      return;
    }
    const traditions = ['orthodox', 'muslim'].filter((tradition) => values.get(tradition) === tradition);
    if (!traditions.length) {
      showToast('Select Orthodox Christian fasting, Muslim fasting, or both.', 'error');
      return;
    }
    const fastingDay = { date, traditions, note: String(values.get('note') || '').trim().slice(0, 120) };
    const existingIndex = state.store.calendarEvents.findIndex((entry) => entry.date === date);
    if (existingIndex >= 0) state.store.calendarEvents[existingIndex] = fastingDay;
    else state.store.calendarEvents.push(fastingDay);
    state.store.calendarEvents = normalizeFastingDays(state.store.calendarEvents);
    state.calendarSelectedDate = date;
    state.calendarMonth = date.slice(0, 7);
    saveStore();
    renderApp();
    showToast(`Fasting day saved for ${dateLabel(date, { month: 'short', day: 'numeric', year: 'numeric' })}.`);
  }

  function removeFastingDay(date) {
    const existing = state.store.calendarEvents.find((entry) => entry.date === date);
    if (!existing) return;
    if (!window.confirm(`Remove fasting tags for ${dateLabel(date, { month: 'short', day: 'numeric', year: 'numeric' })}?`)) return;
    state.store.calendarEvents = state.store.calendarEvents.filter((entry) => entry.date !== date);
    saveStore();
    renderApp();
    showToast('Fasting-day tags removed.');
  }

  function saveFixedCosts(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    state.store.settings.monthlyRent = Math.max(0, Number(values.get('monthlyRent') || 0));
    state.store.settings.employeeCount = Math.max(0, Math.floor(Number(values.get('employeeCount') || 0)));
    state.store.settings.monthlyPayroll = Math.max(0, Number(values.get('monthlyPayroll') || 0));
    const enteredTaxYear = Number(values.get('taxYear'));
    const taxYear = Number.isInteger(enteredTaxYear) && enteredTaxYear >= 2000 && enteredTaxYear <= 2100
      ? enteredTaxYear
      : state.taxEditorYear;
    const enteredAnnualTax = Number(values.get('annualTax'));
    const annualTax = Number.isFinite(enteredAnnualTax) ? Math.max(0, enteredAnnualTax) : 0;
    state.taxEditorYear = taxYear;
    state.store.settings.annualTaxByYear = normalizeAnnualTaxByYear(state.store.settings.annualTaxByYear);
    state.store.settings.annualTaxByYear[String(taxYear)] = annualTax;
    state.store.settings.openDays = Math.max(1, Math.min(31, Math.floor(Number(values.get('openDays') || 30))));
    saveStore();
    renderApp();
    showToast(`Costs and ${taxYear} annual tax saved. Profit was recalculated.`);
  }

  function saveProfile(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    state.store.settings.restaurantName = String(values.get('restaurantName') || 'My restaurant').trim() || 'My restaurant';
    state.store.settings.currency = 'ETB';
    saveStore();
    renderApp();
    showToast('Workspace details updated.');
  }

  function exportWorkspace() {
    const backup = {
      format: 'crave-ledger-backup', version: 1, exportedAt: new Date().toISOString(),
      restaurant: state.store.settings.restaurantName,
      settings: state.store.settings, ingredients: state.store.ingredients, menu: state.store.menu, sales: state.store.sales, calendarEvents: state.store.calendarEvents,
    };
    const filename = `crave-ledger-${todayISO()}.json`;
    const contents = JSON.stringify(backup, null, 2);
    if (window.Android && typeof window.Android.saveBackup === 'function') {
      window.Android.saveBackup(filename, contents);
      showToast('Choose a location to save your workspace backup.');
      return;
    }
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Workspace backup prepared.');
  }

  function importWorkspace(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result || '{}'));
        const settings = backup.settings;
        if (backup.format !== 'crave-ledger-backup' || !settings || !Array.isArray(backup.ingredients) || !Array.isArray(backup.menu) || !Array.isArray(backup.sales)) {
          throw new Error('This file is not a Crave Ledger backup.');
        }
        if (!window.confirm(`Replace this workspace with the backup for ${settings.restaurantName || 'this restaurant'}?`)) return;
        state.store = {
          settings: {
            ...createBaseStore().settings,
            ...settings,
            annualTaxByYear: normalizeAnnualTaxByYear(settings.annualTaxByYear),
            currency: 'ETB',
          },
          ingredients: backup.ingredients,
          menu: backup.menu,
          sales: backup.sales,
          calendarEvents: normalizeFastingDays(backup.calendarEvents),
        };
        saveStore();
        renderApp();
        showToast('Backup restored to this workspace.');
      } catch (error) {
        showToast(error.message || 'Could not read that backup.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function resetWorkspace() {
    const prompt = state.user.isDemo
      ? 'Reset this sample workspace to its original demo numbers?'
      : 'Remove all sales and replace this workspace with a blank starter menu?';
    if (!window.confirm(prompt)) return;
    const savedSettings = cloned(state.store.settings);
    state.store = state.user.isDemo ? createDemoStore() : createBaseStore();
    state.store.settings = state.user.isDemo
      ? { ...state.store.settings, restaurantName: 'Enat Kitchen', currency: 'ETB' }
      : { ...state.store.settings, ...savedSettings };
    saveStore();
    state.page = 'overview';
    renderApp();
    showToast('Workspace reset.');
  }

  function renderInitialView() {
    if (restoreSession()) {
      renderApp();
      return;
    }
    let hasStarted = false;
    try { hasStarted = localStorage.getItem(STARTED_KEY) === '1'; } catch { hasStarted = true; }
    if (!hasStarted) {
      enterDemo();
      return;
    }
    renderAuth();
  }

  renderInitialView();
})();
