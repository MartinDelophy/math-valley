# Deployment

## Vercel — primary

- Live URL: https://math-valley.vercel.app/
- Repository: https://github.com/MartinDelophy/math-valley
- Vercel project: `math-valley` in `martindelophys-projects`
- Project ID: `prj_2StCjYoBBOXc4tqILP9oR1qqqJ2J`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist/client`

The Vercel project is connected to this GitHub repository. Pushes to `main` produce production deployments; other branches can produce previews. The repository's GitHub Actions workflow separately runs the build and tests.

Manual production deployment:

```sh
npm ci
npm test
npx vercel link --project math-valley
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

`vercel build` prepares the static Build Output API package under `.vercel/output`. `--prebuilt` uploads that package. `vercel.json` configures the browser output directory, headers and SPA fallback.

## Netlify — alternative

- Live URL: https://math-valley.netlify.app/
- Netlify project: `math-valley` in the `ai-creator` team
- Project ID: `0c77e644-ebe8-45b6-98f6-2bc381f63360`
- Build command: `npm run build`
- Publish directory: `dist/client`
- Node.js build runtime: 22

```sh
npm ci
npm run build
npm test
npx netlify-cli link --id 0c77e644-ebe8-45b6-98f6-2bc381f63360
npx netlify-cli deploy --prod --dir=dist/client --no-build
```

The Netlify project is linked for CLI deployments. GitHub pushes do not automatically update this alternative deployment unless you enable Netlify Git integration.

## Verification

Only the browser bundle is published on either platform. `dist/server` and `.openai` packaging remain available for the separate existing hosting workflow.

After publishing, open the public HTTPS URL and verify WebGL rendering, chapter selection and language switching. The primary Vercel URL is shown at the top of every language README and in GitHub's About → Website field.

The machine-local `.netlify`, `.vercel` and environment files are ignored by Git. No hosting access token is stored in the repository.
