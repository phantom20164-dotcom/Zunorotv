const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60"
};

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGIN || "*").split(",").map(s => s.trim()).filter(Boolean);
  const allowOrigin = allowed.includes("*") ? "*" : (allowed.includes(origin) ? origin : "null");
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "vary": "Origin"
  };
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...JSON_HEADERS, ...corsHeaders(request, env) }
  });
}

function validInstagramUrl(raw) {
  try {
    const u = new URL(raw);
    if (!["instagram.com", "www.instagram.com"].includes(u.hostname)) return false;
    return /^\/(reel|p|tv)\/[A-Za-z0-9_-]+\/?/.test(u.pathname);
  } catch { return false; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, request, env);

    if (url.pathname === "/" || url.pathname === "/api/health") {
      return json({ ok: true, service: "ZUNORO TV video connector", endpoints: [
        "/api/youtube/search?q=search-term",
        "/api/instagram/embed?url=https://www.instagram.com/reel/SHORTCODE/"
      ] }, 200, request, env);
    }

    if (url.pathname === "/api/youtube/search") {
      if (!env.YOUTUBE_API_KEY) return json({ error: "Server setup incomplete: YOUTUBE_API_KEY secret is missing." }, 503, request, env);
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) return json({ error: "Add a search term using ?q=" }, 400, request, env);
      if (q.length > 120) return json({ error: "Search term is too long." }, 400, request, env);

      const maxResults = Math.min(25, Math.max(1, Number(url.searchParams.get("maxResults") || 12)));
      const params = new URLSearchParams({
        key: env.YOUTUBE_API_KEY,
        part: "snippet",
        type: "video",
        q,
        maxResults: String(maxResults),
        videoEmbeddable: "true",
        safeSearch: "moderate"
      });
      const pageToken = url.searchParams.get("pageToken");
      if (pageToken) params.set("pageToken", pageToken);

      const searchRes = await fetch("https://www.googleapis.com/youtube/v3/search?" + params.toString());
      const searchData = await searchRes.json();
      if (!searchRes.ok) return json({ error: "YouTube search failed", details: searchData.error?.message || "API error" }, searchRes.status, request, env);

      const ids = (searchData.items || []).map(x => x.id?.videoId).filter(Boolean);
      let statsById = {};
      if (ids.length) {
        const vParams = new URLSearchParams({
          key: env.YOUTUBE_API_KEY,
          part: "statistics,contentDetails,status",
          id: ids.join(",")
        });
        const statsRes = await fetch("https://www.googleapis.com/youtube/v3/videos?" + vParams.toString());
        const statsData = await statsRes.json();
        if (statsRes.ok) {
          for (const v of (statsData.items || [])) statsById[v.id] = v;
        }
      }

      const items = (searchData.items || []).map(item => {
        const id = item.id?.videoId;
        const v = statsById[id] || {};
        return {
          platform: "youtube",
          videoId: id,
          title: item.snippet?.title || "",
          channelTitle: item.snippet?.channelTitle || "",
          publishedAt: item.snippet?.publishedAt || "",
          description: item.snippet?.description || "",
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
          views: v.statistics?.viewCount ?? null,
          likes: v.statistics?.likeCount ?? null,
          comments: v.statistics?.commentCount ?? null,
          duration: v.contentDetails?.duration || null,
          embeddable: v.status?.embeddable ?? true,
          embedUrl: id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null,
          sourceUrl: id ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : null
        };
      });
      return json({ items, nextPageToken: searchData.nextPageToken || null, totalResults: searchData.pageInfo?.totalResults ?? null }, 200, request, env);
    }

    if (url.pathname === "/api/instagram/embed") {
      const mediaUrl = url.searchParams.get("url") || "";
      if (!validInstagramUrl(mediaUrl)) {
        return json({ error: "Provide a public Instagram Reel/Post URL (instagram.com/reel/..., /p/... or /tv/...). Private content is not supported." }, 400, request, env);
      }
      const params = new URLSearchParams({ url: mediaUrl, omitscript: "true", maxwidth: "658" });
      const metaRes = await fetch("https://graph.facebook.com/v27.0/instagram_oembed?" + params.toString());
      const data = await metaRes.json();
      if (!metaRes.ok) return json({ error: "Instagram embed lookup failed", details: data.error?.message || "The post may be private, unavailable, or not embeddable." }, metaRes.status, request, env);
      return json({
        platform: "instagram",
        html: data.html || "",
        width: data.width || null,
        provider: data.provider_name || "Instagram",
        sourceUrl: mediaUrl,
        note: "Render this official embed HTML in a trusted/sandboxed embed container; keep Instagram attribution and controls."
      }, 200, request, env);
    }

    return json({ error: "Not found" }, 404, request, env);
  }
};
