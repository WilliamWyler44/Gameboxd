const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0'
const STEAM_STORE_ID = '1'
const priceByRawgId = new Map()

const toNumber = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

const normalizeTitle = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')

const extractSteamAppIdFromUrl = (value) => {
  const match = String(value ?? '').match(/(?:steampowered\.com|steamcommunity\.com)\/app\/(\d+)/i)
  return match?.[1] || ''
}

export const extractSteamAppId = ({ stores = [], website = '' } = {}) => {
  for (const entry of stores) {
    const storeId = entry?.store?.id ?? entry?.store_id
    const urls = [entry?.url_en, entry?.url, entry?.url_ru]
    for (const url of urls) {
      const steamAppId = extractSteamAppIdFromUrl(url)
      if (steamAppId && (storeId === 1 || storeId === '1' || !storeId)) {
        return steamAppId
      }
    }
  }

  return extractSteamAppIdFromUrl(website)
}

const toPriceInfo = ({ rawgId, steamAppId = '', deal = null }) => {
  const salePrice = toNumber(deal?.salePrice ?? deal?.cheapest)
  const normalPrice = toNumber(deal?.normalPrice) ?? salePrice

  return {
    rawgId,
    steamAppId: deal?.steamAppID || steamAppId || '',
    cheapSharkGameId: deal?.gameID || '',
    dealID: deal?.dealID || deal?.cheapestDealID || '',
    salePrice,
    normalPrice,
    isOnSale: Boolean(
      deal &&
        salePrice !== null &&
        normalPrice !== null &&
        (deal.isOnSale === '1' || salePrice < normalPrice),
    ),
    storeID: deal?.storeID || STEAM_STORE_ID,
  }
}

const fetchCheapSharkJson = async (path, params) => {
  const query = new URLSearchParams(params)
  const response = await fetch(`${CHEAPSHARK_BASE_URL}/${path}?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`CheapShark ${path} request failed: ${response.status}`)
  }
  return response.json()
}

const pickBestDeal = (deals, title) => {
  if (!Array.isArray(deals) || !deals.length) {
    return null
  }

  const target = normalizeTitle(title)
  const matching = target
    ? deals.filter((deal) => normalizeTitle(deal.title) === target)
    : deals
  const pool = matching.length ? matching : deals

  return pool.reduce((best, deal) => {
    const price = toNumber(deal.salePrice)
    const bestPrice = toNumber(best?.salePrice)
    if (price === null) {
      return best
    }
    if (bestPrice === null || price < bestPrice) {
      return deal
    }
    return best
  }, null)
}

const fetchSteamDeals = async ({ steamAppId, title }) => {
  if (steamAppId) {
    const deals = await fetchCheapSharkJson('deals', {
      storeID: STEAM_STORE_ID,
      steamAppID: steamAppId,
    })
    const deal = pickBestDeal(deals, title)
    if (deal) {
      return deal
    }
  }

  if (!title?.trim()) {
    return null
  }

  const exactDeals = await fetchCheapSharkJson('deals', {
    storeID: STEAM_STORE_ID,
    title: title.trim(),
    exact: '1',
  })
  const exactDeal = pickBestDeal(exactDeals, title)
  if (exactDeal) {
    return exactDeal
  }

  const fuzzyDeals = await fetchCheapSharkJson('deals', {
    storeID: STEAM_STORE_ID,
    title: title.trim(),
  })
  return pickBestDeal(fuzzyDeals, title)
}

export const fetchCheapSharkPriceByRawgId = async ({ rawgId, title, steamAppId = '' }) => {
  if (!rawgId) {
    return toPriceInfo({ rawgId: '', steamAppId })
  }

  if (priceByRawgId.has(rawgId)) {
    return priceByRawgId.get(rawgId)
  }

  try {
    const deal = await fetchSteamDeals({ steamAppId, title })
    const priceInfo = toPriceInfo({ rawgId, steamAppId, deal })
    priceByRawgId.set(rawgId, priceInfo)
    return priceInfo
  } catch {
    const emptyPrice = toPriceInfo({ rawgId, steamAppId })
    priceByRawgId.set(rawgId, emptyPrice)
    return emptyPrice
  }
}
