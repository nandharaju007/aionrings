#!/usr/bin/env node
/**
 * Automated SEO checks.
 *
 * For every public route, launches a headless browser against a running
 * preview server, waits for react-helmet-async to hydrate the <head>, and
 * asserts that:
 *   - <title> is present and non-default
 *   - <meta name="description"> is present
 *   - <link rel="canonical"> exists, is absolute https, and self-references
 *     the route path
 *   - Required OpenGraph tags exist (og:title, og:description, og:type,
 *     og:url, og:image) and og:url self-references the route
 *   - Required Twitter card tags exist (twitter:card, twitter:title,
 *     twitter:description, twitter:image)
 *   - Every og:image / twitter:image URL returns HTTP 200
 *
 * Usage:
 *   BASE_URL=http://localhost:4173 node scripts/seo-check.mjs
 *
 * Exits non-zero when any route fails a check. Designed to run in CI.
 */
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'https://www.aionrings.com';

const ROUTES = [
  '/',
  '/shop',
  '/preorder',
  '/partners',
  '/support',
  '/privacy-policy',
  '/cookie-policy',
  '/cis-policy',
  '/terms-of-service',
  '/accessibility',
  '/trademarks',
];

const REQUIRED_OG = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image'];
const REQUIRED_TW = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
const DEFAULT_TITLES = ['lovable app', 'lovable generated project', 'vite + react + ts'];

/** @type {{ route: string, message: string }[]} */
const failures = [];
const imageCache = new Map();

function fail(route, message) {
  failures.push({ route, message });
  console.error(`  ✗ ${message}`);
}

async function checkImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  let status = 0;
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow' });
    }
    status = res.status;
  } catch (err) {
    status = 0;
  }
  imageCache.set(url, status);
  return status;
}

async function checkRoute(browser, route) {
  console.log(`\n▶ ${route}`);
  const page = await browser.newPage();
  const url = `${BASE_URL}${route}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch (err) {
    fail(route, `navigation failed: ${err.message}`);
    await page.close();
    return;
  }

  // Give react-helmet-async a tick to mutate <head> after hydration.
  await page.waitForTimeout(500);

  const meta = await page.evaluate(() => {
    const get = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) ?? null;
    const all = (sel, attr) => Array.from(document.querySelectorAll(sel)).map((el) => el.getAttribute(attr));
    const byMeta = (key) => {
      const el =
        document.querySelector(`meta[property="${key}"]`) ||
        document.querySelector(`meta[name="${key}"]`);
      return el?.getAttribute('content') ?? null;
    };
    return {
      title: document.title,
      description: byMeta('description'),
      canonical: get('link[rel="canonical"]', 'href'),
      canonicals: all('link[rel="canonical"]', 'href'),
      og: {
        'og:title': byMeta('og:title'),
        'og:description': byMeta('og:description'),
        'og:type': byMeta('og:type'),
        'og:url': byMeta('og:url'),
        'og:image': byMeta('og:image'),
      },
      tw: {
        'twitter:card': byMeta('twitter:card'),
        'twitter:title': byMeta('twitter:title'),
        'twitter:description': byMeta('twitter:description'),
        'twitter:image': byMeta('twitter:image'),
      },
    };
  });

  // Title / description
  if (!meta.title || !meta.title.trim()) fail(route, 'missing <title>');
  else if (DEFAULT_TITLES.includes(meta.title.trim().toLowerCase()))
    fail(route, `default template <title>: "${meta.title}"`);
  if (!meta.description || !meta.description.trim()) fail(route, 'missing meta description');

  // Canonical
  if (!meta.canonical) fail(route, 'missing <link rel="canonical">');
  else {
    if (meta.canonicals.length > 1)
      fail(route, `multiple canonical tags rendered: ${meta.canonicals.join(', ')}`);
    if (!/^https:\/\//i.test(meta.canonical))
      fail(route, `canonical is not absolute https: ${meta.canonical}`);
    const canonicalPath = new URL(meta.canonical).pathname.replace(/\/$/, '') || '/';
    const routePath = route.replace(/\/$/, '') || '/';
    if (canonicalPath !== routePath)
      fail(route, `canonical path "${canonicalPath}" does not match route "${routePath}"`);
  }

  // OG required
  for (const key of REQUIRED_OG) {
    if (!meta.og[key]) fail(route, `missing ${key}`);
  }
  if (meta.og['og:url']) {
    const ogPath = new URL(meta.og['og:url']).pathname.replace(/\/$/, '') || '/';
    const routePath = route.replace(/\/$/, '') || '/';
    if (ogPath !== routePath)
      fail(route, `og:url path "${ogPath}" does not match route "${routePath}"`);
  }

  // Twitter required
  for (const key of REQUIRED_TW) {
    if (!meta.tw[key]) fail(route, `missing ${key}`);
  }

  // Image reachability (rewrite canonical host -> local server for CI)
  const imageUrls = new Set(
    [meta.og['og:image'], meta.tw['twitter:image']].filter(Boolean),
  );
  for (const raw of imageUrls) {
    const fetchUrl = raw.startsWith(CANONICAL_HOST)
      ? `${BASE_URL}${new URL(raw).pathname}`
      : raw;
    const status = await checkImage(fetchUrl);
    if (status !== 200) fail(route, `image ${raw} returned HTTP ${status}`);
    else console.log(`  ✓ image 200 ${raw}`);
  }

  if (!failures.some((f) => f.route === route)) console.log('  ✓ all checks passed');
  await page.close();
}

async function main() {
  console.log(`SEO checks against ${BASE_URL} (canonical host: ${CANONICAL_HOST})`);
  const browser = await chromium.launch();
  try {
    for (const route of ROUTES) await checkRoute(browser, route);
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\n✗ ${failures.length} SEO check(s) failed:`);
    for (const f of failures) console.error(`  - [${f.route}] ${f.message}`);
    process.exit(1);
  }
  console.log('\n✓ All SEO checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});