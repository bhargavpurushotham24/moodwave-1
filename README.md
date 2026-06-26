# Moodwave

AI-powered music discovery that breaks repetitive listening loops. Describe your mood (or hit "Surprise me") and get songs chosen for the moment, not your history.

## How it's structured

- `index.html` — the whole frontend (one file, no build step)
- `api/discover.js` — a serverless function that calls Gemini on the backend, so your API key never touches the browser

## Deploy it (GitHub + Vercel, ~5 minutes)

**1. Push this folder to GitHub**

```bash
cd moodwave-deploy
git init
git add .
git commit -m "Initial commit"
gh repo create moodwave --public --source=. --push
# (or create a repo on github.com and follow its "push an existing repo" instructions)
```

**2. Import the repo into Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Select your `moodwave` GitHub repo
- Vercel will auto-detect this as a static site with a serverless function — no build settings needed

**3. Add your free Gemini API key**

- Get a key (no credit card required) at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- In the Vercel project → **Settings → Environment Variables**
- Add `GEMINI_API_KEY` = your key
- Make sure **Production** is checked → Save
- Redeploy if you added it after the first deploy (Vercel → Deployments → ⋯ → Redeploy)

**4. Done**

Your live URL will be something like `moodwave.vercel.app`. Anyone who opens it can use it — the AI calls run through your serverless function, never exposing the key.

## Local testing (optional)

```bash
npm i -g vercel
vercel dev
```

This runs the static file *and* the `/api/discover` function locally, with the same env var setup (`vercel env pull` or a local `.env` file — see [Vercel's env docs](https://vercel.com/docs/projects/environment-variables)).

## Cost

Free. Gemini's API free tier (used here via `gemini-2.5-flash`) gives roughly 1,500 requests/day with no credit card required — far more than a portfolio link needs. Two tradeoffs worth knowing:

- Google's free tier terms allow prompts/responses to be used to improve their models. Fine for mood descriptions and song picks; don't repurpose this pattern for anything sensitive.
- If you ever want to swap back to Claude, change `api/discover.js` to call `https://api.anthropic.com/v1/messages` with an `ANTHROPIC_API_KEY` instead — the frontend doesn't need to change either way, since it just calls `/api/discover`.

## Notes

- The taste-memory badge ("Remembers you — X% adoption") persists per-browser via `localStorage`. It's not a login system — clearing browser data or switching devices resets it. A real account system would need a database, which is a reasonable v2.
- If Gemini's free-tier rate limit is hit (rare for a portfolio-scale audience), the API returns a 429 and the app will show "Something went wrong" — see Google's current limits at [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits).
