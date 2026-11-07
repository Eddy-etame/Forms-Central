// UI end-to-end, through the real pages (Playwright, headless Chromium).
//
//   node scripts/test-ui.js [base-url]            default: https://eam-inlet.vercel.app
//   SHOTS_DIR=./shots node scripts/test-ui.js     also saves a screenshot per step
//
// Flow: developer signs up → creates a client and a form in the modal (no site
// URL, so the "open to any site" warning must show) → clients page → form page
// (settings save) → a native POST lands a lead → dashboard + lead modal → the
// client sets a password from an invite link and sees the lead in their inbox
// → API & MCP page → phone-width pages have no horizontal overflow.
//
// Every row it creates is deleted at the end (developer, client, form, lead,
// logs). Nothing sends e-mail: the invite checkbox is unticked and the invite
// token is written straight to the database. Needs NEXT_PUBLIC_SUPABASE_URL
// and SUPABASE_SERVICE_ROLE_KEY (environment first, then .env.local) and the
// `playwright` package resolvable from this directory (`npx playwright install
// chromium` once if the browser is missing).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const m = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  } catch {}
  return '';
}

const B = (process.argv[2] || process.env.BASE_URL || 'https://eam-inlet.vercel.app').replace(/\/+$/, '');
const SB = env('NEXT_PUBLIC_SUPABASE_URL');
const KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const SHOTS = process.env.SHOTS_DIR ? path.resolve(process.env.SHOTS_DIR) : null;
if (!SB || !KEY) { console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'); process.exit(2); }
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('playwright is not installed: npm i -D playwright && npx playwright install chromium'); process.exit(2); }

const sb = async (p, init = {}) => {
  const r = await fetch(`${SB}/rest/v1/${p}`, { ...init, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } });
  const t = await r.text();
  try { return { status: r.status, body: JSON.parse(t) }; } catch { return { status: r.status, body: t }; }
};

