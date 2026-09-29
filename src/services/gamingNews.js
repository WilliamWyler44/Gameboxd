const FALLBACK_COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001'
const REDDIT_NEWS_PAGE_URL = 'https://www.reddit.com/r/gamernews/new/'
const CACHE_TTL_MS = 5 * 60 * 1000
const NOISE_NEWS_PATTERNS = [/upgrade\s+subscription\s+plan/gi]

// News source rotation system
const NEWS_SOURCES = {
  REDDIT: 'reddit',
  FALLBACK: 'fallback',
}

const NEWS_SOURCE_ORDER = [NEWS_SOURCES.REDDIT, NEWS_SOURCES.FALLBACK]

let cache = {
  timestamp: 0,
  articles: [],
  source: '',
}

// Get current news source from localStorage.
const getCurrentNewsSource = () => localStorage.getItem('gameboxd_news_source') || NEWS_SOURCES.REDDIT

// Set current news source in localStorage
const setCurrentNewsSource = (source) => localStorage.setItem('gameboxd_news_source', source)

// Rotate to next news source
const rotateNewsSource = () => {
  const current = getCurrentNewsSource()
  const currentIndex = NEWS_SOURCE_ORDER.indexOf(current)
  const nextIndex = (currentIndex + 1) % NEWS_SOURCE_ORDER.length
  const nextSource = NEWS_SOURCE_ORDER[nextIndex]
  setCurrentNewsSource(nextSource)
  return nextSource
}

const FALLBACK_ARTICLES = [
  {
    id: 'fallback-switch2-roundup',
    title: 'Nintendo Switch 2 rumor roundup and launch expectations',
    description:
      'A rolling recap of recent Switch 2 reports, timelines, and likely feature targets from gaming outlets.',
    source: 'GameBoxd Digest',
    publishedAt: new Date().toISOString(),
    image: FALLBACK_COVER,
    url: 'https://news.google.com/search?q=Nintendo+Switch+2+gaming+news',
  },
  {
    id: 'fallback-live-service-2026',
    title: 'Live-service games adjust roadmaps for 2026',
    description:
      'Studios are refining season cadence, monetization, and cross-platform support in response to player trends.',
    source: 'GameBoxd Digest',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    image: FALLBACK_COVER,
    url: 'https://news.google.com/search?q=live+service+games+2026+news',
  },
  {
    id: 'fallback-indie-showcase',
    title: 'Indie showcase highlights break-out action RPGs',
    description:
      'A number of indie projects gained momentum after fresh demos and launch window reveals.',
    source: 'GameBoxd Digest',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    image: FALLBACK_COVER,
    url: 'https://news.google.com/search?q=indie+action+rpg+showcase+news',
  },
]

const formatDate = (value) => {
  if (!value) {
    return new Date().toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const normalizeUrl = (value, title) => {
  if (typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)) {
    return value;
  }

  // No fallback to Google search; return empty string if URL is not valid.
  return '';
}

const normalizeImage = (value) =>
  typeof value === 'string' && /^https?:\/\//i.test(value) ? value : FALLBACK_COVER

const normalizeSource = (value) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (value && typeof value === 'object') {
    if (typeof value.name === 'string' && value.name.trim()) {
      return value.name.trim()
    }
    if (typeof value.domain === 'string' && value.domain.trim()) {
      return value.domain.trim()
    }
  }

  return 'Unknown Source'
}

const toTimestamp = (value) => {
  const parsed = Date.parse(value ?? '')
  return Number.isNaN(parsed) ? 0 : parsed
}

const sanitizeDescription = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const cleaned = NOISE_NEWS_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, ''),
    value,
  )

  const withoutRedditMeta = cleaned
    // Remove "submitted by /u/user [link] [comments]" tail blocks.
    .replace(/submitted\s+by\s+\/u\/[^\[]*\[link\]\s*\[comments\]/gi, '')
    // Remove malformed "submitted by [link] [comments]" variants.
    .replace(/submitted\s+by\s*\[link\]\s*\[comments\]/gi, '')
    // Remove leftover link/comments markers if present alone.
    .replace(/\[link\]\s*\[comments\]/gi, '')

  return withoutRedditMeta.replace(/\s+/g, ' ').trim()
}

