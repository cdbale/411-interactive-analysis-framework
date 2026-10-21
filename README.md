# MKTG 411 · Interactive Analysis Framework

A local-first teaching website based on `analysis-framework.pdf`. The workflow includes 18 concepts across five collapsible phases, with a multicollinearity check and a loop back to preprocessing to revise variables according to the business objective. Every concept opens the same simple notes panel: Inputs, What to do, and Outputs.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. For a production build:

```sh
pnpm test
pnpm build
pnpm preview
```

The site is published with GitHub Pages at https://cdbale.github.io/411-interactive-analysis-framework/. Students do not need an account. No database or analytics are configured. The original PDF is bundled as a downloadable source. Google Fonts enhance the typography; system fonts are used if the font service is unavailable.

## Publish updates

Push changes to `main`. The workflow in `.github/workflows/pages.yml` installs dependencies, runs the tests, builds the site, and publishes `dist/` to GitHub Pages. A failed test or build prevents publication. In the repository's Settings → Pages, the publishing source is GitHub Actions.

## Edit the teaching content

Edit `src/workflow.js` to update each concept's title, `input`, `purpose` (what to do), and `output`. The same three-section notes panel is used for every step, including preprocessing.

The earlier detailed preprocessing Markdown lessons remain in `content/` for possible future use. They are not displayed or searched in the current simple interface.

`src/styles.css` controls styling and mobile layout. Each concept has a shareable hash URL such as `https://cdbale.github.io/411-interactive-analysis-framework/#prep-test`. Local preview links work only on this computer.

## Interface

- Workflow view preserves the source diagram's train/test and scenario branches.
- Phase headings, Overview, and Expand all collapse and restore the diagram.
- Reading view provides a linear alternative on smaller screens.
- Search covers the visible step descriptions, inputs, and outputs.
- Recipe highlighting identifies the training, testing, and counterfactual locations.

## Validation

`pnpm test` checks workflow connectivity, collapse/expand integrity, and the retained preprocessing source lessons. `pnpm build` verifies the production bundle.
