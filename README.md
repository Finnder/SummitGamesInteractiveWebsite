# Summit Games Interactive â Website

A zero-build static site. Plain HTML/CSS, with blog posts and game pages written
as Markdown (`.md`) files that get rendered in the browser. Works out of the box
on GitHub Pages.

## Structure

```
index.html          Home
blog.html           Blog list
post.html           A single blog post (post.html#slug)
games.html          Games list
game.html           A single game page (game.html#slug)
contact.html        Contact
css/style.css       All styles
js/site.js          Fetches index.json + .md files and renders them
content/
  blog/
    posts.txt       One .md filename per line, newest at the top
    *.md            One file per post
  games/
    games.txt       One .md filename per line
    *.md            One file per game
assets/             Images / logo
```

## Adding a blog post

1. Create `content/blog/my-new-post.md` (filename: lowercase letters, numbers,
   and dashes only). Start it like this:

```markdown
# My New Post

*September 1, 2026*

First paragraph â this also becomes the summary on the blog card.
```

2. Add `my-new-post.md` on a line in `content/blog/posts.txt` (top = shown first).

That's it. Title, date, and summary are all read from the markdown itself â
there's nothing else to keep in sync. Static hosting can't list a folder's
contents, which is the only reason `posts.txt` exists.

Games work the same way in `content/games/` + `games.txt`. A line like
`**Status:** In Development` in the game's `.md` becomes the badge on its card.

## Previewing locally

Browsers block `fetch()` on `file://` pages, so opening `index.html` directly
won't load the Markdown. Run any local server instead. This repo includes one
that needs nothing installed (Windows):

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

then open http://localhost:8137. (If you have Python or Node,
`python -m http.server` or `npx serve` work too.)

## Deploying

The site is published with GitHub Pages from the `main` branch:

<https://finnder.github.io/SummitGamesInteractiveWebsite/>

Push to `main` and the live site updates on its own within a minute or two.
Pages settings live under **Settings → Pages** (Source: Deploy from a branch,
`main`, folder `/ (root)`).

All paths in the site are relative, so it works at any URL. The `.nojekyll`
file tells GitHub to serve the files as-is instead of running them through
Jekyll.