const normalizePublishedAt = (post) => {
  if (typeof post?.created_utc === 'number') {
    return new Date(post.created_utc * 1000).toISOString()
  }

  if (typeof post?.publishedAt === 'number') {
    // Accept either epoch seconds or epoch milliseconds.
    const millis = post.publishedAt > 1e12 ? post.publishedAt : post.publishedAt * 1000
    return new Date(millis).toISOString()
  }

  if (typeof post?.publishedAt === 'string' && post.publishedAt.trim()) {
    const parsed = new Date(post.publishedAt)
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
  }

  // Ensure the UI can always show a timestamp for each post.
  return new Date().toISOString()
}

const extractPayload = (json) => {
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.articles)) return json.articles
  if (Array.isArray(json?.results)) return json.results
  if (Array.isArray(json?.data)) return json.data
  if (Array.isArray(json?.news)) return json.news
  if (Array.isArray(json?.data?.articles)) return json.data.articles
  if (Array.isArray(json?.response?.articles)) return json.response.articles
  return []
}

const mapArticle = (item, index) => {
  const title = item.title ?? item.headline ?? item.name ?? 'Untitled'
  const publishedAt =
    item.publishedAt ??
    item.published_at ??
    item.published ??
    item.date ??
    item.pubDate ??
    item.updatedAt ??
    item.updated_at ??
    ''

  return {
    id: item.id ?? `${title}-${index}`,
    title,
    description: sanitizeDescription(item.description ?? item.summary ?? item.snippet ?? item.content ?? ''),
    source: normalizeSource(item.source ?? item.sourceName ?? item.source_name ?? item.publisher ?? item.author),
    publishedAt,
    image: item.image ?? item.imageUrl ?? item.urlToImage ?? item.thumbnail ?? item.image_url ?? '',
    url: item.url ?? item.link ?? item.href ?? item.story_url ?? item.source_url ?? '',
  }
}

const mapRedditPost = (post, index) => {
  const title = post.title ?? 'Untitled'
  const publishedAt = normalizePublishedAt(post)
  const redditPostUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : REDDIT_NEWS_PAGE_URL

  // Determine the best URL to use:
  // 1. For link posts: use the overridden URL (actual article)
  // 2. For self posts: try to extract URL from text or fall back to search
  let articleUrl = post.url_overridden_by_dest
  
  if (!articleUrl && typeof post.url === 'string' && post.url.startsWith('http')) {
    // Check if post.url is actually an external link (not Reddit)
    if (!post.url.includes('reddit.com') && !post.url.includes('redd.it')) {
      articleUrl = post.url
    }
  }
  
  if (!articleUrl) {
    // Try to extract a URL from the description or title
    const textToSearch = (post.selftext ?? '') + ' ' + (post.title ?? '')
    const urlMatch = textToSearch.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/)
    if (urlMatch) {
      articleUrl = urlMatch[0]
    }
  }
  
  if (!articleUrl) {
    // Fallback: Reddit post URL (discussion) instead of Google search
    articleUrl = redditPostUrl
  }

  return {
    id: post.id ?? `reddit-${index}`,
    title,
    description:
      sanitizeDescription(post.selftext?.trim?.() ?? post.description ?? '') ||
      post.url_overridden_by_dest ||
      post.url ||
      'No summary available for this article.',
    source: typeof post.source === 'string' && post.source.trim() ? post.source.trim() : `r/${post.subreddit ?? 'gamernews'}`,
    publishedAt,
    image:
      (typeof post.thumbnail === 'string' && /^https?:\/\//i.test(post.thumbnail) ? post.thumbnail : '') ||
      post.image ||
      '',
    url: articleUrl,
  }
}

