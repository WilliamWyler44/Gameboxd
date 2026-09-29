import { extractSteamAppId, fetchCheapSharkPriceByRawgId } from './cheapShark'

const RAWG_API_KEY = '3acbc16a2a3e45ff836afb04989610fb'
const RAWG_BASE_URL = 'https://api.rawg.io/api'
const FALLBACK_COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg'

const stripHtml = (value) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toScoreRows = (ratings = []) =>
  ratings.map((item) => ({
    id: item.id ?? item.title,
    label: item.title ?? 'score',
    count: item.count ?? 0,
    percent: typeof item.percent === 'number' ? item.percent : 0,
  }))

const toScreenshotRows = (results = []) =>
  results.map((item) => ({
    id: item.id,
    image: item.image ?? '',
  }))

const toReviewEntries = (results = []) =>
  results.map((item) => ({
    id: item.id,
    rating: typeof item.rating === 'number' ? item.rating : null,
    body:
      stripHtml(item.text_preview || item.text).slice(0, 500) ||
      'No review text provided for this entry.',
    likes: item.likes_count ?? 0,
    comments: item.comments_count ?? 0,
    author: item.external_author || item.external_source || 'RAWG user',
    createdAt: item.created || '',
  }))

const toRecommendedGames = (results = []) =>
  results
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.name,
      coverUrl: item.background_image || FALLBACK_COVER,
      rating: typeof item.rating === 'number' ? item.rating.toFixed(1) : 'N/A',
      releaseYear: item.released ? new Date(item.released).getFullYear() : 'TBA',
    }))

const fetchSuggestedGames = async (game) => {
  try {
    const suggestedQuery = new URLSearchParams({
      key: RAWG_API_KEY,
      page_size: '10',
    })

    const response = await fetch(`${RAWG_BASE_URL}/games/${game.id}/suggested?${suggestedQuery.toString()}`)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return toRecommendedGames(data.results || [])
  } catch {
    return []
  }
}

const STORE_PLATFORM_COMPAT = {
  steam: ['pc'],
  gog: ['pc'],
  'epic games': ['pc'],
  itch: ['pc'],
  'playstation store': ['playstation', 'ps'],
  xbox: ['xbox'],
  nintendo: ['nintendo', 'switch', 'wii', 'ds', '3ds', 'game boy'],
  'apple app store': ['ios', 'iphone', 'ipad'],
  'google play': ['android'],
}

const RAWG_STORE_ID_NAME = {
  1: 'Steam',
  2: 'Xbox Store',
  3: 'PlayStation Store',
  4: 'App Store',
  5: 'GOG',
  6: 'Nintendo Store',
  7: 'Xbox 360 Store',
  8: 'Google Play',
  9: 'itch.io',
  11: 'Epic Games',
}

const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value)

const isStoreHomepage = (value, domain) => {
  if (!isHttpUrl(value) || typeof domain !== 'string' || !domain.trim()) {
    return false
  }

  try {
    const parsed = new URL(value)
    const host = parsed.hostname.replace(/^www\./i, '')
    const cleanDomain = domain.trim().replace(/^www\./i, '')
    const cleanPath = parsed.pathname.replace(/\/+$/, '')
    return host === cleanDomain && (!cleanPath || cleanPath === '')
  } catch {
    return false
  }
}

const toStoreUrl = (entry) => {
  const candidates = [entry?.url_en, entry?.url, entry?.url_ru]
  const domain = entry?.store?.domain

  for (const candidate of candidates) {
    if (!isHttpUrl(candidate)) {
      continue
    }

    if (isStoreHomepage(candidate, domain)) {
      continue
    }

    return candidate
  }

  return ''
}

const toStoreRows = ({ gameStores = [], gameStoreDetails = [] }) => {
  const storeNameById = new Map()

  for (const entry of gameStores) {
    const id = entry?.store?.id
    const name = entry?.store?.name
    if (typeof id === 'number' && typeof name === 'string' && name.trim()) {
      storeNameById.set(id, name.trim())
    }
  }

  const fromGame = gameStores.map((entry) => ({
    id: entry?.id,
    store: entry?.store,
    url_en: entry?.url_en,
    url: entry?.url,
    url_ru: entry?.url_ru,
  }))

  const fromDetails = gameStoreDetails.map((entry) => ({
    id: entry?.id,
    store: entry?.store || {
      id: entry?.store_id,
      name:
        entry?.store_name ||
        storeNameById.get(entry?.store_id) ||
        RAWG_STORE_ID_NAME[entry?.store_id] ||
        `Store ${entry?.store_id ?? ''}`,
      domain: entry?.store_domain,
    },
    url_en: entry?.url_en,
    url: entry?.url,
    url_ru: entry?.url_ru,
  }))

  return [...fromGame, ...fromDetails]
}

const toOnlineStores = ({ stores = [], platformNames = [] }) => {
  const normalizedPlatforms = platformNames.map((name) => name.toLowerCase())

  const mapped = stores
    .map((entry, index) => {
      const storeName = entry?.store?.name || `Store ${index + 1}`
      const normalizedName = storeName.toLowerCase()
      const href = toStoreUrl(entry)
      const compatKeywords = Object.entries(STORE_PLATFORM_COMPAT).find(([keyword]) => normalizedName.includes(keyword))?.[1]

      const isPlatformCompatible =
        !compatKeywords ||
        compatKeywords.some((keyword) => normalizedPlatforms.some((platform) => platform.includes(keyword)))

      if (!href || !isPlatformCompatible) {
        return null
      }

      return {
        id: entry?.id ?? `${storeName}-${index}`,
        name: storeName,
        href,
      }
    })
    .filter(Boolean)

  const uniqueByHref = []
  const seen = new Set()

  for (const store of mapped) {
    if (!seen.has(store.href)) {
      seen.add(store.href)
      uniqueByHref.push(store)
    }
  }

  return uniqueByHref
}

