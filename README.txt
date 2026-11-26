# ZUNORO YouTube page

This folder adds a standalone YouTube search-and-player page to the ZUNORO website.

## Upload to GitHub

1. In your existing ZUNORO repository, create a new folder named `youtube`.
2. Upload these three files into that folder:
   - `index.html`
   - `youtube.css`
   - `youtube.js`
3. Commit the changes. If Netlify is connected to this repository, it should deploy automatically.
4. Open: `https://YOUR-SITE-DOMAIN/youtube/`

## Important: enable search

Search requires a YouTube Data API v3 key:
1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project.
3. Enable **YouTube Data API v3**.
4. Create an API key.
5. Restrict the key to your ZUNORO website's HTTP referrers and to YouTube Data API v3.
6. Paste the key into `youtube.js`, replacing `PASTE_YOUR_YOUTUBE_DATA_API_KEY_HERE`.

The API key is visible in frontend code, so restrictions are important. API quota limits apply. Do not use an unrestricted key.

## What this does / does not do

- Searches YouTube for videos marked as embeddable.
- Plays a selected video in the official YouTube embedded player.
- Videos stream from YouTube; this project does not download, copy, or re-host them.
- It cannot show every YouTube video. Availability, embedding permissions, age/region restrictions, ads and YouTube terms apply.
- This is a separate page. To add a link in the existing ZUNORO navigation, add a link to `/youtube/` in the existing site's menu after checking its source structure.