const fetchRedditGamingNews = async () => {
  // Prefer the backend proxy first (avoids Reddit CORS errors in browsers)
  try {
    const response = await fetch(`${API_BASE}/news/reddit?limit=50&subreddit=gamernews`)

    if (response.ok) {
      const json = await response.json()
      const posts = Array.isArray(json?.posts) ? json.posts : []
        // Client-side safety filter: remove self-promotion megathreads
        const filtered = posts.filter((p) => {
          const t = (p.title || '').toLowerCase()
          const s = (p.description || '').toLowerCase() || (p.selftext || '').toLowerCase()
          if (t.includes('megathread') || s.includes('megathread')) {
            if (t.includes('self') || s.includes('self') || t.includes('promotion') || s.includes('promotion')) return false
          }
          if (/\bself[-\s]?promotion\b/.test(t) || /\bself[-\s]?promotion\b/.test(s)) return false
          return true
        })
        return filtered.map(mapRedditPost)
    }
  } catch (err) {
    // if backend proxy fails, fall back to direct Reddit fetch
  }

  // Last-resort: try direct client-side fetch to Reddit
  const redditUrl = 'https://www.reddit.com/r/gamernews/new.json?limit=50&raw_json=1'
  const resp = await fetch(redditUrl)
  if (!resp.ok) {
    throw new Error(`Reddit news request failed: ${resp.status}`)
  }
  const json = await resp.json()
  const posts = (json?.data?.children ?? []).map((c) => c.data)
  return posts.map(mapRedditPost)
}

const resolveSourceOrder = (preferredSource) => {
  const startSource = NEWS_SOURCE_ORDER.includes(preferredSource) ? preferredSource : getCurrentNewsSource()

  return [startSource, ...NEWS_SOURCE_ORDER.filter((source) => source !== startSource)]
}

const fetchNews = async (preferredSource = getCurrentNewsSource()) => {
  try {
    const now = Date.now()
    if (cache.articles.length && cache.source === preferredSource && now - cache.timestamp < CACHE_TTL_MS) {
      return cache.articles
    }

    for (const source of resolveSourceOrder(preferredSource)) {
      let articles = null

      if (source === NEWS_SOURCES.REDDIT) {
        const redditArticles = await fetchRedditGamingNews()
        articles = redditArticles.length ? redditArticles : null
      } else {
        articles = FALLBACK_ARTICLES
      }

      if (articles) {
        cache = {
          timestamp: now,
          articles,
          source,
        }

        return articles
      }
    }

    cache = {
      timestamp: now,
      articles: FALLBACK_ARTICLES,
      source: NEWS_SOURCES.FALLBACK,
    }

    return FALLBACK_ARTICLES
  } catch {
    return FALLBACK_ARTICLES
  }
}

const getRecentArticles = async (limit, preferredSource) => {
  const articles = await fetchNews(preferredSource)
  return articles
    .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
    .slice(0, limit)
}

export const fetchTrendingGamingNews = async (preferredSource = getCurrentNewsSource()) => {
  const recent = await getRecentArticles(6, preferredSource)

  return recent.map((article) => ({
    id: article.id,
    name: article.title,
    coverUrl: normalizeImage(article.image),
    source: normalizeSource(article.source),
    publishedAt: formatDate(article.publishedAt),
    url: normalizeUrl(article.url, article.title),
  }))
}

export const fetchLatestGamingNews = async (preferredSource = getCurrentNewsSource()) => {
  const recent = await getRecentArticles(3, preferredSource)

  return recent.map((article) => ({
    id: article.id,
    title: article.title,
    url: normalizeUrl(article.url, article.title),
  }))
}

export const fetchGamingNewsPage = async (limit = 12, preferredSource = getCurrentNewsSource()) => {
  const perPage = Math.max(6, Math.min(limit, 50))
  const recent = await getRecentArticles(perPage, preferredSource)

  return recent.map((article) => ({
    id: article.id,
    title: article.title,
    description: sanitizeDescription(article.description) || 'No summary available for this article.',
    source: normalizeSource(article.source),
    publishedAt: formatDate(article.publishedAt),
    coverUrl: normalizeImage(article.image),
    url: normalizeUrl(article.url, article.title),
  }))
}

export { getCurrentNewsSource, setCurrentNewsSource, rotateNewsSource, NEWS_SOURCES, NEWS_SOURCE_ORDER }
