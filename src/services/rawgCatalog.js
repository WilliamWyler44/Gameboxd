const RAWG_API_KEY = '3acbc16a2a3e45ff836afb04989610fb'
const RAWG_GAMES_URL = 'https://api.rawg.io/api/games'
const RAWG_DEVELOPERS_URL = 'https://api.rawg.io/api/developers'
const RAWG_PUBLISHERS_URL = 'https://api.rawg.io/api/publishers'
const RAWG_TAGS_URL = 'https://api.rawg.io/api/tags'
const FALLBACK_COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg'

const toCatalogItem = (game) => ({
  id: game.id,
  slug: game.slug ?? String(game.id),
  name: game.name,
  coverUrl: game.background_image || FALLBACK_COVER,
  rating: typeof game.rating === 'number' ? game.rating.toFixed(1) : 'N/A',
  userRating: typeof game.rating === 'number' ? game.rating.toFixed(1) : 'N/A',
  criticRating:
    typeof game.metacritic === 'number' ? game.metacritic : Math.round((game.rating ?? 0) * 10),
  released: game.released || 'Unknown',
  genres: game.genres?.slice(0, 2).map((genre) => genre.name).join(' · ') || 'Unknown Genre',
  platforms:
    game.platforms?.map((entry) => entry.platform?.name).filter(Boolean).join(' / ') || 'Unknown',
  esrb_rating: game.esrb_rating,
  tags: game.tags ?? [],
})

const fetchEntityIds = async ({ url, searchTerm }) => {
  try {
    const query = new URLSearchParams({
      key: RAWG_API_KEY,
      search: searchTerm,
      page_size: '5',
    })

    const response = await fetch(`${url}?${query.toString()}`)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.results ?? []).map((entry) => entry.id).filter((id) => Number.isFinite(id))
  } catch {
    return []
  }
}

export const fetchRawgCatalogGames = async ({
  page = 1,
  pageSize = 12,
  search = '',
  searchBy = 'auto',
  genre = '',
  platform = '',
  ordering = '-rating',
  tag = '',
  yearFrom,
  yearTo,
  criticMin,
}) => {
  const query = new URLSearchParams({
    key: RAWG_API_KEY,
    page: String(page),
    page_size: String(pageSize),
    ordering,
  })

  const searchTerm = search.trim()
  if (searchTerm) {
    if (searchBy === 'title' || searchBy === 'auto') {
      query.set('search', searchTerm)
      if (searchBy === 'title') {
        query.set('search_exact', 'true')
      }
    } else {
      const [developerIds, publisherIds] = await Promise.all([
        searchBy === 'publisher'
          ? Promise.resolve([])
          : fetchEntityIds({ url: RAWG_DEVELOPERS_URL, searchTerm }),
        searchBy === 'developer'
          ? Promise.resolve([])
          : fetchEntityIds({ url: RAWG_PUBLISHERS_URL, searchTerm }),
      ])

      if (searchBy === 'developer') {
        if (developerIds.length) {
          query.set('developers', developerIds.join(','))
        } else {
          query.set('search', searchTerm)
        }
      } else if (searchBy === 'publisher') {
        if (publisherIds.length) {
          query.set('publishers', publisherIds.join(','))
        } else {
          query.set('search', searchTerm)
        }
      } else if (developerIds.length) {
        query.set('developers', developerIds.join(','))
      } else if (publisherIds.length) {
        query.set('publishers', publisherIds.join(','))
      } else {
        query.set('search', searchTerm)
      }
    }
  }

  if (genre) {
    query.set('genres', genre)
  }

  if (tag) {
    query.set('tags', tag)
  }

  if (platform) {
    query.set('platforms', platform)
  }

  if (typeof yearFrom === 'number' && typeof yearTo === 'number') {
    query.set('dates', `${yearFrom}-01-01,${yearTo}-12-31`)
  }

  if (typeof criticMin === 'number' && criticMin > 0) {
    query.set('metacritic', `${criticMin},100`)
  }

  const response = await fetch(`${RAWG_GAMES_URL}?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`RAWG catalog request failed: ${response.status}`)
  }

  const data = await response.json()

  return {
    total: data.count ?? 0,
    items: (data.results ?? []).map(toCatalogItem),
  }
}

export const fetchRawgSeriesSuggestions = async (searchTerm, limit = 6) => {
  if (!searchTerm || !String(searchTerm).trim()) return []
  try {
    const q = new URLSearchParams({
      key: RAWG_API_KEY,
      search: String(searchTerm).trim(),
      page_size: String(Math.max(1, Math.min(12, limit))),
    })

    const res = await fetch(`${RAWG_TAGS_URL}?${q.toString()}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map((t) => ({ id: t.id, name: t.name, games_count: t.games_count }))
  } catch {
    return []
  }
}

export const fetchRawgSuggestions = async (searchTerm, limit = 6) => {
  if (!searchTerm || !String(searchTerm).trim()) return []
  try {
    const q = new URLSearchParams({
      key: RAWG_API_KEY,
      search: String(searchTerm).trim(),
      page_size: String(Math.max(1, Math.min(12, limit))),
    })

    const [gamesRes, tagsRes] = await Promise.all([
      fetch(`${RAWG_GAMES_URL}?${q.toString()}`),
      fetch(`${RAWG_TAGS_URL}?${q.toString()}`),
    ])
    const gamesData = gamesRes.ok ? await gamesRes.json() : { results: [] }
    const tagsData = tagsRes.ok ? await tagsRes.json() : { results: [] }

    const games = (gamesData.results || []).map((g) => ({ id: g.id, slug: g.slug ?? String(g.id), name: g.name, coverUrl: g.background_image || FALLBACK_COVER, type: 'game' }))
    const series = (tagsData.results || []).map((t) => ({ id: t.id, name: t.name, games_count: t.games_count || 0, type: 'series' }))
    // merge: show games first, then series
    return [...games.slice(0, limit), ...series.slice(0, Math.max(0, limit - games.length))]
  } catch {
    return []
  }
}
