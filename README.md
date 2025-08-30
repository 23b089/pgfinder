This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Vercel setup (quick)

1. Create a Vercel account and import this repository.
2. In your Vercel Project Settings -> Environment Variables, add the keys from `.env.example` as `NEXT_PUBLIC_*` variables and set their values from your Firebase console.
3. Select the `main` branch (or the branch you deploy) and deploy. Vercel will run `npm run build` by default.

Notes:
- Keep any server-side Firebase service account JSON out of `NEXT_PUBLIC_` variables; instead set it as a secret (e.g., `FIREBASE_SERVICE_ACCOUNT_JSON`) and read it only in server code.
- If you need custom build or routes, add a `vercel.json` file (an example is included in the repo).

If you want me to add a scripted migration for existing Firestore documents (e.g., to normalize price-per-head fields), I can add a Node script and README instructions to run it from your environment.