const ts = Date.now();
const DEV = { name: 'UI Test Developer', email: `ui-test+${ts}@test.dev`, password: `Ui-${crypto.randomBytes(9).toString('base64url')}` };
const CLIENT = { name: 'Acme UI Test', email: `acme-ui+${ts}@test.dev` };
const CLIENT_PASSWORD = `Cl-${crypto.randomBytes(9).toString('base64url')}`;
const steps = [], errors = [];
const step = (name, ok, detail = '') => { steps.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
let devId = null, formId = null, clientId = null;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'en-US' });
  const page = await ctx.newPage();
  const watch = (p, tag) => {
    p.on('pageerror', (e) => errors.push(`${tag} ${p.url()} pageerror: ${e.message.slice(0, 160)}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} ${p.url()} console: ${m.text().slice(0, 160)}`); });
  };
  watch(page, 'dev');
  const shot = async (p, n) => { if (SHOTS) await p.screenshot({ path: path.join(SHOTS, `${n}.png`) }); };
  const text = async (p) => p.locator('body').innerText();

  try {
    // 1. sign up (EN UI)
    await page.goto(`${B}/developer/signup?lang=en`, { waitUntil: 'networkidle' });
    await page.locator('input:not([type=email]):not([type=password])').first().fill(DEV.name);
    await page.locator('input[type=email]').fill(DEV.email);
    await page.locator('input[type=password]').first().fill(DEV.password);
    await page.locator('button[type=submit]').click();
    await page.waitForURL(/choose-plan|dashboard/, { timeout: 30000 });
    await shot(page, '01-after-signup');
    step('signup lands on choose-plan', /choose-plan/.test(page.url()), page.url());
    const dev = await sb(`clients?select=id,plan&email=eq.${encodeURIComponent(DEV.email.toLowerCase())}`);
    devId = dev.body?.[0]?.id ?? null;
    step('developer row exists on the free plan', !!devId && dev.body[0].plan === 'free');

    // 2. first-run dashboard → create a form with a new client in the modal
    await page.goto(`${B}/developer/dashboard`, { waitUntil: 'networkidle' });
    await shot(page, '02-dashboard-first-run');
    await page.getByRole('button', { name: /^create form$|créer le formulaire/i }).first().click();
    await page.locator('h3', { hasText: /create a form|créer un formulaire/i }).waitFor({ timeout: 15000 });
    await page.waitForTimeout(800);
    await page.locator('form select').first().selectOption('__new__');
    const texts = page.locator('form input[type=text], form input:not([type])');
    await texts.nth(0).fill('Contact UI Test');
    await texts.nth(1).fill(CLIENT.name);
    await page.locator('form input[type=email]').fill(CLIENT.email);
    const invite = page.locator('form input[type=checkbox]').first();
    if (await invite.isChecked()) await invite.uncheck();
    const langSel = page.locator('form select').nth(1);
    step('auto-reply language defaults to the UI locale', (await langSel.inputValue()) === 'en', await langSel.inputValue());
    await shot(page, '03-new-form-modal');
    await page.locator('form button[type=submit]').click();
    await page.locator('h3', { hasText: /live|en ligne/i }).waitFor({ timeout: 20000 });
    await page.waitForTimeout(600);
    await shot(page, '04-form-created');
    step('form created: framework tabs visible', (await page.locator('[role=tab]').count()) >= 6);
    step('open-origins warning shown when no site URL is given', (await page.getByText(/any site|tout site|n’importe quel site/i).count()) > 0);
    const f = await sb(`forms?select=id,allowed_origins,portal_user_id&client_id=eq.${devId}`);
    formId = f.body?.[0]?.id ?? null; clientId = f.body?.[0]?.portal_user_id ?? null;
    step('form row belongs to the new client with origins *', !!formId && !!clientId && (f.body[0].allowed_origins || []).includes('*'));
    step('modal shows the FORM_ID', (await page.locator('code', { hasText: formId || '___' }).count()) > 0);
    const modalText = await text(page);
    step('no e-mail address inside the snippet', !/action="[^"]*@/.test(modalText) && !modalText.includes(`"${CLIENT.email}"`));

    // 3. clients page
    await page.goto(`${B}/developer/dashboard/clients`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, '05-clients');
    step('clients page lists the client and its form', (await page.getByText(CLIENT.name).count()) > 0 && (await page.getByText('Contact UI Test').count()) > 0);
    step('clients page shows the absolute inbox URL', (await text(page)).includes(`${B}/portal/login`));

    // 4. form page: settings + integration
    await page.goto(`${B}/developer/dashboard/forms/${formId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await shot(page, '06-form-page');
    const save = page.getByRole('button', { name: /^save settings$|^enregistrer$/i }).first();
    step('form settings and integration panels render', (await save.count()) > 0 && (await page.locator('[role=tab]').count()) >= 6);
    await save.click();
    await page.waitForTimeout(1200);
    step('settings save shows a toast', (await page.getByText(/^saved\.?$|enregistré/i).count()) > 0);

    // 5. a lead arrives through a plain HTML form POST
    const r = await page.request.post(`${B}/api/submit/${formId}`, { form: { name: 'Jane Lead', email: 'jane@example.com', message: 'Hello from the UI test' }, maxRedirects: 0 });
    step('native submit answers 303', r.status() === 303, `status ${r.status()}`);
    await page.goto(`${B}/developer/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, '07-dashboard-first-lead');
    step('dashboard shows the lead', (await page.getByText('Jane Lead').count()) > 0);
    await page.getByText('Jane Lead').first().click();
    await page.waitForTimeout(600);
    await shot(page, '08-lead-modal');
    step('lead modal shows the message', (await page.getByText('Hello from the UI test').count()) > 0);
    step('lead modal header date reads dd Mon yyyy, hh:mm', /\d{2} [A-Z][a-z]{2} \d{4}, \d{2}:\d{2}/.test(await text(page)));
    await page.keyboard.press('Escape').catch(() => {});

    // 6. the client sets a password from an invite link and opens their inbox
    const raw = crypto.randomBytes(32).toString('base64url');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    await sb(`portal_users?id=eq.${clientId}`, { method: 'PATCH', body: JSON.stringify({ invite_token_hash: hash, invite_expires: new Date(Date.now() + 3600e3).toISOString() }) });
    const portal = await ctx.newPage();
    watch(portal, 'portal');
    await portal.goto(`${B}/portal/set-password?token=${raw}`, { waitUntil: 'networkidle' });
    await portal.locator('input[type=password]').nth(0).fill(CLIENT_PASSWORD);
    await portal.locator('input[type=password]').nth(1).fill(CLIENT_PASSWORD);
    await shot(portal, '09-set-password');
    await portal.locator('button[type=submit]').click();
    await portal.waitForURL(/\/portal(\?|$|\/$)/, { timeout: 20000 }).catch(() => {});
    await portal.waitForTimeout(1200);
    await shot(portal, '10-client-inbox');
    step('client inbox shows the lead', (await portal.getByText('Jane Lead').count()) > 0, portal.url());
    const pt = await text(portal);
    const fr = /Se déconnecter/.test(pt) && /Vos leads/.test(pt) && !/Sign out|Your leads/.test(pt);
    const en = /Sign out/.test(pt) && /Your leads/.test(pt) && !/Se déconnecter|Vos leads/.test(pt);
    step('client inbox: shell and page share one language', fr || en, fr ? 'fr' : en ? 'en' : 'mixed');

    // 7. API & MCP page
    await page.goto(`${B}/developer/dashboard/api`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, '11-api-mcp');
    step('API page shows the absolute MCP URL', (await text(page)).includes(`${B}/api/mcp`));

    // 8. phone width
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', isMobile: true, hasTouch: true });
    const mp = await m.newPage();
    watch(mp, 'mobile');
    for (const [n, p] of [['m-home', '/'], ['m-pricing', '/pricing'], ['m-docs', '/docs'], ['m-login', '/developer/login']]) {
      await mp.goto(B + p, { waitUntil: 'networkidle' });
      await mp.waitForTimeout(600);
      await shot(mp, n);
      const sw = await mp.evaluate(() => document.documentElement.scrollWidth);
      step(`phone ${p}: no horizontal overflow`, sw <= 390, `scrollWidth ${sw}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${B}/developer/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await shot(page, 'm-dashboard');
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    step('phone dashboard: no horizontal overflow', sw <= 390, `scrollWidth ${sw}`);
  } catch (e) {
    errors.push('SUITE: ' + String(e.message || e).slice(0, 300));
    console.log('SUITE ERROR', String(e.message || e).slice(0, 300));
    await shot(page, '99-error').catch(() => {});
  } finally {
    if (devId) {
      const forms = await sb(`forms?select=id&client_id=eq.${devId}`);
      for (const f of forms.body || []) {
        await sb(`submissions?form_id=eq.${f.id}`, { method: 'DELETE' });
        await sb(`failures_log?form_id=eq.${f.id}`, { method: 'DELETE' });
        await sb(`email_log?form_id=eq.${f.id}`, { method: 'DELETE' });
      }
      await sb(`forms?client_id=eq.${devId}`, { method: 'DELETE' });
      await sb(`api_keys?client_id=eq.${devId}`, { method: 'DELETE' });
      await sb(`portal_users?parent_client_id=eq.${devId}`, { method: 'DELETE' });
      await sb(`clients?id=eq.${devId}`, { method: 'DELETE' });
    }
    await browser.close();
    const failed = steps.filter((s) => !s.ok).length;
    console.log('browser errors:', errors.length ? '\n  ' + errors.join('\n  ') : 'none');
    console.log(`== ${steps.length - failed} passed, ${failed} failed ==`);
    process.exit(failed || errors.length ? 1 : 0);
  }
})();
