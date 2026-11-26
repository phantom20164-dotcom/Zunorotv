# ZUNORO TV — Server Connector (Cloudflare Worker)

This package adds a small serverless API. It does **not** host or store video files.

## What it provides

- `GET /api/health` — check that the Worker is running.
- `GET /api/youtube/search?q=...` — searches embeddable public YouTube videos and returns available title, channel, thumbnail, views, likes and comments.
- `GET /api/instagram/embed?url=...` — returns the official embed HTML for a public Instagram Reel/Post URL. Private posts and a general Instagram Reels discovery feed are not provided by this endpoint.

YouTube videos must be played using YouTube's official embedded player. Instagram content must retain the official Instagram embed attribution and controls. Do not hide or remove platform branding/attribution.

## Deploy on Cloudflare

1. Create/sign in to a Cloudflare account.
2. Open **Workers & Pages** → **Create** → **Worker**.
3. Create a Worker named `zunoro-video-connector`.
4. Upload/deploy the `src/index.js` code (or deploy this folder using Wrangler).
5. In Worker **Settings → Variables and Secrets**, add:
   - Secret `YOUTUBE_API_KEY` = your YouTube Data API v3 key.
   - Variable `ALLOWED_ORIGIN` = `https://phantom20164-dotcom.github.io` (the origin only; no `/Zunorotv/` path).
6. In Google Cloud Console, enable **YouTube Data API v3**, create an API key, and restrict it to the YouTube Data API v3. Keep the key only in Worker secrets; never put it in website JavaScript.
7. If using Wrangler locally:
   - `npm install -g wrangler`
   - `wrangler login`
   - `wrangler secret put YOUTUBE_API_KEY`
   - `wrangler deploy`

After deployment, test:
- `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/health`
- `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/youtube/search?q=cricket`
- `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/instagram/embed?url=https%3A%2F%2Fwww.instagram.com%2Freel%2FVALID_PUBLIC_SHORTCODE%2F`

## Frontend calls

Replace `YOUR-WORKER-URL` with the deployed Worker URL:

```js
const API_BASE = "https://YOUR-WORKER-URL";

async function searchYouTubeVideos(query) {
  const response = await fetch(
    `${API_BASE}/api/youtube/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error((await response.json()).error || "Search failed");
  return response.json();
}

async function getInstagramEmbed(instagramUrl) {
  const response = await fetch(
    `${API_BASE}/api/instagram/embed?url=${encodeURIComponent(instagramUrl)}`
  );
  if (!response.ok) throw new Error((await response.json()).error || "Embed lookup failed");
  return response.json();
}
```

For YouTube playback, use `item.embedUrl` in the official YouTube iframe player.
For Instagram, place returned `html` in a controlled iframe/sandbox or a trusted embed component. Do not inject arbitrary user-provided HTML. This endpoint validates Instagram URLs but your frontend should still render the returned HTML safely.

## Important limits

- YouTube Data API has quota limits. `search.list` costs 100 quota units per request; the default project allocation is commonly 10,000 units/day, subject to Google changes. Cache search results and avoid repeated searches.
- Likes/comments may be unavailable for some videos; the API can return `null`.
- This does not download or re-host third-party videos, bypass privacy, DRM, restrictions, or embed settings.
- Instagram endpoint is for public posts/reels that Meta allows to be embedded. It is not a universal Instagram feed/search API.
- No API secret belongs in GitHub Pages frontend code.
- Configure `ALLOWED_ORIGIN` to your exact site origin. If your site uses a custom domain, change it accordingly.
