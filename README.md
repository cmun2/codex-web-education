# Debugging Arena — Working Title

Temporary descriptive title. This education prototype turns frontend accessibility failures into playable debugging missions. **Keyboard Trap Boss** repairs a broken modal, evaluates rendered behavior, and converts passing objectives into boss damage.

## Run locally

Use `npm run dev`. Verify with `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.

The runtime evaluator checks the rendered dialog contract; Playwright independently verifies that same contract in a browser. `MockRepairProvider` is a labelled deterministic demo flow and `DeterministicCoachProvider` is an explicit Demo Coach fallback. No arbitrary code execution, client secrets, raw authentication data, or production sandbox are provided. A future local Codex SDK coach must remain server-only, feature-flagged, allowlisted, read-only, and validated.

## Built with Codex and GPT-5.6

Codex was used for accessibility analysis, architecture, implementation, test design, debugging, and documentation in this build thread. Runtime repair is deterministic and separate from optional local AI coaching; GPT-5.6 does not run in the deployed application. Important decisions remain with the human developer.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