const fetchRecommendedGames = async (game) => {
  try {
    const suggestedGames = await fetchSuggestedGames(game)
    if (suggestedGames.length) {
      return suggestedGames
    }
    // Try tags (series/franchise/subjects) next to get more game-specific matches
    const tags = game.tags?.map((t) => t.id).slice(0, 3) ?? []
    if (tags.length) {
      try {
        const tagFilter = tags.join(',')
        const tagQuery = new URLSearchParams({
          key: RAWG_API_KEY,
          tags: tagFilter,
          page_size: '12',
          exclude_id: game.id,
        })
        const tagResp = await fetch(`${RAWG_BASE_URL}/games?${tagQuery.toString()}`)
        if (tagResp.ok) {
          const tagData = await tagResp.json()
          const items = toRecommendedGames(tagData.results || [])
          if (items.length) return items
        }
      } catch {
        // ignore and continue to genre fallback
      }
    }

    // Build genre filter from the game's genres as a fallback
    const genres = game.genres?.map((g) => g.id).slice(0, 2) ?? []
    if (!genres.length) {
      return []
    }

    const genreFilter = genres.join(',')
    const recommendedQuery = new URLSearchParams({
      key: RAWG_API_KEY,
      genres: genreFilter,
      page_size: '10',
      ordering: '-rating',
      exclude_id: game.id,
    })

    const response = await fetch(`${RAWG_BASE_URL}/games?${recommendedQuery.toString()}`)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return toRecommendedGames(data.results || [])
  } catch {
    return []
  }
}

export const fetchRawgGameDetails = async (slug) => {
  const detailsQuery = new URLSearchParams({ key: RAWG_API_KEY })
  const detailResponse = await fetch(`${RAWG_BASE_URL}/games/${slug}?${detailsQuery.toString()}`)

  if (!detailResponse.ok) {
    throw new Error(`RAWG game detail request failed: ${detailResponse.status}`)
  }

  const game = await detailResponse.json()

  const screenshotsQuery = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: '8',
  })
  const reviewsQuery = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: '6',
  })
  const storesQuery = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: '20',
  })

  const [screenshotsResponse, reviewsResponse, storesResponse] = await Promise.all([
    fetch(`${RAWG_BASE_URL}/games/${game.id}/screenshots?${screenshotsQuery.toString()}`),
    fetch(`${RAWG_BASE_URL}/games/${game.id}/reviews?${reviewsQuery.toString()}`),
    fetch(`${RAWG_BASE_URL}/games/${game.id}/stores?${storesQuery.toString()}`),
  ])

  const screenshotsData = screenshotsResponse.ok ? await screenshotsResponse.json() : { results: [] }
  const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : { results: [] }
  const storesData = storesResponse.ok ? await storesResponse.json() : { results: [] }
  const recommendedGames = await fetchRecommendedGames(game)

  const title = game.name ?? 'Unknown Game'
  const platformNames = game.platforms?.map((entry) => entry.platform?.name).filter(Boolean) ?? []
  const storeRows = toStoreRows({
    gameStores: game.stores ?? [],
    gameStoreDetails: storesData.results ?? [],
  })
  const onlineStores = toOnlineStores({ stores: storeRows, platformNames })
  const steamAppId = extractSteamAppId({ stores: storeRows, website: game.website || '' })
  const storePrice = await fetchCheapSharkPriceByRawgId({
    rawgId: game.id,
    title,
    steamAppId,
  })

  // Determine if game is from 2005 or later to prioritize professional trailers
  const releaseYear = game.released ? new Date(game.released).getFullYear() : null
  let youtubeEmbeds = []

  try {
    const { getPreferredVideosForGame } = await import('./videoFetcher.js')
    youtubeEmbeds = await getPreferredVideosForGame(title, releaseYear)
  } catch (error) {
    console.error('Error fetching trailer/gameplay videos:', error)
  }

  return {
    id: game.id,
    slug: game.slug,
    title,
    coverUrl: game.background_image || game.background_image_additional || FALLBACK_COVER,
    overview:
      stripHtml(game.description_raw || game.description) ||
      `${title} has no overview text available from RAWG right now.`,
    released: game.released || 'Unknown',
    releaseYear,
    metacritic: typeof game.metacritic === 'number' ? game.metacritic : null,
    rating: typeof game.rating === 'number' ? game.rating.toFixed(1) : 'N/A',
    ratingsCount: game.ratings_count ?? 0,
    genres: game.genres?.map((entry) => entry.name).join(' · ') || 'General',
    platforms: platformNames.join(' / ') || 'Unknown',
    website: game.website || game.reddit_url || '',
    storeUrl: onlineStores[0]?.href || '',
    onlineStoreCount: onlineStores.length,
    onlineStores,
    steamAppId,
    storePrice,
    esrb_rating: game.esrb_rating,
    tags: game.tags ?? [],
    genresList: game.genres ?? [],
    reviewScores: toScoreRows(game.ratings ?? []),
    reviews: toReviewEntries(reviewsData.results ?? []),
    screenshots: toScreenshotRows(screenshotsData.results ?? []),
    youtubeEmbeds,
    recommendedGames,
  }
}
