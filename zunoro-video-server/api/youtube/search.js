// ZUNORO TV - YouTube Search API for Vercel

function send(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.json(body);
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  const permitted = allowed.includes('*') || allowed.includes(origin);

  if (permitted && origin) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      allowed.includes('*') ? '*' : origin
    );
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return send(res, 405, { error: 'Method not allowed' });
  }

  if (!permitted) {
    return send(res, 403, { error: 'Origin not allowed' });
  }

  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return send(res, 503, {
      error: 'Server setup incomplete: YOUTUBE_API_KEY is missing.'
    });
  }

  const q = String(req.query.q || '').trim();

  if (!q) {
    return send(res, 400, {
      error: 'Add a search term using ?q='
    });
  }

  if (q.length > 120) {
    return send(res, 400, {
      error: 'Search term is too long.'
    });
  }

  try {
    const params = new URLSearchParams({
      key,
      part: 'snippet',
      type: 'video',
      q,
      maxResults: String(
        Math.min(25, Math.max(1, Number(req.query.maxResults) || 12))
      ),
      videoEmbeddable: 'true',
      safeSearch: 'moderate'
    });

    if (req.query.pageToken) {
      params.set('pageToken', String(req.query.pageToken));
    }

    const sr = await fetch(
      'https://www.googleapis.com/youtube/v3/search?' + params
    );

    const sd = await sr.json();

    if (!sr.ok) {
      return send(res, sr.status, {
        error: 'YouTube search failed',
        details: sd.error?.message || 'API error'
      });
    }

    const ids = (sd.items || [])
      .map(x => x.id?.videoId)
      .filter(Boolean);

    const stats = {};

    if (ids.length) {
      const vp = new URLSearchParams({
        key,
        part: 'statistics,contentDetails,status',
        id: ids.join(',')
      });

      const vr = await fetch(
        'https://www.googleapis.com/youtube/v3/videos?' + vp
      );

      const vd = await vr.json();

      if (vr.ok) {
        for (const v of (vd.items || [])) {
          stats[v.id] = v;
        }
      }
    }

    const items = (sd.items || []).map(item => {
      const id = item.id?.videoId;
      const v = stats[id] || {};

      return {
        platform: 'youtube',
        videoId: id,
        title: item.snippet?.title || '',
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
        description: item.snippet?.description || '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          '',
        views: v.statistics?.viewCount ?? null,
        likes: v.statistics?.likeCount ?? null,
        comments: v.statistics?.commentCount ?? null,
        duration: v.contentDetails?.duration || null,
        embeddable: v.status?.embeddable ?? true,
        embedUrl: id
          ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
          : null,
        sourceUrl: id
          ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
          : null
      };
    });

    return send(res, 200, {
      items,
      nextPageToken: sd.nextPageToken || null,
      totalResults: sd.pageInfo?.totalResults ?? null
    });

  } catch (e) {
    return send(res, 500, {
      error: 'Server error while contacting YouTube.'
    });
  }
};
