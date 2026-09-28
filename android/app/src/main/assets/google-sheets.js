(() => {
  'use strict';

  const SHEETS_API = 'https://sheets.googleapis.com/v4';
  const DRIVE_API = 'https://www.googleapis.com/drive/v3';
  const USERINFO_API = 'https://openidconnect.googleapis.com/v1/userinfo';
  const SPREADSHEET_MIME = 'application/vnd.google-apps.spreadsheet';
  const SNAPSHOT_TAB = 'Backup Snapshot';
  const TAB_NAMES = [
    'Overview', 'Settings', 'Annual Tax', 'Ingredients', 'Menu', 'Recipes',
    'Sales', 'Fasting Calendar', 'Daily Profit', SNAPSHOT_TAB,
  ];
  const SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file',
  ].join(' ');
  const SHEET_ID_PREFIX = 'crave.ledger.google.sheet.v1:';

  let pendingNativeAuthorization = null;
  let lastWorkspaceWriteAt = 0;

  function parseNativePayload(payload) {
    if (typeof payload === 'string') {
      try { return JSON.parse(payload); } catch { return { error: 'Google authorization returned an unreadable response.' }; }
    }
    return payload && typeof payload === 'object' ? payload : { error: 'Google authorization returned no response.' };
  }

  window.craveGoogleAuthorizationResult = (payload) => {
    if (!pendingNativeAuthorization) return;
    const pending = pendingNativeAuthorization;
    pendingNativeAuthorization = null;
    window.clearTimeout(pending.timeout);
    const result = parseNativePayload(payload);
    if (result.error) pending.reject(new Error(result.error));
    else if (!result.accessToken) pending.reject(new Error('Google did not return an access token. Please try again.'));
    else pending.resolve(result);
  };

  function waitForGoogleIdentity() {
    if (window.google?.accounts?.oauth2?.initTokenClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-crave-google-identity]');
      const script = existing || document.createElement('script');
      let settled = false;
      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Google sign-in did not load. Check your internet connection and try again.'));
      }, 12000);
      const finish = (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (error) reject(error);
        else if (window.google?.accounts?.oauth2?.initTokenClient) resolve();
        else reject(new Error('Google sign-in could not initialize. Check the OAuth setup and try again.'));
      };
      script.addEventListener('load', () => finish(), { once: true });
      script.addEventListener('error', () => finish(new Error('Could not load Google sign-in. Check your internet connection.')), { once: true });
      if (!existing) {
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.craveGoogleIdentity = 'true';
        document.head.appendChild(script);
      }
      if (window.google?.accounts?.oauth2?.initTokenClient) finish();
    });
  }

  // Load Google Identity Services before the user clicks the sign-in button.
  // Loading it only after the click can consume browser user activation, which
  // causes Chrome to block the OAuth popup in embedded previews.
  if (!window.Android && String(window.CRAVE_GOOGLE_CONFIG?.webClientId || '').trim()) {
    waitForGoogleIdentity().catch(() => {});
  }

  async function authorizeInBrowser() {
    const clientId = String(window.CRAVE_GOOGLE_CONFIG?.webClientId || '').trim();
    if (!clientId) {
      throw new Error('Browser sign-in needs a free Google OAuth Web client ID in google-config.js. No billing account or paid service is needed.');
    }
    await waitForGoogleIdentity();
    return new Promise((resolve, reject) => {
      let settled = false;
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (settled) return;
          settled = true;
          if (response.error || !response.access_token) {
            reject(new Error(response.error_description || response.error || 'Google sign-in was not completed.'));
            return;
          }
          resolve({
            accessToken: response.access_token,
            expiresIn: Number(response.expires_in) || 3600,
          });
        },
        error_callback: (response) => {
          if (settled) return;
          settled = true;
          const message = String(response?.message || '');
          const popupBlocked = response?.type === 'popup_failed_to_open' || /popup/i.test(message);
          reject(new Error(popupBlocked
            ? 'Google sign-in popup was blocked. Open the Crave Ledger preview directly in a browser tab, or allow pop-ups for the preview, then try again.'
            : message || 'Google sign-in was closed before it finished.'));
        },
      });
      try {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (error) {
        settled = true;
        reject(error);
      }
    });
  }

  function authorizeOnAndroid() {
    if (pendingNativeAuthorization) return Promise.reject(new Error('A Google sign-in request is already open.'));
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        if (!pendingNativeAuthorization) return;
        pendingNativeAuthorization = null;
        reject(new Error('Google sign-in timed out. Please try again.'));
      }, 120000);
      pendingNativeAuthorization = { resolve, reject, timeout };
      try {
        window.Android.authorizeGoogleSheets();
      } catch (error) {
        pendingNativeAuthorization = null;
        window.clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async function authorize() {
    if (window.Android && typeof window.Android.authorizeGoogleSheets === 'function') {
      return authorizeOnAndroid();
    }
    return authorizeInBrowser();
  }

  async function getProfile(accessToken) {
    const response = await fetch(USERINFO_API, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.email) {
      throw new Error(data.error_description || data.error || 'Could not read the Google account profile. Reconnect and try again.');
    }
    if (data.email_verified === false) throw new Error('Please use a verified Google email address.');
    return {
      email: String(data.email).trim().toLowerCase(),
      name: String(data.name || data.given_name || data.email.split('@')[0]).trim(),
    };
  }

  function storageKey(email) {
    return `${SHEET_ID_PREFIX}${String(email || '').trim().toLowerCase()}`;
  }

  function readCachedId(email) {
    try { return localStorage.getItem(storageKey(email)) || ''; } catch { return ''; }
  }

  function cacheId(email, spreadsheetId) {
    try { localStorage.setItem(storageKey(email), spreadsheetId); } catch { /* Drive search can recover this id later. */ }
  }

  function forgetCachedId(email) {
    try { localStorage.removeItem(storageKey(email)); } catch { /* optional */ }
  }

  function authorizationHeaders(accessToken) {
    if (!accessToken) throw new Error('Google is disconnected. Sign in again to back up this workspace.');
    return { Authorization: `Bearer ${accessToken}` };
  }

  async function apiRequest(url, accessToken, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const isWrite = url.startsWith(SHEETS_API) && method !== 'GET';
    const headers = {
      ...authorizationHeaders(accessToken),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };
    let attempt = 0;
    while (true) {
      if (isWrite) {
        const minimumWriteGapMs = 1250;
        const delay = Math.max(0, minimumWriteGapMs - (Date.now() - lastWorkspaceWriteAt));
        if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
        lastWorkspaceWriteAt = Date.now();
      }
      let response;
      try {
        response = await fetch(url, { ...options, headers });
      } catch {
        throw new Error('Could not reach Google. Your changes are still saved on this device; check your connection and retry.');
      }
      if (response.status === 429 && attempt < 4) {
        const backoff = Math.min((2 ** attempt) * 1000 + Math.random() * 1000, 8000);
        attempt += 1;
        await new Promise((resolve) => window.setTimeout(resolve, backoff));
        continue;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.error?.message || data.error_description || `Google returned error ${response.status}.`;
        if (response.status === 401) throw new Error('Your Google connection expired. Reconnect Google to continue syncing.');
        if (response.status === 403) throw new Error(`${message} Check that the free Google Sheets API and Drive API are enabled for this OAuth project.`);
        throw new Error(message);
      }
      return data;
    }
  }

  function spreadsheetTitle(email) {
    return `Crave Ledger backup — ${String(email || '').trim().toLowerCase()}`;
  }

  async function findSpreadsheet(email, accessToken) {
    const exactTitle = spreadsheetTitle(email).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const query = `name = '${exactTitle}' and mimeType = '${SPREADSHEET_MIME}' and trashed = false`;
    const url = `${DRIVE_API}/files?${new URLSearchParams({
      q: query,
      spaces: 'drive',
      pageSize: '10',
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,modifiedTime)',
    }).toString()}`;
    const result = await apiRequest(url, accessToken);
    return result.files?.[0]?.id || '';
  }

  function sheetDefinitions() {
    return TAB_NAMES.map((title) => ({
      properties: {
        title,
        gridProperties: { frozenRowCount: 1, hideGridlines: true },
        ...(title === SNAPSHOT_TAB ? { hidden: true } : {}),
      },
    }));
  }

  async function getSpreadsheet(spreadsheetId, accessToken) {
    return apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,sheets.properties`, accessToken);
  }

  async function ensureTabs(spreadsheetId, accessToken, spreadsheet) {
    const current = new Set((spreadsheet?.sheets || []).map((sheet) => sheet.properties?.title));
    const missing = TAB_NAMES.filter((title) => !current.has(title));
    if (!missing.length) return;
    await apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ requests: missing.map((title) => ({ addSheet: { properties: {
        title,
        gridProperties: { frozenRowCount: 1, hideGridlines: true },
        ...(title === SNAPSHOT_TAB ? { hidden: true } : {}),
      } } })) }),
    });
  }

  async function ensureSpreadsheet(email, accessToken) {
    let spreadsheetId = readCachedId(email);
    let spreadsheet = null;
    if (spreadsheetId) {
      try {
        spreadsheet = await getSpreadsheet(spreadsheetId, accessToken);
      } catch (error) {
        if (!/404|not found|Requested entity was not found/i.test(error.message)) throw error;
        forgetCachedId(email);
        spreadsheetId = '';
      }
    }
    if (!spreadsheetId) {
      spreadsheetId = await findSpreadsheet(email, accessToken);
      if (spreadsheetId) spreadsheet = await getSpreadsheet(spreadsheetId, accessToken);
    }
    if (!spreadsheetId) {
      const created = await apiRequest(`${SHEETS_API}/spreadsheets`, accessToken, {
        method: 'POST',
        body: JSON.stringify({ properties: { title: spreadsheetTitle(email) }, sheets: sheetDefinitions() }),
      });
      spreadsheetId = created.spreadsheetId;
      if (!spreadsheetId) throw new Error('Google created a response without a spreadsheet ID. Please retry.');
      spreadsheet = { ...created, sheets: created.sheets || sheetDefinitions() };
    }
    await ensureTabs(spreadsheetId, accessToken, spreadsheet);
    cacheId(email, spreadsheetId);
    return spreadsheetId;
  }

  function snapshotRange() {
    return `'${SNAPSHOT_TAB}'!A1:C`;
  }

  async function readSnapshot(spreadsheetId, accessToken) {
    const range = encodeURIComponent(snapshotRange());
    const result = await apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`, accessToken);
    const values = Array.isArray(result.values) ? result.values : [];
    let rows;
    if (values[0]?.[0] === 'Crave Ledger Snapshot') {
      const chunkCount = Math.max(0, Math.min(1000000, Number(values[1]?.[2]) || 0));
      rows = values.slice(2, 2 + chunkCount);
    } else {
      // Read the early format too, so an interrupted pre-release test backup remains recoverable.
      rows = values[0]?.[0] === 'Part' ? values.slice(1) : [];
    }
    const chunks = rows
      .filter((row) => Array.isArray(row) && row.length > 1 && row[1] !== '')
      .map((row) => ({ index: Number(row[0]), value: String(row[1]) }))
      .filter((row) => Number.isInteger(row.index) && row.index >= 0)
      .sort((a, b) => a.index - b.index);
    if (!chunks.length) return null;
    const json = chunks.map((chunk) => chunk.value).join('');
    let backup;
    try { backup = JSON.parse(json); } catch { throw new Error('The Google backup looks incomplete or damaged. Keep your on-device copy and try again later.'); }
    if (backup?.format !== 'crave-ledger-backup' || !backup.store || typeof backup.store !== 'object') {
      throw new Error('This spreadsheet does not contain a compatible Crave Ledger backup.');
    }
    return backup.store;
  }

  function splitText(text, maxCodePoints = 40000) {
    const chunks = [];
    let chunk = '';
    let points = 0;
    for (const character of text) {
      chunk += character;
      points += 1;
      if (points >= maxCodePoints) {
        chunks.push(chunk);
        chunk = '';
        points = 0;
      }
    }
    if (chunk || !chunks.length) chunks.push(chunk);
    return chunks;
  }

  function a1Range(tabName) {
    return `'${String(tabName).replace(/'/g, "''")}'!A1`;
  }

  async function waitForWorkspaceWriteWindow() {
    const minimumGapMs = 8000;
    const delay = Math.max(0, minimumGapMs - (Date.now() - lastWorkspaceWriteAt));
    if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
    lastWorkspaceWriteAt = Date.now();
  }

  async function saveWorkspace(email, accessToken, store, tables) {
    const spreadsheetId = await ensureSpreadsheet(email, accessToken);
    await waitForWorkspaceWriteWindow();
    const snapshot = {
      format: 'crave-ledger-backup',
      version: 1,
      savedAt: new Date().toISOString(),
      store,
    };
    const snapshotChunks = splitText(JSON.stringify(snapshot));
    const snapshotValues = [
      ['Crave Ledger Snapshot', 'format', 'chunk count'],
      ['crave-ledger-backup', 1, snapshotChunks.length],
      ...snapshotChunks.map((chunk, index) => [index, chunk]),
    ];
    // Write the restore source first in one atomic values batch. If a later
    // readable-tab update fails, the previous complete snapshot is not lost.
    await apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ valueInputOption: 'RAW', data: [{
        range: a1Range(SNAPSHOT_TAB),
        majorDimension: 'ROWS',
        values: snapshotValues,
      }] }),
    });

    const contentTabs = TAB_NAMES.filter((title) => title !== SNAPSHOT_TAB);
    const ranges = contentTabs.map((title) => `'${title.replace(/'/g, "''")}'!A:Z`);
    await apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchClear`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ ranges }),
    });
    const data = contentTabs.map((title) => ({
      range: a1Range(title),
      majorDimension: 'ROWS',
      values: Array.isArray(tables?.[title]) && tables[title].length
        ? tables[title]
        : [['No entries yet']],
    }));
    await apiRequest(`${SHEETS_API}/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ valueInputOption: 'RAW', data }),
    });
    return { spreadsheetId, savedAt: snapshot.savedAt };
  }

  async function loadWorkspace(email, accessToken) {
    const spreadsheetId = await ensureSpreadsheet(email, accessToken);
    const store = await readSnapshot(spreadsheetId, accessToken);
    return { spreadsheetId, store };
  }

  window.CraveGoogleSheets = Object.freeze({
    authorize,
    getProfile,
    loadWorkspace,
    saveWorkspace,
  });
})();
