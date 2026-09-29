/**
 * Content Ratings System for GameBoxd
 * Standard ESRB Age & Content Rating resolver with visual themes,
 * age guidelines, descriptions, and dynamic content descriptors.
 */

export const RATING_DEFINITIONS = {
  everyone: {
    key: 'everyone',
    code: 'E',
    label: 'Everyone',
    shortLabel: 'Everyone',
    age: 'All Ages',
    ageNumber: 0,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    description:
      'Content is generally suitable for all ages. May contain minimal cartoon, fantasy or mild violence and/or infrequent use of mild language.',
    defaultDescriptors: ['All Ages', 'Family Friendly', 'General Audience'],
  },
  'everyone-10-plus': {
    key: 'everyone-10-plus',
    code: 'E10+',
    label: 'Everyone 10+',
    shortLabel: 'Everyone 10+',
    age: 'Ages 10+',
    ageNumber: 10,
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: 'rgba(14, 165, 233, 0.35)',
    glowColor: 'rgba(14, 165, 233, 0.25)',
    description:
      'Content is generally suitable for ages 10 and up. May contain more cartoon, fantasy or mild violence, mild language and/or minimal suggestive themes.',
    defaultDescriptors: ['Fantasy Violence', 'Mild Language', 'Comic Mischief'],
  },
  teen: {
    key: 'teen',
    code: 'T',
    label: 'Teen',
    shortLabel: 'Teen',
    age: 'Ages 13+',
    ageNumber: 13,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    description:
      'Content is generally suitable for ages 13 and up. May contain violence, suggestive themes, crude humor, minimal blood, simulated gambling and/or infrequent use of strong language.',
    defaultDescriptors: ['Violence', 'Suggestive Themes', 'Crude Humor', 'Simulated Gambling'],
  },
  mature: {
    key: 'mature',
    code: 'M',
    label: 'Mature 17+',
    shortLabel: 'Mature 17+',
    age: 'Ages 17+',
    ageNumber: 17,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    description:
      'Content is generally suitable for ages 17 and up. May contain intense violence, blood and gore, sexual content, strong language, and/or mature themes.',
    defaultDescriptors: ['Intense Violence', 'Blood & Gore', 'Strong Language', 'Mature Themes'],
  },
  'adults-only': {
    key: 'adults-only',
    code: 'AO',
    label: 'Adults Only 18+',
    shortLabel: 'Adults Only',
    age: 'Ages 18+',
    ageNumber: 18,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.14)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    description:
      'Content suitable only for adults ages 18 and up. May include prolonged scenes of intense violence, graphic sexual content and/or gambling with real currency.',
    defaultDescriptors: ['Graphic Content', 'Explicit Themes', 'Mature Audience'],
  },
  'early-childhood': {
    key: 'early-childhood',
    code: 'EC',
    label: 'Early Childhood',
    shortLabel: 'Early Childhood',
    age: 'Ages 3+',
    ageNumber: 3,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    description:
      'Content is intended for young children. Contains no material that parents would find inappropriate.',
    defaultDescriptors: ['Young Children', 'Educational', 'Child Friendly'],
  },
  'rating-pending': {
    key: 'rating-pending',
    code: 'RP',
    label: 'Rating Pending',
    shortLabel: 'Rating Pending',
    age: 'Rating Pending',
    ageNumber: null,
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    description:
      'This title has not yet received a final ESRB rating or is an unrated independent release. Player discretion is advised.',
    defaultDescriptors: ['Unrated Title', 'Advisory Discretion Advised'],
  },
}

/**
 * Normalizes an ESRB string or RAWG rating object into standard key
 */
