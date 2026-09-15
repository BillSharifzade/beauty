# Hayat Beauty — landing

The presentation landing page of the Hayat Beauty shop assistant, published on
GitHub Pages: https://billsharifzade.github.io/beauty/

Only the landing lives here. The assistant itself (chat, skin diary, admin,
backend) stays in the main project; the "Открыть ассистента" buttons point at
its `/app` route and are not served by this site.

## Run locally

```sh
npm install
npm run dev        # http://localhost:3020/beauty
```

## Deploy

Every push to `main` builds a static export (`next build`, `output: "export"`)
and publishes `out/` through the workflow in `.github/workflows/pages.yml`.
The site is served under `/beauty`, set as `basePath` in `next.config.ts`;
build with `BASE_PATH=""` for a root-hosted copy.
