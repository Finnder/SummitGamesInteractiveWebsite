/*
 * Summit Games Interactive — markdown site engine
 *
 * Blog posts and game pages are plain .md files under content/.
 * All metadata (title, date, summary, status) is parsed from the
 * markdown itself. Each section has a posts.txt / games.txt listing
 * one filename per line — static hosting can't list directories,
 * so that file is how the site knows what exists. Top line = shown first.
 */

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return res.text();
}

/* Read a listing file: one .md filename per line, blank lines and
 * lines starting with # ignored. Returns slugs (no .md extension). */
async function fetchList(url) {
  const text = await fetchText(url);
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.replace(/\.md$/i, ""));
}

/* Only allow slugs like "my-post-1" so a crafted URL can't fetch
 * arbitrary paths. */
function safeSlug(slug) {
  return /^[a-z0-9-]+$/i.test(slug) ? slug : null;
}

/* Slug comes from the URL hash (post.html#my-post) — hashes survive every
 * environment, including file://. Old ?post=/?game= links still work. */
function pageSlug(param) {
  const fromHash = decodeURIComponent(location.hash.slice(1) || "");
  if (fromHash) return safeSlug(fromHash);
  return safeSlug(new URLSearchParams(location.search).get(param) || "");
}

/*
 * Pull display metadata out of a markdown file:
 *   title   — first "# Heading" line
 *   date    — an "*italic line*" right after the title (e.g. *August 28, 2026*)
 *   status  — a "**Status:** In Development" value, if present
 *   summary — first real paragraph, tags stripped, truncated
 */
function mdMeta(md, slug) {
  const lines = md.split(/\r?\n/);
  let title = null;
  let date = null;
  const body = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (body.length > 0) break; /* summary = first paragraph only */
      continue;
    }
    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (title && !date && body.length === 0 && /^\*[^*]+\*$/.test(line)) {
      date = line.slice(1, -1).trim();
      continue;
    }
    /* skip headings, images, raw HTML, and the status line when building the summary */
    if (line.startsWith("#") || line.startsWith("![") || line.startsWith("<")) continue;
    if (line.startsWith("**Status:**")) continue;
    body.push(line);
    if (body.join(" ").length > 220) break;
  }

  let summary = body
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .trim();
  if (summary.length > 140) summary = summary.slice(0, 140).trimEnd() + "…";

  const statusMatch = md.match(/\*\*Status:\*\*\s*([^·\n*]+)/);

  return {
    title: title || slug,
    date,
    summary,
    status: statusMatch ? statusMatch[1].trim() : null,
  };
}

function showError(container, message) {
  let hint = "";
  if (location.protocol === "file:") {
    hint =
      "<br><br>This page was opened directly from disk — browsers block loading the markdown files that way. " +
      "Run <code>serve.ps1</code> (see README) and open http://localhost:8137 instead. " +
      "On GitHub Pages this works automatically.";
  }
  container.innerHTML = `<p class="error">${escapeHtml(message)}${hint}</p>`;
}

/* ---------- Blog list (blog.html) ---------- */

async function initBlog() {
  const container = document.getElementById("blog-container");
  try {
    const slugs = await fetchList("content/blog/posts.txt");
    const metas = await Promise.all(
      slugs.map(async (slug) => ({
        slug,
        ...mdMeta(await fetchText(`content/blog/${slug}.md`), slug),
      }))
    );

    if (metas.length === 0) {
      container.innerHTML = `<p class="empty">No posts yet — check back soon.</p>`;
      return;
    }

    container.innerHTML = `<div class="card-grid">${metas
      .map(
        (p) => `
      <a class="card" href="post.html#${encodeURIComponent(p.slug)}">
        <h3>${escapeHtml(p.title)}</h3>
        ${p.date ? `<div class="meta">${escapeHtml(p.date)}</div>` : ""}
        <p>${escapeHtml(p.summary)}</p>
      </a>`
      )
      .join("")}</div>`;
  } catch (err) {
    showError(container, err.message);
  }
}

/* ---------- Blog post page (post.html#slug) ---------- */

async function initPost() {
  window.addEventListener("hashchange", () => location.reload());
  const container = document.getElementById("post-container");
  const slug = pageSlug("post");

  if (!slug) {
    showError(container, "No post specified.");
    container.innerHTML += `<p><a class="back-link" href="blog.html">&larr; All posts</a></p>`;
    return;
  }

  try {
    const md = await fetchText(`content/blog/${slug}.md`);
    container.innerHTML = `
      <a class="back-link" href="blog.html">&larr; All posts</a>
      <article class="md-content">${marked.parse(md)}</article>`;
    document.title = `${mdMeta(md, slug).title} — Summit Games Interactive`;
  } catch (err) {
    showError(container, err.message);
    container.innerHTML += `<p><a class="back-link" href="blog.html">&larr; All posts</a></p>`;
  }
}

/* ---------- Games list (games.html) ---------- */

async function initGames() {
  const container = document.getElementById("games-container");
  try {
    const slugs = await fetchList("content/games/games.txt");
    const metas = await Promise.all(
      slugs.map(async (slug) => ({
        slug,
        ...mdMeta(await fetchText(`content/games/${slug}.md`), slug),
      }))
    );

    if (metas.length === 0) {
      container.innerHTML = `<p class="empty">Nothing to show here yet — check back soon.</p>`;
      return;
    }

    container.innerHTML = `<div class="card-grid">${metas
      .map(
        (g) => `
      <a class="card" href="game.html#${encodeURIComponent(g.slug)}">
        ${g.status ? `<span class="tag">${escapeHtml(g.status)}</span>` : ""}
        <h3>${escapeHtml(g.title)}</h3>
        <p>${escapeHtml(g.summary)}</p>
      </a>`
      )
      .join("")}</div>`;
  } catch (err) {
    showError(container, err.message);
  }
}

/* ---------- Game page (game.html#slug) ---------- */

async function initGame() {
  window.addEventListener("hashchange", () => location.reload());
  const container = document.getElementById("game-container");
  const slug = pageSlug("game");

  if (!slug) {
    showError(container, "No game specified.");
    container.innerHTML += `<p><a class="back-link" href="games.html">&larr; All games</a></p>`;
    return;
  }

  try {
    const md = await fetchText(`content/games/${slug}.md`);
    container.innerHTML = `
      <a class="back-link" href="games.html">&larr; All games</a>
      <article class="md-content">${marked.parse(md)}</article>`;
    document.title = `${mdMeta(md, slug).title} — Summit Games Interactive`;
  } catch (err) {
    showError(container, err.message);
    container.innerHTML += `<p><a class="back-link" href="games.html">&larr; All games</a></p>`;
  }
}