export const normalizeRatingSlug = (raw) => {
  if (!raw) return null

  if (typeof raw === 'object') {
    if (raw.slug) {
      const slug = String(raw.slug).toLowerCase().trim()
      if (RATING_DEFINITIONS[slug]) return slug
      if (slug.includes('10')) return 'everyone-10-plus'
      if (slug.includes('mature') || slug.includes('17')) return 'mature'
      if (slug.includes('teen') || slug.includes('13')) return 'teen'
      if (slug.includes('adult') || slug.includes('18')) return 'adults-only'
      if (slug.includes('child')) return 'early-childhood'
      if (slug.includes('every')) return 'everyone'
    }
    if (raw.name) {
      return normalizeRatingSlug(raw.name)
    }
    return null
  }

  const str = String(raw).toLowerCase().trim()
  if (RATING_DEFINITIONS[str]) return str
  if (str === 'm' || str.includes('mature') || str.includes('17+')) return 'mature'
  if (str === 't' || str === 'teen' || str.includes('13+')) return 'teen'
  if (str === 'e10+' || str.includes('10+') || str.includes('everyone 10')) return 'everyone-10-plus'
  if (str === 'e' || str === 'everyone' || str.includes('all ages')) return 'everyone'
  if (str === 'ao' || str.includes('adults only') || str.includes('18+')) return 'adults-only'
  if (str === 'ec' || str.includes('early childhood')) return 'early-childhood'
  if (str === 'rp' || str.includes('pending') || str.includes('unrated')) return 'rating-pending'

  return null
}

/**
 * Extract content descriptors dynamically based on game tags, genres, and text
 */
const toArray = (val) => (Array.isArray(val) ? val : [])

const extractDynamicDescriptors = (game = {}) => {
  const descriptors = new Set()
  const tags = toArray(game.tags).map((t) => (typeof t === 'string' ? t : t?.name || t?.slug || '').toLowerCase())
  // genres can be a string ("Action · RPG") in catalog items, or an array in detail items
  const genresSrc = Array.isArray(game.genres) ? game.genres : toArray(game.genresList)
  const genres = genresSrc.map((g) => (typeof g === 'string' ? g : g?.name || g?.slug || '').toLowerCase())
  const genresStr = typeof game.genres === 'string' ? game.genres.toLowerCase() : genres.join(' ')
  const text = `${game.name || ''} ${game.title || ''} ${game.description || ''} ${game.overview || ''} ${genresStr}`.toLowerCase()

  const matchKeywords = (keywords, descriptorLabel) => {
    if (
      keywords.some(
        (kw) =>
          tags.some((t) => t.includes(kw)) ||
          genres.some((g) => g.includes(kw)) ||
          text.includes(` ${kw} `) ||
          text.includes(` ${kw}.`)
      )
    ) {
      descriptors.add(descriptorLabel)
    }
  }

  matchKeywords(['blood', 'gore', 'bloody'], 'Blood & Gore')
  matchKeywords(['violence', 'combat', 'fighting', 'slasher'], 'Intense Violence')
  matchKeywords(['nudity', 'sexual', 'erotic', 'nsfw', 'romance'], 'Sexual Themes')
  matchKeywords(['horror', 'terror', 'psychological-horror', 'scary'], 'Fear & Dark Themes')
  matchKeywords(['swearing', 'profanity', 'strong-language'], 'Strong Language')
  matchKeywords(['gambling', 'casino', 'betting'], 'Simulated Gambling')
  matchKeywords(['alcohol', 'drugs', 'smoking', 'tobacco'], 'Use of Alcohol & Drugs')
  matchKeywords(['multiplayer', 'co-op', 'pvp', 'online'], 'Online Interactions Not Rated')
  matchKeywords(['comic-mischief', 'cartoon-violence'], 'Cartoon Violence')
  matchKeywords(['fantasy-violence', 'magic', 'spells'], 'Fantasy Violence')

  return Array.from(descriptors).slice(0, 4)
}

/**
 * Resolves or smartly infers content rating details for any game
 */
