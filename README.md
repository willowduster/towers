# TOWERS

Minimal dark gothic website for the doom/sludge metal band **TOWERS**.

## Deploying

The site deploys automatically to GitHub Pages on every push to `main` via the included GitHub Actions workflow (`.github/workflows/deploy.yml`).

To enable GitHub Pages in your repo settings:
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**

## Customising

| File | What to change |
|------|---------------|
| `logo.svg` | Replace with your actual band logo. Keep it as an SVG (or PNG/WebP) with a **black fill and transparent background** — the CSS `filter: invert(1)` makes it appear white on the dark site automatically. |
| `index.html` → `<iframe src="...">` | Replace the Owncast embed `src` with your own stream URL, e.g. `https://stream.yourdomain.com/embed/video` |
| `index.html` → footer `<a href="...">` | Replace the Instagram and YouTube URLs with your actual profile links |
| `index.html` → About paragraph | Replace the placeholder bio text |

## Stack

Pure HTML + CSS + vanilla JS — no frameworks, no build step, no dependencies.
