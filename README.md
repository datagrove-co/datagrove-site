# Datagrove web site

Marketing site for Datagrove, served at [https://datagrove.co](https://datagrove.co).

A single-page landing site with an optional Markdown-based blog, deployed to GitHub Pages via GitHub Actions.

## Stack

- **[Astro](https://astro.build/) v5** — static site generator. Component-based, ships near-zero JavaScript.
- **[Tailwind CSS](https://tailwindcss.com/) v4** — utility-first styling, wired in via the `@tailwindcss/vite` plugin.
- **[@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)** — prose styling for blog post bodies.
- **Astro Content Collections** — typed Markdown blog posts with frontmatter schema validation.
- **GitHub Actions** + `withastro/action@v3` — builds the site and publishes to GitHub Pages on every push to `main`.
- **[Web3Forms](https://web3forms.com/)** — hosted form backend that emails contact submissions. No server to run.

## Requirements

- **Node.js 20+** and **npm** (Astro 5 requires Node ≥ 18.20.8 or ≥ 20.3.0).
- A working `git` install for committing and pushing.
- A Web3Forms access key if you want the contact form to actually deliver email (see [Configuring the contact form](#configuring-the-contact-form) below).

## Project layout

```
.github/workflows/deploy.yml   GitHub Actions workflow that builds and deploys to Pages
astro.config.mjs               Astro configuration (site URL, Tailwind plugin)
tsconfig.json                  TypeScript config (extends Astro's strict preset)
package.json                   npm scripts and dependencies
public/                        Static assets copied verbatim into the build output
  favicon.svg
src/
  layouts/
    Base.astro                 Shared <head>, meta tags, global CSS import
  components/
    Header.astro               Top nav with logo + "Services / Writing / Contact" links
    Hero.astro                 Headline, subhead, primary CTA
    Services.astro             Six service cards with inline SVG icons
    ContactForm.astro          Web3Forms-powered contact form (client-side fetch)
    Footer.astro
  pages/
    index.astro                Landing page (composes the components above)
    blog/
      index.astro              Blog listing (renders "Writing — soon." when empty)
      [...slug].astro          Single blog post template
  content/
    config.ts                  Blog Content Collection schema
    blog/                      Drop .md files here to publish posts
  styles/
    global.css                 Tailwind import, custom `grove-*` accent palette, base layer
```

## Running locally

Install dependencies once:

```bash
npm install
```

Start the dev server with hot reload:

```bash
npm run dev
```

The site is served at [http://localhost:4321](http://localhost:4321). Edits to `.astro`, `.md`, and CSS files reload automatically.

Build the production output locally to validate before pushing:

```bash
npm run build
```

The result lands in `dist/`. To preview the built site:

```bash
npm run preview
```

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which:

1. Checks out the repo.
2. Runs `withastro/action@v3` — installs dependencies, builds the site, uploads `dist/` as a Pages artifact.
3. Calls `actions/deploy-pages@v4` to publish the artifact to the `github-pages` environment.

The custom domain `datagrove.co` is bound at the repository level in **Settings → Pages → Custom domain**. Under the GitHub Actions deployment model, no `CNAME` file is required in the repo — [GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) confirms that "if you are publishing from a custom GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file is ignored and is not required."

**To deploy a change:** commit to `main` and push. The workflow runs automatically; the new version is live a minute or two later.

**To deploy manually:** the workflow also accepts `workflow_dispatch`, so you can trigger a build from the Actions tab without pushing.

## Configuring the contact form

The contact form posts to [web3forms.com](https://web3forms.com/) — a free hosted form backend that emails submissions to the address you register.

One-time setup:

1. Sign up at [web3forms.com](https://web3forms.com/) with the email you want submissions sent to. Free tier covers 250 submissions/month.
2. Copy the **Access Key** they show you.
3. Open [`src/components/ContactForm.astro`](src/components/ContactForm.astro) and replace `YOUR_WEB3FORMS_ACCESS_KEY` with the real key.
4. Commit and push.

The access key is designed to be public — Web3Forms mitigates spam server-side, and the key cannot be used to read your inbox or change settings. No environment-variable plumbing needed.

## Making changes

**Edit the landing page copy:** update the relevant component in [`src/components/`](src/components/). The hero copy lives in [`Hero.astro`](src/components/Hero.astro), the services list in [`Services.astro`](src/components/Services.astro), etc.

**Change the accent color or typography:** edit the `@theme` block in [`src/styles/global.css`](src/styles/global.css). Tailwind v4 reads custom design tokens from there.

**Add a new page** (e.g. an `/about` page):

1. Create `src/pages/about.astro`.
2. Import `Base`, `Header`, `Footer` and compose them, like [`src/pages/index.astro`](src/pages/index.astro).
3. Add a nav link in [`src/components/Header.astro`](src/components/Header.astro) if you want it discoverable.

Astro uses file-based routing: any `.astro` or `.md` file under `src/pages/` becomes a route at the matching URL.

## Writing a blog post

The blog is opt-in scaffolding. While `src/content/blog/` is empty, [`/blog`](https://datagrove.co/blog) renders "Writing — soon." As soon as you add a post, it shows up automatically.

To publish a post:

1. Create a file at `src/content/blog/<slug>.md`, e.g. `2026-05-25-hello-world.md`. The filename (minus `.md`) becomes the URL slug: `/blog/2026-05-25-hello-world/`.
2. Add frontmatter and Markdown body:

   ```markdown
   ---
   title: "Hello, world"
   description: "Short one-line summary used on the blog index and in meta tags."
   pubDate: 2026-05-25
   draft: false
   ---

   Your post content in regular Markdown. Headings, lists, code blocks, links — all work.

   ## A subheading

   Paragraph text, **bold**, _italic_, and so on.
   ```

3. (Optional) preview locally with `npm run dev` and visit [http://localhost:4321/blog](http://localhost:4321/blog).
4. Commit and push. The workflow rebuilds and publishes the post.

**Frontmatter schema** (enforced by [`src/content/config.ts`](src/content/config.ts) — builds fail if a post is malformed):

| Field         | Type      | Required | Notes                                                              |
| ------------- | --------- | -------- | ------------------------------------------------------------------ |
| `title`       | string    | yes      | Used as the page `<h1>` and in `<title>`.                          |
| `description` | string    | yes      | Shown on the blog index and used as the meta description.          |
| `pubDate`     | date      | yes      | ISO date (`YYYY-MM-DD`). Posts are sorted by this newest-first.    |
| `draft`       | boolean   | no       | If `true`, the post is excluded from the build and the index page. |

**Showing the "Writing" link in the header:** while no posts exist, the link is hidden on the landing page. To expose it, pass `showBlog` when rendering the header in [`src/pages/index.astro`](src/pages/index.astro):

```astro
<Header showBlog />
```

## Troubleshooting

- **`404` on `https://datagrove.co/` right after a deploy:** browser/CDN cache. Hard-reload (`Cmd+Shift+R`) or open an incognito window. Pages serves with a 10-minute Fastly cache by default.
- **`https://www.datagrove.co/` SSL error:** after changing custom-domain settings, GitHub re-provisions the TLS certificate. The dashboard shows the progress; it can take up to 15 minutes.
- **Workflow fails on build:** check the run logs in the Actions tab. Most build failures are blog frontmatter schema mismatches — confirm `title`, `description`, and `pubDate` are all set.
- **Local `npm run build` works but the deployed site shows old content:** wait a minute or two for Fastly to revalidate, then hard-reload.
