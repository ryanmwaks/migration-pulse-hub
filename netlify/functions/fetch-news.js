/**
 * Migration Pulse Hub — Netlify Function: fetch-news
 * -------------------------------------------------------
 * Replaces the third-party allorigins.win CORS proxy.
 *
 * Usage from client-side JS:
 *   /.netlify/functions/fetch-news?url=<encoded-RSS-URL>
 *
 * Returns: { contents: "<raw RSS/XML string>", status: { url, content_type, http_code } }
 * (same shape as allorigins.win so existing news-feed.js works with a 1-line URL swap)
 *
 * Security:
 *   - Only fetches URLs that match the ALLOWED_DOMAINS allowlist
 *   - Adds a 10-second timeout to prevent function hangs
 *   - Strips cookies and auth headers from the upstream response
 */

const ALLOWED_DOMAINS = [
  // Core feed sources used by news-feed.js
  'unhcr.org',
  'un.org',           // news.un.org
  'theguardian.com',
  'bbc.co.uk',
  'bbc.com',
  'bbci.co.uk',       // feeds.bbci.co.uk
  'dw.com',
  'aljazeera.com',
  // Additional authoritative migration sources
  'reliefweb.int',
  'iom.int',
  'refworld.org',
  'migrationpolicy.org',
  'mixedmigration.org',
  'devex.com',
  // Regional news
  'allafrica.com',
  'nation.africa',
  'standardmedia.co.ke',
  'the-star.co.ke',
  // Feed aggregators
  'feeds.feedburner.com',
  'rss.feedburner.com',
];

exports.handler = async function (event) {
  const rawUrl = event.queryStringParameters && event.queryStringParameters.url;

  // ── Validate presence ──────────────────────────────────────────────────
  if (!rawUrl) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing ?url= parameter' }),
    };
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(rawUrl);
    new URL(targetUrl); // throws if invalid
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid URL' }),
    };
  }

  // ── Domain allowlist check ──────────────────────────────────────────────
  const hostname = new URL(targetUrl).hostname.replace(/^www\./, '');
  const allowed  = ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  if (!allowed) {
    return {
      statusCode: 403,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Domain not in allowlist: ' + hostname }),
    };
  }

  // ── Fetch with timeout ──────────────────────────────────────────────────
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch(targetUrl, {
      signal:  controller.signal,
      headers: { 'User-Agent': 'MigrationPulseHub/1.0 (+https://migrationpulsehub.org)' },
    });
    clearTimeout(timeout);

    const text = await upstream.text();

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5-min cache on the function response
      },
      body: JSON.stringify({
        contents: text,
        status: {
          url:          targetUrl,
          content_type: upstream.headers.get('content-type') || 'text/xml',
          http_code:    upstream.status,
        },
      }),
    };
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 502,
      headers: corsHeaders(),
      body: JSON.stringify({ error: isTimeout ? 'Upstream request timed out' : err.message }),
    };
  }
};

function corsHeaders () {
  return {
    // Allow all origins so previews, Netlify deploy previews, and local
    // development all work. The ALLOWED_DOMAINS allowlist (above) already
    // controls which upstream URLs can be fetched — CORS is not the guard here.
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
