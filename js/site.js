/*
 * Summit Games Interactive — markdown site engine
 *
 * Blog posts and game pages live as .md files under content/.
 * Each section has an index.json listing its entries (GitHub Pages
 * can't list directories, so the index tells us what exists).
 */

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return res.text();
}

/* Only allow slugs like "my-post-1" so a crafted URL can't fetch
 * arbitrary paths. */
function safeSlug(slug) {
  return /^[a-z0-9-]+$/i.test(slug) ? slug : null;
}

function showError(container, message) {
  container.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

/* ---------- Blog ---------- */

async function initBlog() {
  const container = document.getElementById("blog-container");
  const slug = safeSlug(new URLSearchParams(location.search).get("post") || "");

  try {
    if (slug) {
      const posts = await fetchJson("content/blog/index.json");
      const post = posts.find((p) => p.slug === slug);
      const md = await fetchText(`content/blog/${slug}.md`);
      container.innerHTML = `
        <a class="back-link" href="blog.html">&larr; All posts</a>
        ${post ? `<p class="post-meta">${escapeHtml(formatDate(post.date))}</p>` : ""}
        <article class="md-content">${marked.parse(md)}</article>`;
      if (post) document.title = `${post.title} — Summit Games Interactive`;
    } else {
      const posts = await fetchJson("content/blog/index.json");
      posts.sort((a, b) => (a.date < b.date ? 1 : -1));
      container.innerHTML = `<div class="card-grid">${posts
        .map(
          (p) => `
        <a class="card" href="blog.html?post=${encodeURIComponent(p.slug)}">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="meta">${escapeHtml(formatDate(p.date))}</div>
          <p>${escapeHtml(p.summary || "")}</p>
        </a>`
        )
        .join("")}</div>`;
    }
  } catch (err) {
    showError(container, err.message);
  }
}

/* ---------- Games ---------- */

async function initGames() {
  const container = document.getElementById("games-container");
  const slug = safeSlug(new URLSearchParams(location.search).get("game") || "");

  try {
    if (slug) {
      const games = await fetchJson("content/games/index.json");
      const game = games.find((g) => g.slug === slug);
      const md = await fetchText(`content/games/${slug}.md`);
      container.innerHTML = `
        <a class="back-link" href="games.html">&larr; All games</a>
        <article class="md-content">${marked.parse(md)}</article>`;
      if (game) document.title = `${game.title} — Summit Games Interactive`;
    } else {
      const games = await fetchJson("content/games/index.json");
      container.innerHTML = `<div class="card-grid">${games
        .map(
          (g) => `
        <a class="card" href="games.html?game=${encodeURIComponent(g.slug)}">
          ${g.status ? `<span class="tag">${escapeHtml(g.status)}</span>` : ""}
          <h3>${escapeHtml(g.title)}</h3>
          <p>${escapeHtml(g.tagline || "")}</p>
        </a>`
        )
        .join("")}</div>`;
    }
  } catch (err) {
    showError(container, err.message);
  }
}

/* ---------- Home: latest posts teaser ---------- */

async function initHome() {
  const container = document.getElementById("latest-posts");
  if (!container) return;

  try {
    const posts = await fetchJson("content/blog/index.json");
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    container.innerHTML = `<div class="card-grid">${posts
      .slice(0, 3)
      .map(
        (p) => `
      <a class="card" href="blog.html?post=${encodeURIComponent(p.slug)}">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="meta">${escapeHtml(formatDate(p.date))}</div>
        <p>${escapeHtml(p.summary || "")}</p>
      </a>`
      )
      .join("")}</div>`;
  } catch {
    container.innerHTML = "";
  }
}
