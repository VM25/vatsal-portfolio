# Vatsal Maniar — Portfolio

A cinematic, scroll-driven personal portfolio for **Vatsal Maniar** (M.S. Financial
Engineering, Stevens · B.S. Computer Science, ASU) — positioned for quant trading,
quant research, derivatives risk, and capital-markets roles.

The experience reads like walking through a quant-finance observatory: each section
is a "room" that proves one part of the profile, with an evidence-first project
dossier at its core.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (design tokens via `@theme` — single warm-graphite theme, no toggle)
- **React Three Fiber** + **three** + **@react-three/postprocessing** — procedural hero scene (volatility surface, particle field, bloom/fog)
- **Lenis** (smooth scroll) wired to **GSAP ScrollTrigger**
- **Framer Motion** — entrance reveals & micro-interactions
- **Zustand** — lightweight cross-scene state (active section, reduced-motion, scene-ready)

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Project structure

```
src/
  app/                  layout, page, globals.css, metadata, robots, sitemap, OG image
  components/
    layout/             Nav, Footer
    providers/          SmoothScrollProvider (Lenis↔GSAP), CanvasErrorBoundary
    sections/           Hero, Origin, Skills, Work, ProjectsDossier, Experience,
                        ResearchDirection, Contact
    three/              SceneCanvas (lazy, client-only) + HeroScene
    ui/                 Button, Reveal, SectionHeader/Shell, Tag, Stat,
                        ProjectCaseFile, EvidencePanel, icons
    visuals/            GridField, ContourField (CSS/SVG motifs)
  data/                 profile, nav, skills, education, experience, projects  ← edit content here
  hooks/                usePrefersReducedMotion, useWebGLSupport
  store/                useStore (zustand)
  types/                shared content types
public/
  images/               vatsal-maniar.jpg (optimized portrait)
  resume/               Vatsal-Maniar-Resume.pdf
  research/             Maniar-Writing-Sample.pdf
```

## Editing content

All copy lives in typed files under `src/data/` — no content is hard-coded in
components. Update those files and everything re-renders:

- `profile.ts` — name, location, positioning, links (LinkedIn, GitHub, résumé, ApexGP)
- `projects.ts` — the project case files (problem, methods, evidence, metrics, roadmap)
- `experience.ts`, `education.ts`, `skills.ts`, `nav.ts`

### Adding project screenshots

Each project lists a `placeholders` note describing what to drop in. Add your images
to `public/images/<project-id>/` (e.g. `public/images/apexgp/`) and wire them into the
`EvidencePanel` — these are intentionally **placeholders**, never fabricated charts.

## Things to confirm / replace

- **Domain:** `metadataBase`, `robots.ts`, and `sitemap.ts` use `https://vatsalmaniar.com`
  as a placeholder — change to your real deployed URL.
- **GPA:** the résumé (source of truth) lists a 3.67 graduate GPA; an older LinkedIn
  export said 3.92. Using the résumé value — update `education.ts` if needed.
- **Currency pair (FE635):** sourced as **GBP/MXN** from LinkedIn. Adjust in
  `projects.ts` if your live book differs.

## Accessibility & performance

- Semantic HTML, keyboard-navigable nav with a skip link, visible focus rings, aria labels.
- **Reduced motion:** Lenis and scene animation are bypassed when
  `prefers-reduced-motion: reduce` is set; content remains fully readable.
- **No WebGL?** The hero 3D scene is feature-detected, lazy-loaded client-only, and
  wrapped in an error boundary — the site is fully usable without it.
- The portrait is optimized (~300 KB) and served through `next/image`.

## Deploy

- **Vercel:** zero config — import the repo and deploy.
- **Netlify:** `netlify.toml` is included; Netlify auto-installs the Next.js runtime.

---

Built with Next.js, React Three Fiber, GSAP, and Framer Motion.
