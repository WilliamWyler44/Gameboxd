const RAWG_API_KEY = '3acbc16a2a3e45ff836afb04989610fb'
const RAWG_BASE_URL = 'https://api.rawg.io/api'

const fetchJson = async (url, { throwOnError = true } = {}) => {
  const res = await fetch(url)
  if (!res.ok) {
    if (throwOnError) {
      throw new Error(`${res.status} ${res.statusText} - ${url}`)
    }
    return { ok: false, status: res.status, statusText: res.statusText, results: [] }
  }
  const data = await res.json()
  return { ok: true, data }
}

const toSimple = (item) => ({ id: item.id, slug: item.slug, name: item.name })

const run = async (slug = 'rollercoaster-tycoon-3') => {
  try {
    console.log('Fetching game details for slug:', slug)
    const detailUrl = `${RAWG_BASE_URL}/games/${slug}?key=${RAWG_API_KEY}`
    const detailResp = await fetchJson(detailUrl)
    if (!detailResp.ok) throw new Error(`Failed to fetch game details: ${detailResp.status} ${detailResp.statusText}`)
    const game = detailResp.data
    console.log('Game:', game.name, `(id=${game.id})`)

    console.log('\nFetching /games/{id}/suggested')
    const suggestedUrl = `${RAWG_BASE_URL}/games/${game.id}/suggested?key=${RAWG_API_KEY}&page_size=12`
    const suggestedResp = await fetchJson(suggestedUrl, { throwOnError: false })
    if (!suggestedResp.ok) {
      console.log(`Suggested endpoint returned ${suggestedResp.status} ${suggestedResp.statusText}`)
    } else {
      const suggestedData = suggestedResp.data
      console.log('Suggested count:', (suggestedData.results || []).length)
      console.log((suggestedData.results || []).map(toSimple))
    }

    const tags = (game.tags || []).slice(0,3).map(t => t.id)
    console.log('\nTop tag ids from game:', tags)
    if (tags.length) {
      const tagQuery = new URLSearchParams({ key: RAWG_API_KEY, tags: tags.join(','), page_size: '12', exclude_id: String(game.id) })
      const tagUrl = `${RAWG_BASE_URL}/games?${tagQuery.toString()}`
      const tagData = await fetchJson(tagUrl)
      console.log('Tag-query results count:', (tagData.results || []).length)
      console.log((tagData.results || []).map(toSimple))
    } else {
      console.log('No tags to query')
    }

    console.log('\nGenre fallback (first two genres)')
    const genres = (game.genres || []).slice(0,2).map(g=>g.id)
    console.log('Genre ids:', genres)
    if (genres.length) {
      const genreQuery = new URLSearchParams({ key: RAWG_API_KEY, genres: genres.join(','), page_size: '12', ordering: '-rating', exclude_id: String(game.id) })
      const genreUrl = `${RAWG_BASE_URL}/games?${genreQuery.toString()}`
      const genreData = await fetchJson(genreUrl)
      console.log('Genre fallback count:', (genreData.results || []).length)
      console.log((genreData.results || []).map(toSimple))
    }

    console.log('\nDone')
  } catch (err) {
    console.error('Error during check:', err.message)
    process.exitCode = 2
  }
}

const slug = process.argv[2] || 'rollercoaster-tycoon-3'
run(slug)
