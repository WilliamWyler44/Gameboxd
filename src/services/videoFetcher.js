/**
 * YouTube Video Search & Fetcher Service
 * Uses the official YouTube Data API v3 via youtube.googleapis.com.
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_SEARCH_URL = 'https://youtube.googleapis.com/youtube/v3/search'

const fetchYouTubeVideoIds = async (searchQuery, maxResults = 1) => {
  if (!YOUTUBE_API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY is not set. Trailer search is disabled.')
    return []
  }

  try {
    const query = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      maxResults: String(Math.max(1, Math.min(maxResults, 5))),
      q: searchQuery,
    })

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${query.toString()}`)
    if (!response.ok) {
      console.error(`YouTube search failed (${response.status}) for query: ${searchQuery}`)
      return []
    }

    const data = await response.json()
    const items = Array.isArray(data.items) ? data.items : []

    return items
      .map((item) => item?.id?.videoId)
      .filter((id) => typeof id === 'string' && id.length === 11)
  } catch (error) {
    console.error(`Error fetching YouTube IDs for "${searchQuery}":`, error)
    return []
  }
}

const toYouTubeEmbed = (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}`

const firstVideoForQuery = async (query, label, type, title) => {
  const videoIds = await fetchYouTubeVideoIds(query, 1)
  if (!videoIds.length) {
    return null
  }

  return {
    id: `${title}-${type}-${videoIds[0]}`,
    title: label,
    videoId: videoIds[0],
    embedUrl: toYouTubeEmbed(videoIds[0]),
    type,
    isNative: false,
  }
}

/**
 * Returns up to two curated videos:
 * 1) Trailer preference for modern titles (circa 2005+): GameTrailers, else Official Trailer.
 * 2) Gameplay video.
 */
const getPreferredVideosForGame = async (title, releaseYear) => {
  const isModernGame = typeof releaseYear === 'number' && releaseYear >= 2005
  const videos = []

  // Preferred trailer slot.
  const trailerCandidates = isModernGame
    ? [
        { query: `GameTrailers ${title} trailer`, label: 'Official Trailer', type: 'gametrailers' },
        { query: `${title} official trailer`, label: 'Official Trailer', type: 'official' },
      ]
    : [{ query: `${title} official trailer`, label: 'Official Trailer', type: 'official' }]

  for (const candidate of trailerCandidates) {
    try {
      const trailer = await firstVideoForQuery(candidate.query, candidate.label, candidate.type, title)
      if (trailer) {
        videos.push(trailer)
        break
      }
    } catch (error) {
      console.error(`Trailer lookup failed for ${candidate.type}:`, error)
    }
  }

  // Gameplay slot.
  try {
    const gameplay = await firstVideoForQuery(`${title} gameplay`, 'Gameplay Video', 'gameplay', title)
    if (gameplay) {
      const duplicate = videos.some((video) => video.videoId === gameplay.videoId)
      if (!duplicate) {
        videos.push(gameplay)
      }
    }
  } catch (error) {
    console.error('Gameplay lookup failed:', error)
  }

  return videos
}

export { getPreferredVideosForGame, fetchYouTubeVideoIds }

