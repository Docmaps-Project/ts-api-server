To run the server:

```bash
pnpm run dev
```

# Releasing

First, make a commit that updates the code you want to actually release. The commit must start
with `feat(docmaps-widget)` or `fix(docmaps-widget)`.

Then, run the following:

```bash
cd packages/docmaps-widget
pnpm run build
cd ../..
npx multi-semantic-release --no-ci
```