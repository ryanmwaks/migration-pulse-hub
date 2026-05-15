/* ============================================================
   Migration Pulse Hub — Live News Feed v1.0
   ──────────────────────────────────────────────────────────
   Fetches refugee & migration news from authoritative RSS feeds
   via the AllOrigins CORS proxy (no API key needed).
   - Filters out anything older than 7 days on every load
   - Caches results in localStorage for 2 hours
   - All feed content rendered via DOM API (no innerHTML with
     user data) to prevent XSS injection
   ============================================================ */

const NewsFeed = (function () {

  /* ── Configuration ───────────────────────────────────────── */
  const CFG = {
    cacheTTL:   2 * 60 * 60 * 1000,       // 2 hours — avoid hammering proxy
    cacheKey:   'mph_news_feed_v1',
    maxAge:     7 * 24 * 60 * 60 * 1000,  // 7 days — auto-expire cutoff
    maxPerFeed: 8,                          // articles taken per RSS feed
    maxTotal:   30,                         // articles shown in grid
    proxy:      'https://api.allorigins.win/get?url=',
    timeout:    12000,                      // 12-second per-feed timeout (ms)
  };

  /* ── RSS Feed Sources ────────────────────────────────────────
     Each entry may carry a `keywords` array — if present, only
     articles whose title OR description contains at least one
     keyword are included. Feeds without keywords are assumed
     topically focused (e.g. UNHCR). ───────────────────────── */
  const FEEDS = [
    {
      url:    'https://www.unhcr.org/rss/news.xml',
      source: 'UNHCR',
      badge:  'UNHCR',
      color:  'teal',
    },
    {
      url:    'https://news.un.org/feed/subscribe/en/news/topic/migration/feed/rss.xml',
      source: 'UN News',
      badge:  'UN News',
      color:  'navy',
    },
    {
      url:    'https://www.theguardian.com/world/refugees/rss',
      source: 'The Guardian',
      badge:  'The Guardian',
      color:  'coral',
    },
    {
      url:      'https://feeds.bbci.co.uk/news/world/rss.xml',
      source:   'BBC World',
      badge:    'BBC',
      color:    'navy',
      keywords: [
        'refugee', 'refugees', 'migrant', 'migrants', 'migration',
        'asylum', 'displacement', 'displaced', 'IDP', 'stateless',
        'repatriation', 'resettlement', 'deportation', 'trafficking',
      ],
    },
    {
      url:      'https://rss.dw.com/rdf/rss-en-all',
      source:   'DW News',
      badge:    'DW',
      color:    'gold',
      keywords: [
        'refugee', 'refugees', 'migrant', 'migrants', 'migration',
        'asylum', 'displacement', 'displaced', 'IDP', 'stateless',
        'repatriation', 'resettlement', 'UNHCR', 'IOM',
      ],
    },
    {
      url:      'https://www.aljazeera.com/xml/rss/all.xml',
      source:   'Al Jazeera',
      badge:    'Al Jazeera',
      color:    'coral',
      keywords: [
        'refugee', 'refugees', 'migrant', 'migrants', 'migration',
        'asylum seeker', 'displacement', 'IDP', 'stateless',
        'deportation', 'repatriation', 'UNHCR', 'IOM',
        'East Africa', 'Horn of Africa', 'Kenya', 'Uganda',
        'Somalia', 'Ethiopia', 'South Sudan',
      ],
    },
  ];

  /* ── Gradient map (keyed by color token) ─────────────────── */
  const GRADIENTS = {
    teal:  'linear-gradient(135deg, var(--plum-dark), var(--plum))',
    coral: 'linear-gradient(135deg, #9b1a1a, #c94d40)',
    gold:  'linear-gradient(135deg, #8a4d0a, var(--amber-dark))',
    navy:  'linear-gradient(135deg, #1a1a2e, #2B2B2B)',
  };

  /* ── Module state ────────────────────────────────────────── */
  let allArticles  = [];   // full list (all sources)
  let activeFilter = 'all';

  /* ────────────────────────────────────────────────────────────
     UTILITIES
     ──────────────────────────────────────────────────────── */

  /** Strip HTML tags and decode common HTML entities */
  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/<[^>]+>/g, '')       // strip tags
      .replace(/&amp;/g,  '&')
      .replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g,  "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g,    ' ')
      .trim();
  }

  /** Human-readable relative timestamp */
  function relativeTime(date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60)   return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400)return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  /** Short date for card meta row */
  function shortDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  /** Check whether an article matches at least one keyword */
  function matchesKeywords(title, desc, keywords) {
    if (!keywords || !keywords.length) return true;
    const hay = `${title} ${desc}`.toLowerCase();
    return keywords.some(kw => hay.includes(kw.toLowerCase()));
  }

  /* ────────────────────────────────────────────────────────────
     FETCH & PARSE
     ──────────────────────────────────────────────────────── */

  /** Parse RSS XML string into article objects */
  function parseFeed(xmlString, feed) {
    let doc;
    try {
      doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    } catch (e) {
      return [];
    }

    const items   = Array.from(doc.querySelectorAll('item'));
    const cutoff  = Date.now() - CFG.maxAge;  // 7-day boundary
    const results = [];

    for (const item of items) {
      if (results.length >= CFG.maxPerFeed) break;

      const title = sanitize(
        item.querySelector('title')?.textContent
      );
      // <link> is often a text node sibling in RSS 2.0
      const linkEl  = item.querySelector('link');
      const link    = sanitize(
        linkEl?.textContent ||
        linkEl?.nextSibling?.nodeValue ||
        item.querySelector('guid')?.textContent || ''
      );
      const description = sanitize(
        item.querySelector('description')?.textContent || ''
      );

      // Publish date — try RSS 2.0 pubDate then Dublin Core date
      const rawDate =
        item.querySelector('pubDate')?.textContent ||
        item.querySelector('dc\\:date')?.textContent ||
        item.querySelector('date')?.textContent || '';
      const pubDate = rawDate ? new Date(rawDate) : new Date();

      /* ── Guard clauses ─────────────────────────────────── */
      if (!title)                                continue; // no title
      if (!link || !link.startsWith('http'))     continue; // no safe URL
      if (isNaN(pubDate.getTime()))              continue; // unparseable date
      if (pubDate.getTime() < cutoff)            continue; // older than 7 days ← auto-delete

      /* ── Keyword filter (only for general-interest feeds) ─ */
      if (!matchesKeywords(title, description, feed.keywords || null)) continue;

      results.push({
        title,
        link,
        description: description.length > 230
          ? description.slice(0, 227) + '…'
          : description,
        pubDate,
        source: feed.source,
        badge:  feed.badge,
        color:  feed.color,
      });
    }

    return results;
  }

  /** Fetch a single feed through the CORS proxy */
  async function fetchFeed(feed) {
    const proxyUrl = CFG.proxy + encodeURIComponent(feed.url);

    // Manual timeout — AbortSignal.timeout not universally available
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CFG.timeout);

    try {
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return parseFeed(json.contents || '', feed);
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[NewsFeed] ${feed.source} failed:`, err.message);
      return [];
    }
  }

  /** Fetch all feeds in parallel, merge, deduplicate, sort */
  async function fetchAll() {
    const settled = await Promise.allSettled(FEEDS.map(fetchFeed));
    const flat    = settled.flatMap(r =>
      r.status === 'fulfilled' ? r.value : []
    );

    // Sort newest first
    flat.sort((a, b) => b.pubDate - a.pubDate);

    // Deduplicate by leading 60 characters of title (catches syndication copies)
    const seen = new Set();
    return flat.filter(a => {
      const key = a.title.slice(0, 60).toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, CFG.maxTotal);
  }

  /* ────────────────────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────────────────── */

  /** Build a single news card using DOM API only — never innerHTML
   *  with feed data, so XSS from malicious RSS content is impossible */
  function buildCard(article) {
    const tagClass = {
      teal:  'mph-tag--teal',
      coral: 'mph-tag--coral',
      gold:  'mph-tag--gold',
      navy:  '',
    }[article.color] || '';

    /* Wrapper */
    const card = document.createElement('article');
    card.className = 'mph-news-card nf-card mph-reveal';
    card.dataset.source = article.source.toLowerCase();

    /* ── Thumbnail ─────────────────────────────────────────── */
    const thumb = document.createElement('div');
    thumb.className = 'mph-news-img nf-card-thumb';
    thumb.style.cssText = [
      'aspect-ratio:16/9',
      `background:${GRADIENTS[article.color] || GRADIENTS.navy}`,
      'border-radius:var(--r-lg) var(--r-lg) 0 0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'position:relative',
      'overflow:hidden',
    ].join(';');

    /* Source watermark text */
    const watermark = document.createElement('span');
    watermark.className = 'nf-card-watermark';
    watermark.textContent = article.source;
    thumb.appendChild(watermark);

    /* "LIVE" pill */
    const liveBadge = document.createElement('span');
    liveBadge.className = 'nf-live-pill';
    liveBadge.innerHTML = '<span class="nf-live-dot"></span>LIVE';
    thumb.appendChild(liveBadge);

    /* Age label (e.g. "3h ago") */
    const ageLabel = document.createElement('span');
    ageLabel.className = 'nf-age-label';
    ageLabel.textContent = relativeTime(article.pubDate);
    thumb.appendChild(ageLabel);

    card.appendChild(thumb);

    /* ── Body ──────────────────────────────────────────────── */
    const body = document.createElement('div');
    body.className = 'mph-news-body';

    /* Meta row: tag + date */
    const meta = document.createElement('div');
    meta.className = 'mph-news-meta';

    const tag = document.createElement('span');
    tag.className = `mph-tag ${tagClass}`;
    tag.textContent = article.badge;

    const dateEl = document.createElement('span');
    dateEl.className = 'mph-news-date';
    dateEl.textContent = shortDate(article.pubDate);

    meta.appendChild(tag);
    meta.appendChild(dateEl);

    /* Headline */
    const heading = document.createElement('h3');
    heading.className = 'mph-news-title';
    const titleLink = document.createElement('a');
    titleLink.href   = article.link;
    titleLink.target = '_blank';
    titleLink.rel    = 'noopener noreferrer';
    titleLink.textContent = article.title;   // textContent = safe, no XSS
    heading.appendChild(titleLink);

    /* Excerpt */
    const excerpt = document.createElement('p');
    excerpt.className = 'mph-news-excerpt';
    excerpt.textContent = article.description;  // textContent = safe

    /* Read more */
    const readMore = document.createElement('a');
    readMore.href      = article.link;
    readMore.target    = '_blank';
    readMore.rel       = 'noopener noreferrer';
    readMore.className = 'nf-read-more';
    readMore.textContent = 'Read Full Story ↗';

    body.appendChild(meta);
    body.appendChild(heading);
    body.appendChild(excerpt);
    body.appendChild(readMore);
    card.appendChild(body);

    return card;
  }

  /** Render skeleton loading cards */
  function buildSkeletons(count = 6) {
    const grid = document.getElementById('nf-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      // Skeleton uses only static strings — innerHTML is safe here
      const sk = document.createElement('div');
      sk.className = 'nf-skeleton';
      sk.setAttribute('aria-hidden', 'true');
      sk.innerHTML = `
        <div class="nf-sk-img"></div>
        <div class="nf-sk-body">
          <div class="nf-sk-tag"></div>
          <div class="nf-sk-title"></div>
          <div class="nf-sk-title" style="width:72%"></div>
          <div class="nf-sk-text"></div>
          <div class="nf-sk-text" style="width:58%"></div>
        </div>`;
      grid.appendChild(sk);
    }
  }

  /** Populate the filter tab bar */
  function buildFilters(articleList) {
    const bar = document.getElementById('nf-filter-bar');
    if (!bar) return;

    // Determine which sources actually have articles in the last 7 days
    const activeSources = new Set(articleList.map(a => a.source.toLowerCase()));

    bar.innerHTML = '';

    // "All" tab
    const allBtn = document.createElement('button');
    allBtn.className = `nf-filter-btn${activeFilter === 'all' ? ' active' : ''}`;
    allBtn.dataset.filter = 'all';
    allBtn.textContent = `All Sources`;
    bar.appendChild(allBtn);

    // Per-source tabs (only those with at least one article)
    FEEDS.forEach(feed => {
      if (!activeSources.has(feed.source.toLowerCase())) return;
      const btn = document.createElement('button');
      btn.className = `nf-filter-btn${activeFilter === feed.source.toLowerCase() ? ' active' : ''}`;
      btn.dataset.filter = feed.source.toLowerCase();
      btn.textContent = feed.badge;
      bar.appendChild(btn);
    });

    // Click handler — delegate from bar
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.nf-filter-btn');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      bar.querySelectorAll('.nf-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(allArticles);
    });
  }

  /** Render (or re-render after filter change) the article grid */
  function renderGrid(list) {
    const grid    = document.getElementById('nf-grid');
    const countEl = document.getElementById('nf-count');
    const emptyEl = document.getElementById('nf-empty');
    if (!grid) return;

    const visible = activeFilter === 'all'
      ? list
      : list.filter(a => a.source.toLowerCase() === activeFilter);

    grid.innerHTML = '';
    if (countEl) countEl.textContent = visible.length;

    if (!visible.length) {
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    visible.forEach(a => grid.appendChild(buildCard(a)));

    // Re-hook IntersectionObserver for scroll-reveal on new cards
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('mph-revealed');
            io.unobserve(e.target);
          }
        }),
        { threshold: 0.08 }
      );
      grid.querySelectorAll('.mph-reveal').forEach(el => io.observe(el));
    } else {
      // Fallback: reveal everything immediately
      grid.querySelectorAll('.mph-reveal')
          .forEach(el => el.classList.add('mph-revealed'));
    }
  }

  /** Update the "last updated" timestamp line */
  function setTimestamp(ts) {
    const el = document.getElementById('nf-last-updated');
    if (!el) return;
    const d = new Date(ts);
    el.textContent =
      `Last updated: ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` +
      ` · ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  /** Show the error / retry state */
  function showError() {
    const grid = document.getElementById('nf-grid');
    if (!grid) return;
    // Static error markup — safe to use innerHTML here
    grid.innerHTML = `
      <div class="nf-error-state">
        <div class="nf-error-icon">📡</div>
        <strong>Could not reach the live feed</strong>
        <p>There may be a temporary network issue with one or more sources.
           Please try refreshing or check back shortly.</p>
        <button class="mph-btn sm dark" onclick="NewsFeed.refresh()">↺ Try Again</button>
      </div>`;
  }

  /* ────────────────────────────────────────────────────────────
     LOAD ORCHESTRATION
     ──────────────────────────────────────────────────────── */

  async function load(forceRefresh) {
    const grid = document.getElementById('nf-grid');
    if (!grid) return;   // section not present on this page

    /* 1. Try cache */
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(CFG.cacheKey);
        if (raw) {
          const cache = JSON.parse(raw);
          // Cache valid AND not stale?
          if (
            cache.timestamp &&
            Date.now() - cache.timestamp < CFG.cacheTTL &&
            Array.isArray(cache.articles) &&
            cache.articles.length
          ) {
            // Rehydrate dates (stored as ISO strings)
            allArticles = cache.articles.map(a => ({
              ...a,
              pubDate: new Date(a.pubDate),
            }));
            buildFilters(allArticles);
            renderGrid(allArticles);
            setTimestamp(cache.timestamp);
            return;
          }
        }
      } catch (_) { /* corrupt cache — fall through to fresh fetch */ }
    }

    /* 2. Show skeletons while fetching */
    buildSkeletons(6);

    /* 3. Fetch fresh data */
    const fresh = await fetchAll();

    if (!fresh.length) {
      showError();
      return;
    }

    allArticles = fresh;

    /* 4. Persist to cache (dates serialised as ISO strings) */
    try {
      localStorage.setItem(CFG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        articles:  allArticles.map(a => ({ ...a, pubDate: a.pubDate.toISOString() })),
      }));
    } catch (_) { /* localStorage full — skip caching */ }

    /* 5. Render */
    buildFilters(allArticles);
    renderGrid(allArticles);
    setTimestamp(Date.now());
  }

  /* ────────────────────────────────────────────────────────────
     PUBLIC API
     ──────────────────────────────────────────────────────── */
  return {
    /** Called on DOMContentLoaded — uses cache if fresh */
    init: () => load(false),

    /** Called by the "Refresh" button — skips cache */
    refresh: () => {
      activeFilter = 'all';
      load(true);
    },
  };

})();

document.addEventListener('DOMContentLoaded', () => NewsFeed.init());
