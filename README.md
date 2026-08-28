# Summit Games Interactive — Website

A zero-build static site. Plain HTML/CSS, with blog posts and game pages written
as Markdown (`.md`) files that get rendered in the browser. Works out of the box
on GitHub Pages.

## Structure

```
index.html          Home
blog.html           Blog (list + post view, ?post=slug)
games.html          Games (list + game view, ?game=slug)
contact.html        Contact
css/style.css       All styles
js/site.js          Fetches index.json + .md files and renders them
content/
  blog/
    index.json      List of posts (the site reads this to know what exists)
    *.md            One file per post
  games/
    index.json      List of games
    *.md            One file per game
assets/             Images / logo
```

## Adding a blog post

1. Create `content/blog/my-new-post.md` (lowercase letters, numbers, and dashes only).
2. Add an entry to `content/blog/index.json`:

```json
{
  "slug": "my-new-post",
  "title": "My New Post",
  "date": "2026-09-01",
  "summary": "One line shown on the blog list and homepage."
}
```

That's it — the post appears on the blog page and homepage automatically.
Adding a game works the same way in `content/games/` (fields: `slug`, `title`,
`tagline`, `status`).

## Previewing locally

Browsers block `fetch()` on `file://` pages, so opening `index.html` directly
won't load the Markdown. Run any local server instead. This repo includes one
that needs nothing installed (Windows):

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

then open http://localhost:8137. (If you have Python or Node,
`python -m http.server` or `npx serve` work too.)

## Deploying to GitHub Pages

1. Create a new GitHub repo and push this folder to it.
2. In the repo: **Settings → Pages → Source: Deploy from a branch**, pick
   `main` and `/ (root)`, save.
3. Your site goes live at `https://<username>.github.io/<repo>/` in a minute
   or two. (Name the repo `<username>.github.io` if you want it at the root URL.)

All paths in the site are relative, so it works at either URL. The `.nojekyll`
file tells GitHub to serve the files as-is.
