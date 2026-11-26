/*
 * ZUNORO YouTube search/player
 *
 * Setup:
 * 1. Create a YouTube Data API v3 key in Google Cloud Console.
 * 2. Enable YouTube Data API v3.
 * 3. Paste the key below.
 * 4. Restrict the key to your website's HTTP referrers and YouTube Data API v3.
 *
 * This frontend key is visible to visitors. Referrer/API restrictions are essential.
 * Search is limited by YouTube API quota. This does not import all YouTube videos.
 */

const YOUTUBE_API_KEY = "PASTE_YOUR_YOUTUBE_DATA_API_KEY_HERE";
const API_URL = "https://www.googleapis.com/youtube/v3/search";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const button = document.getElementById("search-button");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const playerSection = document.getElementById("player-section");
const player = document.getElementById("player");
const nowPlaying = document.getElementById("now-playing");

function setStatus(message) {
  statusEl.textContent = message;
}

function playVideo(videoId, title) {
  // Official YouTube embedded player; playback remains on YouTube infrastructure.
  player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  nowPlaying.textContent = title || "Now playing";
  playerSection.hidden = false;
  playerSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderResults(items) {
  resultsEl.replaceChildren();

  if (!items.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No embeddable videos found. Try another search.";
    resultsEl.appendChild(p);
    return;
  }

  for (const item of items) {
    const videoId = item.id && item.id.videoId;
    if (!videoId) continue;

    const title = item.snippet?.title || "Untitled video";
    const channel = item.snippet?.channelTitle || "YouTube";
    const thumbnail = item.snippet?.thumbnails?.medium?.url
      || item.snippet?.thumbnails?.default?.url || "";

    const card = document.createElement("button");
    card.type = "button";
    card.className = "video-card";
    card.addEventListener("click", () => playVideo(videoId, title));

    const img = document.createElement("img");
    img.src = thumbnail;
    img.alt = "";
    img.loading = "lazy";

    const meta = document.createElement("span");
    meta.className = "meta";

    const titleEl = document.createElement("strong");
    titleEl.textContent = title;

    const channelEl = document.createElement("small");
    channelEl.textContent = channel;

    meta.append(titleEl, channelEl);
    card.append(img, meta);
    resultsEl.appendChild(card);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes("PASTE_YOUR")) {
    setStatus("Setup needed: add your YouTube Data API key in youtube.js.");
    return;
  }

  button.disabled = true;
  setStatus("Searching YouTube…");
  resultsEl.replaceChildren();

  try {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: "snippet",
      type: "video",
      q: query,
      maxResults: "12",
      videoEmbeddable: "true",
      safeSearch: "moderate"
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      const reason = data?.error?.message || "YouTube search failed.";
      throw new Error(reason);
    }

    const items = Array.isArray(data.items) ? data.items : [];
    renderResults(items);
    setStatus(`${items.length} result(s). Choose a video to play.`);
  } catch (error) {
    setStatus(`Could not search: ${error.message}`);
  } finally {
    button.disabled = false;
  }
});