export const resolveContentRating = (game = {}) => {
  if (!game) return { ...RATING_DEFINITIONS['rating-pending'], descriptors: RATING_DEFINITIONS['rating-pending'].defaultDescriptors }

  // 1. Direct ESRB rating on game
  let ratingKey = normalizeRatingSlug(game.esrb_rating || game.esrbRating || game.content_rating || game.contentRating)

  // 2. Smart inference if unrated
  if (!ratingKey) {
    const tags = toArray(game.tags).map((t) => (typeof t === 'string' ? t : t?.name || t?.slug || '').toLowerCase())
    const genresSrc2 = Array.isArray(game.genres) ? game.genres : toArray(game.genresList)
    const genres = genresSrc2.map((g) => (typeof g === 'string' ? g : g?.name || g?.slug || '').toLowerCase())
    const genresStr2 = typeof game.genres === 'string' ? game.genres.toLowerCase() : genres.join(' ')
    const title = String(game.name || game.title || '').toLowerCase()
    const desc = String(game.description_raw || game.description || game.overview || '').toLowerCase()
    const allText = `${title} ${tags.join(' ')} ${genresStr2} ${desc}`

    // Mature 17+ triggers
    if (
      allText.includes('gore') ||
      allText.includes('nudity') ||
      allText.includes('horror') ||
      allText.includes('sexual content') ||
      allText.includes('nsfw') ||
      allText.includes('witcher') ||
      allText.includes('cyberpunk') ||
      allText.includes('grand theft auto') ||
      allText.includes('gta') ||
      allText.includes('resident evil') ||
      allText.includes('dead space') ||
      allText.includes('mortal kombat') ||
      allText.includes('doom') ||
      allText.includes('red dead') ||
      allText.includes('hitman') ||
      allText.includes('silent hill') ||
      allText.includes('assassin') ||
      allText.includes('fallout') ||
      allText.includes('bloodborne') ||
      allText.includes('elden ring') ||
      allText.includes('dark souls') ||
      allText.includes('god of war')
    ) {
      ratingKey = 'mature'
    } else if (
      allText.includes('shooter') ||
      allText.includes('fighting') ||
      allText.includes('action') ||
      allText.includes('rpg') ||
      allText.includes('multiplayer') ||
      allText.includes('halo') ||
      allText.includes('destiny') ||
      allText.includes('overwatch') ||
      allText.includes('final fantasy') ||
      allText.includes('persona') ||
      allText.includes('skyrim') ||
      allText.includes('elder scrolls') ||
      allText.includes('batman') ||
      allText.includes('spider-man') ||
      allText.includes('apex') ||
      allText.includes('fortnite')
    ) {
      ratingKey = 'teen'
    } else if (
      allText.includes('platformer') ||
      allText.includes('adventure') ||
      allText.includes('racing') ||
      allText.includes('simulation') ||
      allText.includes('sports') ||
      allText.includes('minecraft') ||
      allText.includes('sonic') ||
      allText.includes('crash') ||
      allText.includes('spyro') ||
      allText.includes('lego') ||
      allText.includes('ratchet') ||
      allText.includes('zelda')
    ) {
      ratingKey = 'everyone-10-plus'
    } else if (
      allText.includes('family') ||
      allText.includes('kids') ||
      allText.includes('educational') ||
      allText.includes('puzzle') ||
      allText.includes('casual') ||
      allText.includes('mario') ||
      allText.includes('pokemon') ||
      allText.includes('tetris') ||
      allText.includes('animal crossing') ||
      allText.includes('sims') ||
      allText.includes('party') ||
      allText.includes('kart')
    ) {
      ratingKey = 'everyone'
    } else {
      ratingKey = 'everyone-10-plus' // sensible modern default for gaming catalog
    }
  }

  const baseDef = RATING_DEFINITIONS[ratingKey] || RATING_DEFINITIONS['everyone-10-plus']
  const dynamicDescriptors = extractDynamicDescriptors(game)

  // Merge dynamic descriptors with default
  const descriptors = dynamicDescriptors.length > 0 ? dynamicDescriptors : baseDef.defaultDescriptors

  return {
    ...baseDef,
    descriptors,
  }
}
