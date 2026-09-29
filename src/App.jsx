import { createElement, useEffect, useMemo, useState, useRef } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  CreditCard,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Key,
  Lock,
  Minus,
  Monitor,
  Newspaper,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Trophy,
  Tv,
  User,
  Users,
  X,
} from 'lucide-react'
import AuthPage from './components/AuthPage'
import Collection from './components/Collection'
import GameLibrary from './components/GameLibrary'
import {
  addGame as apiAddGame,
  listGames,
  getActivity,
  getUserProfile,
  getGameReviews,
  searchUsers,
  getFollowNotifications,
  getFollowNotificationsUnreadCount,
  markFollowNotificationsReadAll,
  getFollowingFeed,
  createTransaction,
} from './services/backendApi'
import Profile from './components/Profile'
import AddModal from './components/AddModal'
import Admin from './components/Admin'
import {
  fetchGamingNewsPage,
  fetchLatestGamingNews,
  fetchTrendingGamingNews,
  getCurrentNewsSource,
  NEWS_SOURCES,
  NEWS_SOURCE_ORDER,
} from './services/gamingNews'
import { getAdminRoms } from './services/backendApi'
import { fetchRawgCatalogGames, fetchRawgSuggestions } from './services/rawgCatalog'
import { fetchRawgGameDetails } from './services/rawgGameDetails'
import './App.css'
import StarRating from './components/StarRating'
import ContentRatingBadge from './components/ContentRatingBadge'
import { resolveContentRating } from './services/contentRatings'

const styles = {
  animationStyles: { shimmer: 'catalog-loading-line' },
  authStack: 'auth-stack',
  authStackBtn: '',
  authStackBtnHover: '',
  avatar: 'avatar',
  backgroundGlow: 'background-glow',
  block: 'block',
  brand: 'brand',
  card: 'card',
  cardMain: 'card-main',
  catalogControls: 'catalog-controls',
  catalogFilterBlock: 'catalog-filter-block',
  catalogFilterBlockH3: '',
  catalogFilterPanel: 'catalog-filter-panel',
  catalogGrid: 'catalog-grid',
  catalogItem: 'catalog-item',
  catalogLoadingCard: 'catalog-loading-card',
  catalogLoadingGrid: 'catalog-loading-grid',
  catalogLoadingImage: 'catalog-loading-image',
  catalogLoadingLineShort: 'short',
  catalogLoadingLineTiny: 'tiny',
  catalogLoadingShell: 'catalog-loading-shell',
  catalogMainPanel: 'catalog-main-panel',
  catalogMeta: 'catalog-meta',
  catalogPagination: 'catalog-pagination',
  catalogPhotoContent: 'catalog-photo-content',
  catalogPhotoGrid: 'catalog-photo-grid',
  catalogPhotoItem: 'catalog-photo-item',
  catalogPhotoItemClickable: 'clickable',
  catalogPhotoItemSelected: 'selected-game',
  catalogPhotoLayout: 'catalog-photo-layout',
  catalogDetailsButton: 'catalog-details-button',
  catalogRatingBadge: 'catalog-rating-badge',
  catalogSearch: 'catalog-search',
  catalogSelect: 'catalog-select',
  chip: 'chip',
  chipHover: '',
  chipRow: 'chip-row',
  collectionGrid: 'collection-grid',
  dashboard: 'dashboard',
  discoveryGrid: 'discovery-grid',
  emuGame: 'emu-game',
  emuGameHover: '',
  emuGrid: 'emu-grid',
  emulationActions: 'emulation-actions',
  emulationContent: 'emulation-content',
  emulationCover: 'emulation-cover',
  emulationEmbedWrap: 'emulation-embed-wrap',
  emulationGrid: 'emulation-grid',
  emulationHeader: 'emulation-header',
  emulationIframe: 'emulation-iframe',
  emulationItem: 'emulation-item',
  emulationPage: 'emulation-page',
  emulationControlsCard: 'emulation-controls-card',
  emulationControlsGrid: 'emulation-controls-grid',
  emulationControlsList: 'emulation-controls-list',
  emulationControlsTitle: 'emulation-controls-title',
  emulationPlatformGroup: 'emulation-platform-group',
  emulationPlatformTitle: 'emulation-platform-title',
  emulationPlayBtn: 'emulation-play-btn',
  emulationPlayerCard: 'emulation-player-card',
  errorText: 'error-text',
  featureGrid: 'feature-grid',
  featureOption: 'feature-option',
  filterGroup: 'filter-group',
  filterGroupH3: '',
  filterGroupInput: '',
  gameDetailsHeader: 'game-details-header',
  gameDetailsPage: 'game-details-page',
  gameMiniList: 'game-mini-list',
  gameMiniListSpan: '',
  gameOverviewCard: 'game-overview-card',
  gameOverviewContent: 'game-overview-content',
  gameOverviewCover: 'game-overview-cover',
  gameReviewsCard: 'game-reviews-card',
  detailAddButton: 'detail-add-button',
  gameScreenshot: 'game-screenshot',
  gameScreenshotsCard: 'game-screenshots-card',
  gameScreenshotsGrid: 'game-screenshots-grid',
  gameTrailersGrid: 'game-trailers-grid',
  glowLeft: 'glow-left',
  glowRight: 'glow-right',
  hiddenPanel: 'hidden-panel',
  igdbGrid: 'igdb-grid',
  igdbItem: 'igdb-item',
  igdbRating: 'igdb-rating',
  imageLightbox: 'image-lightbox',
  imageLightboxClose: 'image-lightbox-close',
  imageLightboxCounter: 'image-lightbox-counter',
  imageLightboxMedia: 'image-lightbox-media',
  imageLightboxNav: 'image-lightbox-nav',
  imageLightboxNavLeft: 'image-lightbox-nav-left',
  imageLightboxNavRight: 'image-lightbox-nav-right',
  marginBottom10: 'mb-10',
  muted: 'muted',
  newsCard: 'news-card',
  newsCardContent: 'news-card-content',
  newsCardImage: 'news-card-image',
  newsCardImageWrap: 'news-card-image-wrap',
  newsFeaturedItem: 'news-featured-item',
  newsFeaturedList: 'news-featured-list',
  newsGrid: 'news-grid',
  newsLink: 'news-link',
  newsPage: 'news-page',
  newsPageHeader: 'news-page-header',
  newsSourceSelector: 'news-source-selector',
  newsSummary: 'news-summary',
  onlineStoreLinks: 'online-store-links',
  storePurchase: 'store-purchase',
  storePrice: 'store-price',
  storePriceOriginal: 'store-price-original',
  storePriceNote: 'store-price-note',
  storeActions: 'store-actions',
  storeCartButton: 'store-cart-button',
  storeBuyButton: 'store-buy-button',
  pageShell: 'page-shell',
  pageShellCatalogMode: 'catalog-mode',
  panel: 'panel',
  quickFiltersH2: '',
  quickFiltersPanel: 'quick-filters',
  sidebarNavButton: 'sidebar-nav-button',
  sidebarNavButtonActive: 'sidebar-nav-button-active',
  sidebarNavDescription: 'sidebar-nav-description',
  sidebarNavIcon: 'sidebar-nav-icon',
  sidebarNavList: 'sidebar-nav-list',
  sidebarNavPanel: 'sidebar-nav-panel',
  sidebarNavText: 'sidebar-nav-text',
  sidebarNavLabel: 'sidebar-nav-label',
  recommendedGameCover: 'recommended-game-cover',
  recommendedGameCoverImg: '',
  recommendedGameInfo: 'recommended-game-info',
  recommendedGameMeta: 'recommended-game-meta',
  recommendedGamesCard: 'recommended-games-card',
  recommendedGamesGrid: 'recommended-games-grid',
  recommendedGameTile: 'recommended-game-tile',
  recommendedGameTileHover: '',
  recommendedGameTileHoverImg: '',
  recommendedGameTitle: 'recommended-game-title',
  resetFilterBtn: 'reset-filter-btn',
  reviewEntriesGrid: 'review-entries-grid',
  reviewEntryItem: 'review-entry-item',
  reviewLinkBtn: 'review-link-btn',
  reviewScoreGrid: 'review-score-grid',
  reviewScoreItem: 'review-score-item',
  rightRail: 'right-rail',
  screenshotButton: 'screenshot-button',
  screenshotButtonHover: '',
  searchbox: 'searchbox',
  searchboxInput: '',
  sideCard: 'side-card',
  sideCardLi: '',
  sideCardUl: '',
  sideNewsLink: 'side-news-link',
  sideNewsLinkHover: '',
  sourceInfo: 'source-info',
  sourceSelect: 'source-select',
  stack10: 'stack-10',
  tabChip: 'tab-chip',
  tabChipActive: 'active',
  tabChipHover: '',
  tabRow: 'tab-row',
  titleLg: 'title-lg',
  topbar: 'topbar',
  trailerItem: 'trailer-item',
  trailerVideo: 'trailer-video',
  userMeta: 'user-meta',
  walkthroughLinks: 'walkthrough-links',
}

const mergeStyles = (...classNames) =>
  classNames.filter((value) => typeof value === 'string' && value).join(' ')

const getShortDescription = (value, maxLength = 120) => {
  if (typeof value !== 'string') {
    return 'No summary available.'
  }

  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

function App() {
  const [activeTab, setActiveTab] = useState('Home')
  const [showAdmin, setShowAdmin] = useState(false)
  const [brandClickCount, setBrandClickCount] = useState(0)
  const brandClickTimeoutRef = useRef(null)
  const [topGames, setTopGames] = useState([])
  const [isLoadingGames, setIsLoadingGames] = useState(true)
  const [gamesError, setGamesError] = useState('')
  const [newsFeed, setNewsFeed] = useState([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [newsError, setNewsError] = useState('')
  const [newsPageItems, setNewsPageItems] = useState([])
  const [newsPage, setNewsPage] = useState(1)
  const [isLoadingNewsPage, setIsLoadingNewsPage] = useState(false)
  const [newsPageError, setNewsPageError] = useState('')
  const [currentNewsSource] = useState(getCurrentNewsSource())
  const [selectedCatalogGameSlug, setSelectedCatalogGameSlug] = useState('')
  const [catalogGameDetails, setCatalogGameDetails] = useState(null)
  const [isLoadingCatalogDetails, setIsLoadingCatalogDetails] = useState(false)
  const [catalogDetailsError, setCatalogDetailsError] = useState('')
  const [gameReviews, setGameReviews] = useState([])
  const [isLoadingGameReviews, setIsLoadingGameReviews] = useState(false)
  const [catalogGames, setCatalogGames] = useState([])
  const [catalogPage, setCatalogPage] = useState(1)
  const [catalogTotal, setCatalogTotal] = useState(0)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogSearchType, setCatalogSearchType] = useState('title')
  const [catalogGenre, setCatalogGenre] = useState('')
  const [catalogTag, setCatalogTag] = useState('')
  const [catalogPlatform, setCatalogPlatform] = useState('')
  const [catalogSort, setCatalogSort] = useState('-metacritic')
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear())
  const [criticMin, setCriticMin] = useState(0)
  const [userMin, setUserMin] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [globalSearchInput, setGlobalSearchInput] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionTimer = useRef(null)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)
  const [expandedImageIndex, setExpandedImageIndex] = useState(null)
  const [hoveredRecommendedTile, setHoveredRecommendedTile] = useState(null)
  const [hoveredEmuGame, setHoveredEmuGame] = useState(null)
  const [hoveredAuthBtn, setHoveredAuthBtn] = useState(null)
  const [hoveredScreenshot, setHoveredScreenshot] = useState(null)
  const [selectedEmulationGame, setSelectedEmulationGame] = useState(null)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('gb_user') || 'null')
      return user ? { username: user.username, token: user.token, profile_pic: user.profile_pic || null, genres: user.genres || [] } : null
    } catch (e) {
      return null
    }
  })
  const [selectedProfileUser, setSelectedProfileUser] = useState(null)
  const [detailRating, setDetailRating] = useState(0)
  const [detailReviewText, setDetailReviewText] = useState('')
  const [detailStatus, setDetailStatus] = useState('library')
  const [pendingAddGameSlug, setPendingAddGameSlug] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalIdentifier, setAddModalIdentifier] = useState(null)
  const detailReviewRef = useRef(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userGames, setUserGames] = useState([])
  const [isLoadingUserGames, setIsLoadingUserGames] = useState(false)
  const [userGamesError, setUserGamesError] = useState('')
  const [activities, setActivities] = useState([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [activitiesError, setActivitiesError] = useState('')
  const [followNotifications, setFollowNotifications] = useState([])
  const [followNotifUnreadCount, setFollowNotifUnreadCount] = useState(0)
  const [showFollowNotifications, setShowFollowNotifications] = useState(false)
  const [followingFeed, setFollowingFeed] = useState([])
  const [isLoadingFollowingFeed, setIsLoadingFollowingFeed] = useState(false)
  const [followingFeedError, setFollowingFeedError] = useState('')
  const [popupToast, setPopupToast] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('review')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [purchasedKeys, setPurchasedKeys] = useState([])
  const [savedForLater, setSavedForLater] = useState([])
  const [matureAgeGate, setMatureAgeGate] = useState({ open: false, game: null })
  const [matureBirthDate, setMatureBirthDate] = useState('')
  const [matureAgeError, setMatureAgeError] = useState('')

  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('gb_wallet_balance')
      if (saved !== null && !isNaN(parseFloat(saved))) {
        return parseFloat(saved)
      }
    } catch (e) {}
    return 150.00
  })

  const [cardAuth, setCardAuth] = useState({
    authenticated: false,
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholder: '',
    brand: 'Visa',
    is3dsOpen: false,
    otpCode: '748291',
    otpInput: '',
    error: '',
  })

  const [paypalAuth, setPaypalAuth] = useState({
    authenticated: false,
    email: '',
    isModalOpen: false,
    authorizing: false,
    paypalEmailInput: '',
    paypalPasswordInput: '',
    error: '',
  })

  const [walletAuth, setWalletAuth] = useState({
    authenticated: false,
    pin: '',
    error: '',
  })

  const getItemNumericPrice = (item) => {
    if (typeof item.price === 'number' && !isNaN(item.price)) return item.price
    if (typeof item.rawPrice === 'number' && !isNaN(item.rawPrice)) return item.rawPrice
    if (!item.priceLabel) return 19.99
    if (String(item.priceLabel).toLowerCase() === 'free') return 0
    const parsed = parseFloat(String(item.priceLabel).replace(/[^0-9.]/g, ''))
    return isNaN(parsed) ? 19.99 : parsed
  }

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = getItemNumericPrice(item)
      const qty = item.quantity || 1
      return acc + p * qty
    }, 0)
  }, [cartItems])

  const promoDiscountAmount = useMemo(() => {
    if (!appliedPromo || cartSubtotal <= 0) return 0
    if (appliedPromo.discountPercent) {
      return (cartSubtotal * appliedPromo.discountPercent) / 100
    }
    if (appliedPromo.discountAmount) {
      return Math.min(cartSubtotal, appliedPromo.discountAmount)
    }
    return 0
  }, [appliedPromo, cartSubtotal])

  const estimatedTax = useMemo(() => {
    const subAfterDisc = Math.max(0, cartSubtotal - promoDiscountAmount)
    return subAfterDisc > 0 ? subAfterDisc * 0.05 : 0
  }, [cartSubtotal, promoDiscountAmount])

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - promoDiscountAmount + estimatedTax)
  }, [cartSubtotal, promoDiscountAmount, estimatedTax])

  const handleApplyPromoCode = () => {
    const code = promoCodeInput.trim().toUpperCase()
    if (!code) return
    if (code === 'GAMER20') {
      setAppliedPromo({ code: 'GAMER20', discountPercent: 20, description: '20% OFF Entire Order' })
      showPopupToast('Promo GAMER20 applied! 20% discount added.', 'success')
      setPromoCodeInput('')
    } else if (code === 'GAMEBOXD10') {
      setAppliedPromo({ code: 'GAMEBOXD10', discountAmount: 10, description: '$10.00 OFF Order' })
      showPopupToast('Promo GAMEBOXD10 applied! $10 discount added.', 'success')
      setPromoCodeInput('')
    } else if (code === 'SUMMER15' || code === 'SUMMER') {
      setAppliedPromo({ code: 'SUMMER15', discountPercent: 15, description: '15% Summer Discount' })
      showPopupToast('Promo SUMMER15 applied!', 'success')
      setPromoCodeInput('')
    } else {
      showPopupToast('Invalid promo code. Try GAMER20 or GAMEBOXD10', 'error')
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromo(null)
    showPopupToast('Promo code removed', 'info')
  }

  const handleUpdateItemQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const handleMoveToSavedForLater = (item) => {
    setCartItems((prev) => prev.filter((c) => c.id !== item.id))
    setSavedForLater((prev) => [...prev.filter((s) => s.id !== item.id), item])
    showPopupToast(`Saved ${item.title} for later`, 'success')
  }

  const handleMoveToCartFromSaved = (item) => {
    setSavedForLater((prev) => prev.filter((s) => s.id !== item.id))
    setCartItems((prev) => [...prev, { ...item, quantity: 1 }])
    showPopupToast(`Moved ${item.title} back to cart`, 'success')
  }

  const handleQuickAddGameToCart = (game) => {
    if (cartItems.some((c) => c.id === game.id)) {
      showPopupToast(`${game.title} is already in your cart`, 'info')
      return
    }
    const priceVal = game.storePrice?.salePrice
    const priceLabel =
      priceVal === null || priceVal === undefined
        ? null
        : priceVal === 0
        ? 'Free'
        : `$${Number(priceVal).toFixed(2)}`
    const numericPrice = typeof priceVal === 'number' ? priceVal : 19.99
    setCartItems((prev) => [
      ...prev,
      {
        id: game.id,
        title: game.title,
        coverUrl: game.coverUrl,
        priceLabel,
        price: numericPrice,
        quantity: 1,
        platform: game.platforms?.split(',')[0]?.trim() || 'Steam Key',
        edition: 'Standard Edition',
      },
    ])
    showPopupToast(`Added ${game.title} to cart`, 'success')
  }

  const generateSimulatedKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `GBXD-${block()}-${block()}-${block()}`
  }

  const DEFAULT_PURCHASED_GAMES = [
    {
      id: 'p-1',
      title: 'Euro Truck Simulator 2',
      coverUrl: '/covers/donkey-kong-country-2-snes.jpg',
      price: 19.99,
      platform: 'Steam Key',
      key: 'GBXD-9K3A-782F-L410',
      orderId: 'GBX-894721',
      purchaseDate: 'Aug 28, 2026',
    },
    {
      id: 'p-2',
      title: 'Sonic the Hedgehog',
      coverUrl: '/covers/sonic-1-genesis.png',
      price: 14.99,
      platform: 'GOG DRM-Free',
      key: 'GBXD-7812-984F-M001',
      orderId: 'GBX-774012',
      purchaseDate: 'Aug 20, 2026',
    },
  ]

  const [purchasedGames, setPurchasedGames] = useState(() => {
    try {
      const saved = localStorage.getItem('gb_purchased_games')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return DEFAULT_PURCHASED_GAMES
  })

  useEffect(() => {
    try {
      localStorage.setItem('gb_purchased_games', JSON.stringify(purchasedGames))
    } catch (e) {}
  }, [purchasedGames])

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return
    setCheckoutStep('review')
    setCheckoutModalOpen(true)
  }

  const showPopupToast = (message, type = 'success') => {
    setPopupToast({ message, type })
    window.clearTimeout(showPopupToast._timer)
    showPopupToast._timer = window.setTimeout(() => setPopupToast(null), 2600)
  }

  const isMatureRating = (game = null) => {
    if (!game) return false
    const rating = resolveContentRating(game)
    return typeof rating?.ageNumber === 'number' && rating.ageNumber >= 17
  }

  const hasMatureAgeAccess = () => {
    try {
      const stored = localStorage.getItem('gb_mature_age_verification')
      if (!stored) return false

      const birthDate = new Date(stored)
      if (Number.isNaN(birthDate.getTime())) return false

      const now = new Date()
      let age = now.getFullYear() - birthDate.getFullYear()
      const monthDiff = now.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age -= 1
      }
      return age >= 18
    } catch (e) {
      return false
    }
  }

  const attemptOpenCatalogDetails = (gameLike) => {
    const targetGame = gameLike || {}
    const targetSlug = targetGame.slug ?? String(targetGame.id ?? targetGame.name ?? targetGame.title ?? '')

    if (!targetSlug) {
      openCatalogDetails('')
      return
    }

    if (isMatureRating(targetGame) && !hasMatureAgeAccess()) {
      setMatureBirthDate('')
      setMatureAgeError('')
      setMatureAgeGate({ open: true, game: targetGame })
      return
    }

    openCatalogDetails(targetSlug)
  }

  const submitMatureVerification = () => {
    if (!matureBirthDate) {
      setMatureAgeError('Enter your date of birth to continue.')
      return
    }

    const dob = new Date(matureBirthDate)
    if (Number.isNaN(dob.getTime())) {
      setMatureAgeError('Please enter a valid date of birth.')
      return
    }

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDelta = today.getMonth() - dob.getMonth()
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
      age -= 1
    }

    if (age < 18) {
      setMatureAgeError('You must be at least 18 years old to access mature content.')
      return
    }

    try {
      localStorage.setItem('gb_mature_age_verification', matureBirthDate)
    } catch (e) {}

    setMatureAgeError('')
    setMatureAgeGate({ open: false, game: null })
    const game = matureAgeGate.game || {}
    const slug = game.slug ?? String(game.id ?? game.name ?? game.title ?? '')
    if (slug) {
      openCatalogDetails(slug)
    }
  }

  const handleCardNumberInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 16)
    let formatted = ''
    for (let i = 0; i < raw.length; i += 4) {
      formatted += (i > 0 ? ' ' : '') + raw.slice(i, i + 4)
    }
    let brand = 'Visa'
    if (raw.startsWith('5')) brand = 'MasterCard'
    else if (raw.startsWith('3')) brand = 'Amex'
    else if (raw.startsWith('6')) brand = 'Discover'
    setCardAuth((prev) => ({ ...prev, cardNumber: formatted, brand, error: '' }))
  }

  const handleExpiryInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    let formatted = raw
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`
    }
    setCardAuth((prev) => ({ ...prev, expiry: formatted, error: '' }))
  }

  const handleCvvInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    setCardAuth((prev) => ({ ...prev, cvv: raw, error: '' }))
  }

  const handleFillTestCard = () => {
    setCardAuth((prev) => ({
      ...prev,
      cardholder: authUser?.username ? authUser.username.toUpperCase() : 'ALEX MERCER',
      cardNumber: '4242 8812 3491 5520',
      expiry: '08/29',
      cvv: '884',
      brand: 'Visa',
      error: '',
    }))
  }

  const handleStartCard3ds = (e) => {
    if (e) e.preventDefault()
    const cleanNum = (cardAuth.cardNumber || '').replace(/\D/g, '')
    if (!cardAuth.cardholder.trim()) {
      setCardAuth((prev) => ({ ...prev, error: 'Please enter the Cardholder Name.' }))
      return
    }
    if (cleanNum.length < 15) {
      setCardAuth((prev) => ({ ...prev, error: 'Please enter a valid 16-digit Card Number.' }))
      return
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardAuth.expiry)) {
      setCardAuth((prev) => ({ ...prev, error: 'Please enter a valid expiry date (MM/YY).' }))
      return
    }
    if ((cardAuth.cvv || '').length < 3) {
      setCardAuth((prev) => ({ ...prev, error: 'Please enter a 3 or 4 digit CVV/CVC.' }))
      return
    }
    setCardAuth((prev) => ({
      ...prev,
      error: '',
      is3dsOpen: true,
      otpCode: '748291',
      otpInput: '',
    }))
  }

  const handleVerifyCardOtp = (overrideOtp) => {
    const inputCode = (typeof overrideOtp === 'string' ? overrideOtp : cardAuth.otpInput).trim()
    if (inputCode === cardAuth.otpCode || inputCode === '748291') {
      setCardAuth((prev) => ({
        ...prev,
        authenticated: true,
        is3dsOpen: false,
        otpInput: '',
        error: '',
      }))
      showPopupToast('Card successfully authenticated via 3D Secure!', 'success')
    } else {
      setCardAuth((prev) => ({
        ...prev,
        error: 'Invalid security code. Please enter test code 748291.',
      }))
    }
  }

  const handleOpenPaypalModal = () => {
    setPaypalAuth((prev) => ({
      ...prev,
      isModalOpen: true,
      paypalEmailInput: prev.email || (authUser?.username ? `${authUser.username}@gmail.com` : 'gamer@gameboxd.com'),
      paypalPasswordInput: '••••••••',
      error: '',
      authorizing: false,
    }))
  }

  const handleAuthorizePaypal = () => {
    if (!paypalAuth.paypalEmailInput.includes('@')) {
      setPaypalAuth((prev) => ({ ...prev, error: 'Please enter a valid PayPal email address.' }))
      return
    }
    setPaypalAuth((prev) => ({ ...prev, authorizing: true, error: '' }))
    setTimeout(() => {
      setPaypalAuth((prev) => ({
        ...prev,
        authenticated: true,
        email: prev.paypalEmailInput,
        authorizing: false,
        isModalOpen: false,
      }))
      showPopupToast('PayPal account authenticated and authorized!', 'success')
    }, 1200)
  }

  const handleVerifyWalletPin = (overridePin) => {
    if (!authUser?.username) {
      setWalletAuth((prev) => ({ ...prev, error: 'Sign in to GameBoxd to use wallet balance.' }))
      setShowAuthModal(true)
      return
    }
    if (cartTotal > walletBalance) {
      setWalletAuth((prev) => ({ ...prev, error: `Insufficient balance ($${walletBalance.toFixed(2)} available).` }))
      return
    }
    const pin = (typeof overridePin === 'string' ? overridePin : walletAuth.pin).trim()
    if (pin === '1234' || (pin.length === 4 && /^\d+$/.test(pin))) {
      setWalletAuth({
        authenticated: true,
        pin: pin,
        error: '',
      })
      showPopupToast('Wallet authenticated and authorized for purchase!', 'success')
    } else {
      setWalletAuth((prev) => ({
        ...prev,
        error: 'Invalid PIN. Enter 4 digits (Default PIN: 1234).',
      }))
    }
  }

  const handleConfirmPurchase = () => {
    if (selectedPaymentMethod === 'card' && !cardAuth.authenticated) {
      showPopupToast('Please authenticate your Credit/Debit Card first.', 'error')
      if (!cardAuth.cardholder || !cardAuth.cardNumber) {
        handleFillTestCard()
      }
      setCardAuth((prev) => ({ ...prev, is3dsOpen: true, otpCode: '748291', otpInput: '' }))
      return
    }
    if (selectedPaymentMethod === 'paypal' && !paypalAuth.authenticated) {
      showPopupToast('Please authenticate your PayPal account first.', 'error')
      handleOpenPaypalModal()
      return
    }
    if (selectedPaymentMethod === 'wallet') {
      if (!authUser?.username) {
        showPopupToast('Please sign in to GameBoxd to use your wallet balance.', 'error')
        setShowAuthModal(true)
        return
      }
      if (cartTotal > walletBalance) {
        showPopupToast(`Insufficient wallet balance. Total: $${cartTotal.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`, 'error')
        return
      }
      if (!walletAuth.authenticated) {
        showPopupToast('Please authenticate your GameBoxd Wallet with your PIN.', 'error')
        return
      }
    }

    setCheckoutStep('processing')
    setTimeout(() => {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const orderNum = `GBX-${Math.floor(100000 + Math.random() * 900000)}`
      const methodLabel = selectedPaymentMethod === 'card'
        ? `Credit Card (${cardAuth.brand || 'Card'} •••• ${(cardAuth.cardNumber || '').replace(/\D/g, '').slice(-4) || '4242'})`
        : selectedPaymentMethod === 'paypal'
        ? `PayPal (${paypalAuth.email || 'gamer@paypal.com'})`
        : `GameBoxd Wallet (Deducted $${cartTotal.toFixed(2)})`

      const newPurchases = cartItems.map((item) => ({
        id: `p-${Date.now()}-${item.id}`,
        title: item.title,
        coverUrl: item.coverUrl,
        price: getItemNumericPrice(item),
        key: generateSimulatedKey(),
        platform: item.platform || 'Steam Key',
        orderId: orderNum,
        purchaseDate: dateStr,
        paymentMethod: methodLabel,
      }))

      if (selectedPaymentMethod === 'wallet') {
        const remaining = Math.max(0, walletBalance - cartTotal)
        setWalletBalance(remaining)
        try {
          localStorage.setItem('gb_wallet_balance', remaining.toFixed(2))
        } catch (e) {}
      }

      // Record transaction to backend database & localStorage
      const txPayload = {
        order_id: orderNum,
        items: newPurchases,
        total_amount: cartTotal,
        payment_method: methodLabel,
        status: 'completed',
      }
      createTransaction(txPayload, authUser?.token)

      try {
        const existingTx = JSON.parse(localStorage.getItem('gb_all_transactions') || '[]')
        const newTx = {
          id: Date.now(),
          order_id: orderNum,
          user_id: null,
          username: authUser?.username || 'Guest',
          profile_pic: authUser?.profile_pic || null,
          items: newPurchases,
          total_amount: cartTotal,
          payment_method: methodLabel,
          status: 'completed',
          created_at: new Date().toISOString(),
        }
        localStorage.setItem('gb_all_transactions', JSON.stringify([newTx, ...existingTx]))
      } catch (e) {}

      setPurchasedKeys(newPurchases)
      setPurchasedGames((prev) => [...newPurchases, ...prev])
      setCheckoutStep('success')
      setCartItems([])
      setAppliedPromo(null)
      showPopupToast('Purchase successful! Games added to your Game Library.', 'success')
    }, 1600)
  }

  const isInvalidAuthPayload = (value) => {
    const detail = String(value?.detail || '').toLowerCase()
    return detail.includes('invalid authentication') || detail.includes('not authenticated') || detail.includes('token')
  }

  const clearExpiredSession = () => {
    try { localStorage.removeItem('gb_user') } catch (e) {}
    setAuthUser(null)
    setShowAuthModal(true)
  }

  const screenshotCount = catalogGameDetails?.screenshots?.length ?? 0
  const expandedShot =
    expandedImageIndex !== null && screenshotCount
      ? catalogGameDetails.screenshots[expandedImageIndex]
      : null

  const moveExpandedImage = (step) => {
    if (!screenshotCount) {
      return
    }

    setExpandedImageIndex((current) => {
      if (current === null) {
        return 0
      }

      return (current + step + screenshotCount) % screenshotCount
    })
  }

  useEffect(() => {
    if (expandedImageIndex === null) {
      return
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setExpandedImageIndex(null)
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveExpandedImage(1)
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveExpandedImage(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expandedImageIndex, screenshotCount])

  const parseCatalogSearchInput = (value) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return { term: '', type: 'title' }
    }

    const developerPrefix = trimmed.match(/^(dev|developer)\s*:\s*(.+)$/i)
    if (developerPrefix) {
      return { term: developerPrefix[2].trim(), type: 'developer' }
    }

    const publisherPrefix = trimmed.match(/^(pub|publisher)\s*:\s*(.+)$/i)
    if (publisherPrefix) {
      return { term: publisherPrefix[2].trim(), type: 'publisher' }
    }

    return { term: trimmed, type: 'title' }
  }

  const scheduleSuggestions = (value) => {
    try { clearTimeout(suggestionTimer.current) } catch {}
    if (!value || String(value).trim().length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }
    suggestionTimer.current = setTimeout(async () => {
      try {
        const [gamesSuggestions, userResults] = await Promise.all([
          fetchRawgSuggestions(value, 5),
          searchUsers(value, 3),
        ])
        const games = gamesSuggestions || []
        const users = (userResults || []).map((u) => ({ ...u, type: 'user' }))
        // Merge: games first (with their 'game' or 'series' types), then users
        const combined = [...games, ...users]
        setSearchSuggestions(combined)
        setShowSuggestions(true)
        setFocusedSuggestion(combined && combined.length ? 0 : -1)
      } catch {
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    }, 220)
  }

  const handleGlobalSearch = (value) => {
    // update the input and trigger suggestions only; do NOT navigate to Catalog until user submits
    setGlobalSearchInput(value)
    scheduleSuggestions(value)
  }

  const submitGlobalSearch = (value) => {
    const parsed = parseCatalogSearchInput(value)
    if (parsed.term) {
      setCatalogSearch(parsed.term)
      setCatalogSearchType(parsed.type)
      setActiveTab('Catalog')
      setCatalogPage(1)
    }
  }

  const openCatalogDetails = (slug) => {
    setSelectedCatalogGameSlug(slug)
    setDetailRating(0)
    setDetailReviewText('')
    setActiveTab('Game Details')
  }

  useEffect(() => {
    const loadTopGames = async () => {
      setIsLoadingGames(true)
      setGamesError('')
      try {
        const games = await fetchTrendingGamingNews(currentNewsSource)
        setTopGames(games)
      } catch {
        setGamesError('Could not load recent gaming news. Please try again later.')
      } finally {
        setIsLoadingGames(false)
      }
    }

    loadTopGames()
  }, [currentNewsSource])

  useEffect(() => {
    const loadNewsFeed = async () => {
      setIsLoadingNews(true)
      setNewsError('')
      try {
        const latestNews = await fetchLatestGamingNews(currentNewsSource)
        setNewsFeed(latestNews)
      } catch {
        setNewsError('Could not load gaming news. Please try again later.')
      } finally {
        setIsLoadingNews(false)
      }
    }

    loadNewsFeed()
  }, [currentNewsSource])

  useEffect(() => {
    if (activeTab !== 'Catalog') {
      return
    }

    const loadCatalog = async () => {
      setIsLoadingCatalog(true)
      setCatalogError('')
      try {
        const data = await fetchRawgCatalogGames({
          page: catalogPage,
          pageSize: 12,
          search: catalogSearch,
          searchBy: catalogSearchType,
          genre: catalogGenre.startsWith('tag:') ? '' : catalogGenre,
          platform: catalogPlatform,
          ordering: catalogSort,
          tag: catalogGenre.startsWith('tag:') ? catalogGenre.slice(4) : catalogTag,
          yearFrom: 1980,
          yearTo: releaseYear,
          criticMin,
        })
        const filteredByUser = data.items.filter((item) => Number(item.userRating) >= userMin)
        setCatalogGames(filteredByUser)
        setCatalogTotal(data.total)
        if (filteredByUser.length && !selectedCatalogGameSlug) {
          setSelectedCatalogGameSlug(filteredByUser[0].slug ?? String(filteredByUser[0].id))
        }
      } catch {
        setCatalogError('Could not load RAWG catalog. Please try again later.')
      } finally {
        setIsLoadingCatalog(false)
      }
    }

    loadCatalog()
  }, [
    activeTab,
    catalogPage,
    catalogSearch,
    catalogSearchType,
    catalogGenre,
    catalogTag,
    catalogPlatform,
    catalogSort,
    releaseYear,
    criticMin,
    userMin,
    selectedCatalogGameSlug,
  ])

  useEffect(() => {
    if (activeTab !== 'News') {
      return
    }

    const loadNewsPage = async () => {
      setIsLoadingNewsPage(true)
      setNewsPageError('')
      try {
        const articles = await fetchGamingNewsPage(24, currentNewsSource)
        setNewsPageItems(articles)
        setNewsPage(1)
      } catch {
        setNewsPageError('Could not load the gaming news page right now.')
      } finally {
        setIsLoadingNewsPage(false)
      }
    }

    loadNewsPage()
  }, [activeTab, currentNewsSource])

  useEffect(() => {
    if (activeTab !== 'Game Details' || !selectedCatalogGameSlug) {
      return
    }

    const loadCatalogDetails = async () => {
      setIsLoadingCatalogDetails(true)
      setCatalogDetailsError('')
      setDetailRating(0)
      setDetailReviewText('')
      setDetailStatus('library')
      try {
        const details = await fetchRawgGameDetails(selectedCatalogGameSlug)
        setCatalogGameDetails(details)
      } catch {
        setCatalogDetailsError('Could not load game details from RAWG right now.')
      } finally {
        setIsLoadingCatalogDetails(false)
      }
    }

    loadCatalogDetails()
  }, [activeTab, selectedCatalogGameSlug])

  // Fetch game reviews when details load
  useEffect(() => {
    if (!catalogGameDetails || !catalogGameDetails.id) {
      setGameReviews([])
      return
    }
    const loadReviews = async () => {
      setIsLoadingGameReviews(true)
      try {
        const revs = await getGameReviews(catalogGameDetails.id)
        setGameReviews((revs || []))
      } catch (e) {
        setGameReviews([])
      } finally {
        setIsLoadingGameReviews(false)
      }
    }
    loadReviews()
  }, [catalogGameDetails])

  // Focus review textarea if user clicked Add from catalog and details finished loading
  useEffect(() => {
    if (!catalogGameDetails) return
    if (pendingAddGameSlug && pendingAddGameSlug === selectedCatalogGameSlug) {
      try {
        detailReviewRef?.current?.focus()
      } catch {}
    }
  }, [catalogGameDetails, pendingAddGameSlug, selectedCatalogGameSlug])

  // AddModal handlers
  const handleModalClose = () => {
    setShowAddModal(false)
    setAddModalIdentifier(null)
  }

  const handleModalAdded = (res) => {
    // Optionally refresh collection or show toast; for now just log
    try {
      // best-effort: refresh collection view if visible
      // (collection list is fetched elsewhere when needed)
    } catch {}
  }

  useEffect(() => {
    const loadUserGames = async () => {
      if (!authUser?.token) {
        setUserGames([])
        setFollowNotifications([])
        setFollowNotifUnreadCount(0)
        setShowFollowNotifications(false)
        return
      }
      setIsLoadingUserGames(true)
      setUserGamesError('')
      try {
        const res = await listGames(authUser.token)
        if (!Array.isArray(res)) {
          if (isInvalidAuthPayload(res)) {
            clearExpiredSession()
            return
          }
          throw new Error(res?.detail || 'Failed to load games')
        }
        setUserGames((res || []).map((g) => ({ ...g })))
        // load persistent activity feed
        try {
          setIsLoadingActivities(true)
          setActivitiesError('')
          const acts = await getActivity(authUser.token)
          if (Array.isArray(acts)) {
            setActivities((acts || []).map((a) => ({ ...a })))
          } else {
            setActivities([])
          }
        } catch (er) {
          setActivitiesError('Could not load activity feed.')
        } finally {
          setIsLoadingActivities(false)
        }

        // fetch user profile for avatar/genres and attach to authUser
        try {
          const prof = await getUserProfile(authUser.username, authUser.token)
          if (isInvalidAuthPayload(prof)) {
            clearExpiredSession()
            return
          }
          setAuthUser((prev) => {
            const next = { ...(prev || {}), profile_pic: prof.profile_pic, genres: prof.genres }
            try { localStorage.setItem('gb_user', JSON.stringify(next)) } catch (e) {}
            return next
          })
        } catch {}
      } catch (e) {
        setUserGamesError('Could not load your collection.')
      } finally {
        setIsLoadingUserGames(false)
      }
    }

    loadUserGames()
  }, [authUser])

  useEffect(() => {
    const loadNotifications = async () => {
      if (!authUser?.token) {
        setFollowNotifications([])
        setFollowNotifUnreadCount(0)
        return
      }
      try {
        const [items, unreadPayload] = await Promise.all([
          getFollowNotifications(authUser.token, 20),
          getFollowNotificationsUnreadCount(authUser.token),
        ])
        if (isInvalidAuthPayload(items) || isInvalidAuthPayload(unreadPayload)) {
          clearExpiredSession()
          return
        }
        setFollowNotifications(Array.isArray(items) ? items : [])
        setFollowNotifUnreadCount(Number(unreadPayload?.unread_count) || 0)
      } catch (_e) {
        setFollowNotifications([])
        setFollowNotifUnreadCount(0)
      }
    }

    loadNotifications()
    if (!authUser?.token) return undefined
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [authUser?.token])

  useEffect(() => {
    const loadFollowingFeed = async () => {
      if (activeTab !== 'Following Feed') {
        return
      }

      if (!authUser?.token) {
        setFollowingFeed([])
        setFollowingFeedError('Log in to view posts from users you follow.')
        return
      }

      setIsLoadingFollowingFeed(true)
      setFollowingFeedError('')
      try {
        const items = await getFollowingFeed(authUser.token, 30)
        if (isInvalidAuthPayload(items)) {
          clearExpiredSession()
          return
        }
        setFollowingFeed(Array.isArray(items) ? items : [])
      } catch (_e) {
        setFollowingFeedError('Could not load your following feed right now.')
      } finally {
        setIsLoadingFollowingFeed(false)
      }
    }

    loadFollowingFeed()
  }, [activeTab, authUser?.token])

  const openFollowNotifications = async () => {
    setShowFollowNotifications((current) => !current)
    if (!authUser?.token) return
    if (followNotifUnreadCount > 0) {
      try {
        await markFollowNotificationsReadAll(authUser.token)
        setFollowNotifUnreadCount(0)
        setFollowNotifications((prev) => (prev || []).map((item) => ({ ...item, is_read: true })))
      } catch (_e) {
        // no-op
      }
    }
  }

  const formatNotificationTime = (value) => {
    if (!value) return 'just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'just now'
    return date.toLocaleString()
  }

  const formatFeedTime = (value) => {
    if (!value) return 'just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'just now'
    return date.toLocaleString()
  }

  const collectionCards = useMemo(
    () => {
      // derive cards from the authenticated user's collection
      const stats = userGames.reduce(
        (acc, game) => {
          const status = String((game.status || 'library')).trim().toLowerCase()
          const key = status === 'finished' ? 'completed' : status === 'wishlist' ? 'library' : status
          acc[key] = (acc[key] || 0) + 1
          acc.total += 1
          return acc
        },
        { total: 0, playing: 0, completed: 0, library: 0 },
      )

      const mostRecent = (filter) => {
        const list = userGames
          .filter((g) => {
            const s = String((g.status || 'library')).trim().toLowerCase()
            const key = s === 'finished' ? 'completed' : s === 'wishlist' ? 'library' : s
            return key === filter
          })
          .sort((a, b) => new Date(b.added_at || 0) - new Date(a.added_at || 0))
        return list[0]
      }

      return [
        {
          title: 'Recently Playing',
          subtitle: mostRecent('playing')?.title || 'No games yet',
          status: mostRecent('playing') ? 'Playing' : '',
          cover: mostRecent('playing')?.cover_url || '/covers/tetris-nes.svg',
        },
        {
          title: 'Just Completed',
          subtitle: mostRecent('completed')?.title || 'No recent completions',
          status: mostRecent('completed') ? `${mostRecent('completed')?.rating || ''}` : '',
          cover: mostRecent('completed')?.cover_url || '/covers/tetris-nes.svg',
        },
        {
          title: 'My Collection',
          subtitle: `${stats.total} Games`,
          status: 'Your Collection',
          cover: userGames[0]?.cover_url || '/covers/tetris-nes.svg',
        },
      ]
    },
    // recompute when userGames changes
    [userGames],
  )

  const activityFeed = useMemo(() => {
    if (activities && activities.length) {
      return activities.map((a) => `${a.message || a.verb}`)
    }
    // fallback to client-derived feed
    const recent = (userGames || [])
      .slice()
      .sort((a, b) => new Date(b.added_at || 0) - new Date(a.added_at || 0))
      .slice(0, 6)
    return recent.map((g) => {
      const s = String((g.status || 'library')).trim()
      return `${g.title || 'Untitled'} — ${s}`
    })
  }, [activities, userGames])

  const sidebarTabs = [
    { label: 'Home', icon: Home, description: 'Dashboard overview' },
    ...(authUser ? [{ label: 'Profile', icon: User, description: 'Your profile' }] : []),
    ...(authUser ? [{ label: 'Following Feed', icon: Flame, description: 'Latest posts from users you follow' }] : []),
    { label: 'My Collection', icon: Users, description: 'Saved and tracked games' },
    { label: 'Game Library', icon: Gamepad2, description: 'Your purchased games & activation keys' },
    { label: 'News', icon: Newspaper, description: 'Latest gaming updates' },
    { label: 'Emulation', icon: Tv, description: 'Play classic ROMs' },
    { label: 'Catalog', icon: Monitor, description: 'Browse the RAWG catalog' },
  ]
  const catalogGenres = [
    { label: 'All Genres', value: '' },
    { label: 'Action', value: 'action' },
    { label: 'Platformer', value: 'platformer' },
    { label: 'Strategy', value: 'strategy' },
    { label: 'Simulation', value: 'simulation' },
    { label: 'Roguelike', value: 'tag:roguelike' },
    { label: 'RPG', value: 'role-playing-games-rpg' },
    { label: 'Shooter', value: 'shooter' },
    { label: 'Adventure', value: 'adventure' },
    { label: 'Indie', value: 'indie' },
    { label: 'Puzzle', value: 'puzzle' },
    { label: 'Racing', value: 'racing' },
    { label: 'Sports', value: 'sports' },
    { label: 'Fighting', value: 'fighting' },
    { label: 'Casual', value: 'casual' },
    { label: 'Arcade', value: 'arcade' },
  ]
  const catalogPlatforms = [
    { label: 'All Consoles', value: '' },
    { label: 'PC', value: '4' },
    { label: 'PlayStation 2', value: '15' },
    { label: 'PlayStation 3', value: '16' },
    { label: 'PlayStation 4', value: '18' },
    { label: 'PlayStation 5', value: '187' },
    { label: 'Nintendo Switch', value: '7' },
    { label: 'Nintendo 64', value: '83' },
    { label: 'GameCube', value: '105' },
    { label: 'Wii', value: '11' },
    { label: 'Wii U', value: '10' },
    { label: 'Sega Dreamcast', value: '106' },
    { label: 'Xbox (Original)', value: '80' },
    { label: 'Xbox 360', value: '14' },
    { label: 'Xbox One', value: '1' },
    { label: 'Xbox Series S/X', value: '186' },
    { label: 'iOS', value: '3' },
    { label: 'Android', value: '21' },
  ]
  const catalogSortOptions = [
    { label: 'Top Rated', value: '-rating' },
    { label: 'Newest', value: '-released' },
    { label: 'Most Added', value: '-added' },
    { label: 'Most Popular', value: '-metacritic' },
  ]
  const hasNextCatalogPage = catalogPage * 12 < catalogTotal
  const NEWS_FEATURED_COUNT = 3
  const NEWS_ITEMS_PER_PAGE = 6
  const featuredNewsItems = newsPageItems.slice(0, NEWS_FEATURED_COUNT)
  const remainingNewsItems = newsPageItems.slice(NEWS_FEATURED_COUNT)
  const totalNewsPages = Math.max(1, Math.ceil(remainingNewsItems.length / NEWS_ITEMS_PER_PAGE))
  const clampedNewsPage = Math.min(newsPage, totalNewsPages)
  const pagedNewsItems = remainingNewsItems.slice(
    (clampedNewsPage - 1) * NEWS_ITEMS_PER_PAGE,
    clampedNewsPage * NEWS_ITEMS_PER_PAGE,
  )
  const EMULATION_FALLBACK_COVER = '/covers/tetris-nes.svg'
  const [uploadedRoms, setUploadedRoms] = useState([])
  const [loadingUploadedRoms, setLoadingUploadedRoms] = useState(false)
  const getEmulatorUrl = (romFile, title) =>
    `/emulator/index.html?rom=${encodeURIComponent(romFile)}&title=${encodeURIComponent(title)}`
  const emulationGames = [
    {
      id: 'tetris-gb',
      title: 'Tetris',
      system: 'Gameboy',
      year: '1989',
      description: 'The iconic puzzle classic on original handheld hardware style.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Tetris_Boxshot.jpg',
      playUrl: getEmulatorUrl('Tetris (JUE) (V1.1) [!].gb', 'Tetris'),
      embedUrl: getEmulatorUrl('Tetris (JUE) (V1.1) [!].gb', 'Tetris'),
    },
    {
      id: 'super-mario-land-gb',
      title: 'Super Mario Land',
      system: 'Gameboy',
      year: '1989',
      description: 'Mario heads to Sarasaland in one of the original handheld platformers.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/Super-mario-land-gameboy-boxart.png',
      playUrl: getEmulatorUrl('super-mario-land-world.gb', 'Super Mario Land'),
      embedUrl: getEmulatorUrl('super-mario-land-world.gb', 'Super Mario Land'),
    },
    {
      id: 'donkey-kong-gb',
      title: 'Donkey Kong',
      system: 'Gameboy',
      year: '1994',
      description: 'A classic puzzle-platform evolution of the arcade rivalry between Mario and Donkey Kong.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/Donkey_Kong_94_box_art.jpg',
      playUrl: getEmulatorUrl('donkey-kong-ju-v11.gb', 'Donkey Kong'),
      embedUrl: getEmulatorUrl('donkey-kong-ju-v11.gb', 'Donkey Kong'),
    },
    {
      id: 'super-mario-land-2-gb',
      title: 'Super Mario Land 2: 6 Golden Coins',
      system: 'Gameboy',
      year: '1992',
      description: 'Mario explores six themed zones to recover the castle from Wario in this Game Boy classic.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Super_Mario_Land_2_box_art.jpg',
      playUrl: getEmulatorUrl('super-mario-land-2-6-golden-coins.gb', 'Super Mario Land 2: 6 Golden Coins'),
      embedUrl: getEmulatorUrl('super-mario-land-2-6-golden-coins.gb', 'Super Mario Land 2: 6 Golden Coins'),
    },
    {
      id: 'dr-mario-gb',
      title: 'Dr. Mario',
      system: 'Gameboy',
      year: '1990',
      description: 'The handheld version of Dr. Mario puzzle action with quick capsule matching and virus clearing gameplay.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Dr._Mario_box_art.jpg',
      playUrl: getEmulatorUrl('Dr. Mario (World).gb', 'Dr. Mario'),
      embedUrl: getEmulatorUrl('Dr. Mario (World).gb', 'Dr. Mario'),
    },
    {
      id: 'ducktales-gb',
      title: 'DuckTales',
      system: 'Gameboy',
      year: '1990',
      description: 'Scrooge McDuck bounces through platform stages and treasure hunts in this Disney action-platform classic.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/64/DuckTales_NES_Cover.png',
      playUrl: getEmulatorUrl('DuckTales (USA).gb', 'DuckTales'),
      embedUrl: getEmulatorUrl('DuckTales (USA).gb', 'DuckTales'),
    },
    {
      id: 'kirbys-dream-land-gb',
      title: "Kirby's Dream Land",
      system: 'Gameboy',
      year: '1992',
      description: 'Kirby\'s original adventure introduces inhale-and-float platforming through Dream Land.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Kirbys-dream-land-gameboy-boxart.png',
      playUrl: getEmulatorUrl("Kirby's Dream Land (USA, Europe).gb", "Kirby's Dream Land"),
      embedUrl: getEmulatorUrl("Kirby's Dream Land (USA, Europe).gb", "Kirby's Dream Land"),
    },
    {
      id: 'kirbys-dream-land-2-gb',
      title: "Kirby's Dream Land 2",
      system: 'Gameboy',
      year: '1995',
      description: 'Kirby teams up with animal friends in this sequel featuring expanded stages and power combos.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Kirbys-dream-land-2-gameboy-boxart.png',
      playUrl: getEmulatorUrl("Kirby's Dream Land 2 (USA, Europe) (SGB Enhanced).gb", "Kirby's Dream Land 2"),
      embedUrl: getEmulatorUrl("Kirby's Dream Land 2 (USA, Europe) (SGB Enhanced).gb", "Kirby's Dream Land 2"),
    },
    {
      id: 'links-awakening-gb',
      title: "The Legend of Zelda: Link's Awakening",
      system: 'Gameboy',
      year: '1993',
      description: 'Explore Koholint Island in this story-driven Zelda adventure built for the original Game Boy.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Link%27s_Awakening.png',
      playUrl: getEmulatorUrl("Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 1).gb", "The Legend of Zelda: Link's Awakening"),
      embedUrl: getEmulatorUrl("Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 1).gb", "The Legend of Zelda: Link's Awakening"),
    },
    {
      id: 'metroid-2-gb',
      title: 'Metroid II: Return of Samus',
      system: 'Gameboy',
      year: '1991',
      description: 'Samus hunts the remaining Metroids in this atmospheric side-scrolling action adventure.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/Metroid2_boxart.jpg',
      playUrl: getEmulatorUrl('Metroid II - Return of Samus (World).gb', 'Metroid II: Return of Samus'),
      embedUrl: getEmulatorUrl('Metroid II - Return of Samus (World).gb', 'Metroid II: Return of Samus'),
    },
    {
      id: 'kirby-nightmare-gba',
      title: 'Kirby: Nightmare in Dream Land',
      system: 'Gameboy Advance',
      year: '2002',
      description: 'Kirby returns in this colorful GBA platform adventure and remake of the original Dream Land story.',
      imageUrl: 'https://media.rawg.io/media/games/c8d/c8d0aa9cb56585f286a5f4d26d1c347c.jpg',
      playUrl: getEmulatorUrl('Kirby - Nightmare in Dream Land (USA).gba', 'Kirby: Nightmare in Dream Land'),
      embedUrl: getEmulatorUrl('Kirby - Nightmare in Dream Land (USA).gba', 'Kirby: Nightmare in Dream Land'),
    },
    {
      id: 'warioware-mega-gba',
      title: 'WarioWare, Inc.: Mega Microgame$!',
      system: 'Gameboy Advance',
      year: '2003',
      description: 'A rapid-fire microgame collection packed with fast, chaotic, and creative gameplay challenges.',
      imageUrl: 'https://media.rawg.io/media/games/c6c/c6c1adc70a9204cd43a0fbff05f053d1.jpg',
      playUrl: getEmulatorUrl('WarioWare, Inc. - Mega Microgame$! (USA).gba', 'WarioWare, Inc.: Mega Microgame$!'),
      embedUrl: getEmulatorUrl('WarioWare, Inc. - Mega Microgame$! (USA).gba', 'WarioWare, Inc.: Mega Microgame$!'),
    },
    {
      id: 'super-mario-advance-2-gba',
      title: 'Super Mario Advance 2: Super Mario World',
      system: 'Gameboy Advance',
      year: '2001',
      description: 'The classic Super Mario World adventure rebuilt for Game Boy Advance with portable platforming action.',
      imageUrl: 'https://media.rawg.io/media/games/413/4135e800918b4d9c0f6094ccd003a054.jpg',
      playUrl: getEmulatorUrl('Super Mario Advance 2 - Super Mario World (USA).gba', 'Super Mario Advance 2: Super Mario World'),
      embedUrl: getEmulatorUrl('Super Mario Advance 2 - Super Mario World (USA).gba', 'Super Mario Advance 2: Super Mario World'),
    },
    {
      id: 'superstar-saga-gba',
      title: 'Mario & Luigi: Superstar Saga',
      system: 'Gameboy Advance',
      year: '2003',
      description: 'A humorous turn-based RPG adventure starring Mario and Luigi in the Beanbean Kingdom.',
      imageUrl: 'https://media.rawg.io/media/games/c48/c488b166259e38d942478c59b7508cdf.jpg',
      playUrl: getEmulatorUrl('Mario & Luigi - Superstar Saga (USA).gba', 'Mario & Luigi: Superstar Saga'),
      embedUrl: getEmulatorUrl('Mario & Luigi - Superstar Saga (USA).gba', 'Mario & Luigi: Superstar Saga'),
    },
    {
      id: 'minish-cap-gba',
      title: 'The Legend of Zelda: The Minish Cap',
      system: 'Gameboy Advance',
      year: '2004',
      description: 'Link shrinks down to explore tiny worlds, solve clever puzzles, and stop Vaati in a vibrant handheld Zelda adventure.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0a/TLOZ-_Minish_Cap_NA_Box_art.png',
      playUrl: getEmulatorUrl('Legend of Zelda, The - The Minish Cap (USA).gba', 'The Legend of Zelda: The Minish Cap'),
      embedUrl: getEmulatorUrl('Legend of Zelda, The - The Minish Cap (USA).gba', 'The Legend of Zelda: The Minish Cap'),
    },
    {
      id: 'mario-kart-super-circuit-gba',
      title: 'Mario Kart: Super Circuit',
      system: 'Gameboy Advance',
      year: '2001',
      description: 'Race through classic cups and unlockable tracks in the first portable Mario Kart built for Game Boy Advance.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/90/Super_Circuit.jpg',
      playUrl: getEmulatorUrl('Mario Kart - Super Circuit (USA).gba', 'Mario Kart: Super Circuit'),
      embedUrl: getEmulatorUrl('Mario Kart - Super Circuit (USA).gba', 'Mario Kart: Super Circuit'),
    },
    {
      id: 'metroid-zero-mission-gba',
      title: 'Metroid: Zero Mission',
      system: 'Gameboy Advance',
      year: '2004',
      description: 'Samus revisits Zebes in a refined remake that blends classic exploration with sharp action-platform design.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Metroid_--_Zero_Mission_%28box_art%29.jpg',
      playUrl: getEmulatorUrl('Metroid - Zero Mission (USA).gba', 'Metroid: Zero Mission'),
      embedUrl: getEmulatorUrl('Metroid - Zero Mission (USA).gba', 'Metroid: Zero Mission'),
    },
    {
      id: 'pokemon-firered-gba',
      title: 'Pokémon FireRed Version',
      system: 'Gameboy Advance',
      year: '2004',
      description: 'Choose your starter, explore Kanto again, and build a team in the enhanced handheld remake of the original Pokémon journey.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Pokemon_LeafGreen_box.jpg',
      playUrl: getEmulatorUrl('Pokemon - FireRed Version (USA).gba', 'Pokémon FireRed Version'),
      embedUrl: getEmulatorUrl('Pokemon - FireRed Version (USA).gba', 'Pokémon FireRed Version'),
    },
    {
      id: 'pokemon-ruby-gba',
      title: 'Pokémon Ruby Version',
      system: 'Gameboy Advance',
      year: '2002',
      description: 'Travel through Hoenn, catch new Pokémon, and challenge Gym Leaders in one of the definitive GBA RPG adventures.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/PokemonRubySapphireBox.jpg',
      playUrl: getEmulatorUrl('Pokemon - Ruby Version (USA).gba', 'Pokémon Ruby Version'),
      embedUrl: getEmulatorUrl('Pokemon - Ruby Version (USA).gba', 'Pokémon Ruby Version'),
    },
    {
      id: 'sonic-advance-gba',
      title: 'Sonic Advance',
      system: 'Gameboy Advance',
      year: '2001',
      description: 'Blast through fast-paced platforming stages with Sonic, Tails, Knuckles, and Amy in a colorful GBA debut.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ab/Sonic_Advance_US_cover.jpg',
      playUrl: getEmulatorUrl('Sonic Advance (USA) (En,Ja).gba', 'Sonic Advance'),
      embedUrl: getEmulatorUrl('Sonic Advance (USA) (En,Ja).gba', 'Sonic Advance'),
    },
    {
      id: 'aladdin-genesis',
      title: 'Aladdin',
      system: 'Sega Genesis',
      year: '1993',
      description: 'A fast, animation-rich platformer where Aladdin runs, jumps, and scimitar-slashes across iconic film-inspired stages.',
      imageUrl: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Aladdin%20(USA).png',
      playUrl: getEmulatorUrl('Aladdin (USA).md', 'Aladdin'),
      embedUrl: getEmulatorUrl('Aladdin (USA).md', 'Aladdin'),
    },
    {
      id: 'outrun-genesis',
      title: 'OutRun',
      system: 'Sega Genesis',
      year: '1991',
      description: 'Choose your routes, dodge traffic, and race against the clock in this classic open-road Sega arcade conversion.',
      imageUrl: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/OutRun%20(USA).png',
      playUrl: getEmulatorUrl('OutRun (USA, Europe).md', 'OutRun'),
      embedUrl: getEmulatorUrl('OutRun (USA, Europe).md', 'OutRun'),
    },
    {
      id: 'streets-of-rage-2-genesis',
      title: 'Streets of Rage 2',
      system: 'Sega Genesis',
      year: '1992',
      description: 'Team up for side-scrolling beat-em-up action with hard-hitting combos, memorable bosses, and a legendary soundtrack.',
      imageUrl: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Streets%20of%20Rage%202%20(USA).png',
      playUrl: getEmulatorUrl('Streets of Rage 2 (USA).md', 'Streets of Rage 2'),
      embedUrl: getEmulatorUrl('Streets of Rage 2 (USA).md', 'Streets of Rage 2'),
    },
    {
      id: 'world-of-illusion-genesis',
      title: 'World of Illusion',
      system: 'Sega Genesis',
      year: '1992',
      description: 'Play as Mickey or Donald in a co-op friendly platform adventure packed with magical set pieces and Disney charm.',
      imageUrl: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/World%20of%20Illusion%20Starring%20Mickey%20Mouse%20and%20Donald%20Duck%20(Europe).png',
      playUrl: getEmulatorUrl('World of Illusion Starring Mickey Mouse and Donald Duck (USA, Korea) (En).md', 'World of Illusion'),
      embedUrl: getEmulatorUrl('World of Illusion Starring Mickey Mouse and Donald Duck (USA, Korea) (En).md', 'World of Illusion'),
    },
    {
      id: 'castle-of-illusion-genesis',
      title: 'Castle of Illusion Starring Mickey Mouse',
      system: 'Sega Genesis',
      year: '1990',
      description: 'A colorful platformer where Mickey explores a magical castle to save Minnie from an evil witch.',
      imageUrl: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Castle%20of%20Illusion%20Starring%20Mickey%20Mouse%20(USA%20Europe).png',
      imageUrl: '/covers/castle-of-illusion-genesis.png',
      playUrl: getEmulatorUrl('Castle of Illusion Starring Mickey Mouse (USA Europe).md', 'Castle of Illusion'),
      embedUrl: getEmulatorUrl('Castle of Illusion Starring Mickey Mouse (USA Europe).md', 'Castle of Illusion'),
    },
    {
      id: 'super-mario-world-snes',
      title: 'Super Mario World',
      system: 'SNES',
      year: '1990',
      description: 'Mario explores Dinosaur Land to rescue Princess Peach and ride Yoshi in a landmark platformer.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Super_Mario_All_Stars_(game_box_art).jpg',
      playUrl: getEmulatorUrl('Super Mario All-Stars (USA).sfc', 'Super Mario World'),
      embedUrl: getEmulatorUrl('Super Mario All-Stars (USA).sfc', 'Super Mario World'),
    },
    {
      id: 'zelda-alttp-snes',
      title: "The Legend of Zelda: A Link to the Past",
      system: 'SNES',
      year: '1991',
      description: 'A top-down action-adventure that sends Link between light and dark worlds to save Hyrule.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/21/The_Legend_of_Zelda_A_Link_to_the_Past_SNES_Game_Cover.jpg',
      playUrl: getEmulatorUrl('The Legend of Zelda - A Link to the Past (USA).sfc', "The Legend of Zelda: A Link to the Past"),
      embedUrl: getEmulatorUrl('The Legend of Zelda - A Link to the Past (USA).sfc', "The Legend of Zelda: A Link to the Past"),
    },
    {
      id: 'super-metroid-snes',
      title: 'Super Metroid',
      system: 'SNES',
      year: '1994',
      description: 'A seminal exploration-based action game with atmospheric level design and upgrades.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Smetroidbox.jpg',
      playUrl: getEmulatorUrl('Super Metroid (Europe) (En,Fr,De).sfc', 'Super Metroid'),
      embedUrl: getEmulatorUrl('Super Metroid (Europe) (En,Fr,De).sfc', 'Super Metroid'),
    },
    {
      id: 'donkey-kong-country-snes',
      title: 'Donkey Kong Country',
      system: 'SNES',
      year: '1994',
      description: 'A visually impressive platformer featuring Donkey Kong and Diddy on a quest for stolen banana hoards.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1a/Donkey_Kong_Country_SNES_cover.png',
      playUrl: getEmulatorUrl('Donkey Kong Country (USA).sfc', 'Donkey Kong Country'),
      embedUrl: getEmulatorUrl('Donkey Kong Country (USA).sfc', 'Donkey Kong Country'),
    },
    {
      id: 'donkey-kong-country-2-snes',
      title: "Donkey Kong Country 2 - Diddy's Kong Quest",
      system: 'SNES',
      year: '1995',
      description: 'A darker, more challenging sequel with new mechanics and levels starring Diddy Kong.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c/DK_Country_2.jpg',
      playUrl: getEmulatorUrl("Donkey Kong Country 2 - Diddy's Kong Quest (USA) (En,Fr).sfc", "Donkey Kong Country 2 - Diddy's Kong Quest"),
      embedUrl: getEmulatorUrl("Donkey Kong Country 2 - Diddy's Kong Quest (USA) (En,Fr).sfc", "Donkey Kong Country 2 - Diddy's Kong Quest"),
    },
    {
      id: 'kirby-super-star-snes',
      title: 'Kirby Super Star',
      system: 'SNES',
      year: '1996',
      description: 'A collection of bite-sized Kirby adventures showcasing varied gameplay and cooperative play.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Kirby_Super_Star_Coverart.png',
      playUrl: getEmulatorUrl('Kirby Super Star (USA).sfc', 'Kirby Super Star'),
      embedUrl: getEmulatorUrl('Kirby Super Star (USA).sfc', 'Kirby Super Star'),
    },
    {
      id: 'super-bomberman-snes',
      title: 'Super Bomberman',
      system: 'SNES',
      year: '1993',
      description: 'Classic arena-based bomb combat with maze-like stages and multiplayer mayhem.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Super.Bomberman.Box.Art.SNES.PAL.png',
      playUrl: getEmulatorUrl('Super Bomberman (USA).sfc', 'Super Bomberman'),
      embedUrl: getEmulatorUrl('Super Bomberman (USA).sfc', 'Super Bomberman'),
    },
    {
      id: 'super-mario-kart-snes',
      title: 'Super Mario Kart',
      system: 'SNES',
      year: '1992',
      description: 'Kart racing pioneer introducing mode-based cups, drifting, and iconic power-ups.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/n/3/38/Supermariokart_box.JPG',
      playUrl: getEmulatorUrl('Super Mario Kart (USA).sfc', 'Super Mario Kart'),
      embedUrl: getEmulatorUrl('Super Mario Kart (USA).sfc', 'Super Mario Kart'),
    },
    {
      id: 'teenage-mutant-ninja-turtles-iv-snes',
      title: 'Teenage Mutant Ninja Turtles IV - Turtles in Time',
      system: 'SNES',
      year: '1992',
      description: 'Arcade beat-em-up port featuring cooperative play and time-traveling levels.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Turtles_in_Time_(SNES_cover).jpg',
      playUrl: getEmulatorUrl('Teenage Mutant Ninja Turtles IV - Turtles in Time (USA).sfc', 'Teenage Mutant Ninja Turtles IV - Turtles in Time'),
      embedUrl: getEmulatorUrl('Teenage Mutant Ninja Turtles IV - Turtles in Time (USA).sfc', 'Teenage Mutant Ninja Turtles IV - Turtles in Time'),
    },
    {
      id: 'earthbound-snes',
      title: 'EarthBound',
      system: 'SNES',
      year: '1995',
      description: 'A quirky modern-day RPG with heartfelt humor, unique combat, and a devoted cult following.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1f/EarthBound_Box.jpg',
      playUrl: getEmulatorUrl('EarthBound (USA).sfc', 'EarthBound'),
      embedUrl: getEmulatorUrl('EarthBound (USA).sfc', 'EarthBound'),
    },
    {
      id: 'comix-zone-genesis',
      title: 'Comix Zone',
      system: 'Sega Genesis',
      year: '1995',
      description: 'A beat-em-up set inside the pages of a comic book with inventive panel-based level design.',
      imageUrl: '/covers/comix-zone-genesis.png',
      playUrl: getEmulatorUrl('Comix Zone (USA).md', 'Comix Zone'),
      embedUrl: getEmulatorUrl('Comix Zone (USA).md', 'Comix Zone'),
    },
    {
      id: 'earthworm-jim-genesis',
      title: 'Earthworm Jim',
      system: 'Sega Genesis',
      year: '1994',
      description: 'A zany run-and-gun platformer starring a super-powered earthworm in a robotic suit.',
      imageUrl: '/covers/earthworm-jim-genesis.png',
      playUrl: getEmulatorUrl('Earthworm Jim (USA).md', 'Earthworm Jim'),
      embedUrl: getEmulatorUrl('Earthworm Jim (USA).md', 'Earthworm Jim'),
    },
    {
      id: 'sonic-and-knuckles-sonic-3-genesis',
      title: 'Sonic & Knuckles + Sonic The Hedgehog 3',
      system: 'Sega Genesis',
      year: '1994',
      description: 'Combined cartridge experience: link Sonic & Knuckles with Sonic 3 for the full classic saga.',
      imageUrl: '/covers/sonic-and-knuckles-sonic-3-genesis.png',
      playUrl: getEmulatorUrl('Sonic & Knuckles + Sonic The Hedgehog 3 (World).md', 'Sonic & Knuckles + Sonic 3'),
      embedUrl: getEmulatorUrl('Sonic & Knuckles + Sonic The Hedgehog 3 (World).md', 'Sonic & Knuckles + Sonic 3'),
    },
    {
      id: 'sonic-1-genesis',
      title: 'Sonic The Hedgehog',
      system: 'Sega Genesis',
      year: '1991',
      description: 'The speedy platformer that introduced Sonic, loop-de-loops, and classic zone-based design.',
      imageUrl: '/covers/sonic-1-genesis.png',
      playUrl: getEmulatorUrl('Sonic The Hedgehog (USA, Europe).md', 'Sonic The Hedgehog'),
      embedUrl: getEmulatorUrl('Sonic The Hedgehog (USA, Europe).md', 'Sonic The Hedgehog'),
    },
    {
      id: 'sonic-2-genesis',
      title: 'Sonic The Hedgehog 2',
      system: 'Sega Genesis',
      year: '1992',
      description: 'Introduces Tails and refines high-speed platforming with iconic levels and a two-player mode.',
      imageUrl: '/covers/sonic-2-genesis.png',
      playUrl: getEmulatorUrl('Sonic The Hedgehog 2 (World).md', 'Sonic The Hedgehog 2'),
      embedUrl: getEmulatorUrl('Sonic The Hedgehog 2 (World).md', 'Sonic The Hedgehog 2'),
    },
    {
      id: 'tetris-nes',
      title: 'Tetris',
      system: 'NES',
      year: '1985',
      description: 'The legendary puzzle game that defined a console generation. Stack and clear blocks for endless gameplay.',
      imageUrl: 'https://media.rawg.io/media/games/637/637d7dc2f44d0f6ddd3ee2c0b1366962.jpg',
      playUrl: getEmulatorUrl('Tetris (USA).nes', 'Tetris'),
      embedUrl: getEmulatorUrl('Tetris (USA).nes', 'Tetris'),
    },
    {
      id: 'pac-man-nes',
      title: 'Pac-Man',
      system: 'NES',
      year: '1983',
      description: 'Guide Pac-Man through maze after maze, avoiding ghosts and eating pellets in this arcade legend.',
      imageUrl: 'https://media.rawg.io/media/games/ef3/ef3d2c3fe94361a3a3ef2dab06daa144.jpg',
      playUrl: getEmulatorUrl('Pac-Man (USA) (Namco).nes', 'Pac-Man'),
      embedUrl: getEmulatorUrl('Pac-Man (USA) (Namco).nes', 'Pac-Man'),
    },
    {
      id: 'dr-mario-nes',
      title: 'Dr. Mario',
      system: 'NES',
      year: '1990',
      description: 'Dr. Mario prescribes colorful virus-busting puzzle action in this Nintendo classic.',
      imageUrl: 'https://media.rawg.io/media/screenshots/05f/05f7d385e48f9f384cd4d496855029cd.jpg',
      playUrl: getEmulatorUrl('Dr. Mario (Japan, USA).nes', 'Dr. Mario'),
      embedUrl: getEmulatorUrl('Dr. Mario (Japan, USA).nes', 'Dr. Mario'),
    },
    {
      id: 'paperboy-nes',
      title: 'Paperboy',
      system: 'NES',
      year: '1985',
      description: 'Ride down suburban streets delivering papers while dodging obstacles in this unique action game.',
      imageUrl: 'https://media.rawg.io/media/screenshots/3d2/3d2bb57b39e2efa39d1c385585b2ea8b.jpg',
      playUrl: getEmulatorUrl('Paperboy (USA).nes', 'Paperboy'),
      embedUrl: getEmulatorUrl('Paperboy (USA).nes', 'Paperboy'),
    },
    {
      id: 'castlevania-nes',
      title: 'Castlevania',
      system: 'NES',
      year: '1986',
      description: 'Fight through Dracula\'s castle with whip-based action in this defining gothic platform classic.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Castlevania_1_cover.png',
      playUrl: getEmulatorUrl('Castlevania (USA).nes', 'Castlevania'),
      embedUrl: getEmulatorUrl('Castlevania (USA).nes', 'Castlevania'),
    },
    {
      id: 'mega-man-2-nes',
      title: 'Mega Man 2',
      system: 'NES',
      year: '1988',
      description: 'Defeat Robot Masters and copy their abilities in one of the most iconic action platformers ever made.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Megaman2_box.jpg',
      playUrl: getEmulatorUrl('Mega Man 2 (USA).nes', 'Mega Man 2'),
      embedUrl: getEmulatorUrl('Mega Man 2 (USA).nes', 'Mega Man 2'),
    },
    {
      id: 'punch-out-nes',
      title: "Mike Tyson's Punch-Out!!",
      system: 'NES',
      year: '1987',
      description: 'Climb the ranks as Little Mac and learn each opponent\'s patterns in this legendary boxing game.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Mike_Tyson%27s_Punch-Out%21%21_NES_Box.jpg',
      playUrl: getEmulatorUrl("Mike Tyson's Punch-Out!! (Japan, USA) (En).nes", "Mike Tyson's Punch-Out!!"),
      embedUrl: getEmulatorUrl("Mike Tyson's Punch-Out!! (Japan, USA) (En).nes", "Mike Tyson's Punch-Out!!"),
    },
    {
      id: 'super-mario-bros-nes',
      title: 'Super Mario Bros.',
      system: 'NES',
      year: '1985',
      description: 'Run and jump across the Mushroom Kingdom in the side-scroller that redefined the platform genre.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png',
      playUrl: getEmulatorUrl('Super Mario Bros. (World).nes', 'Super Mario Bros.'),
      embedUrl: getEmulatorUrl('Super Mario Bros. (World).nes', 'Super Mario Bros.'),
    },
    {
      id: 'super-mario-bros-2-nes',
      title: 'Super Mario Bros. 2',
      system: 'NES',
      year: '1988',
      description: 'Choose from four playable characters and toss enemies in this distinctive Mario adventure.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/78/Super_Mario_Bros._2_box_art.png',
      playUrl: getEmulatorUrl('Super Mario Bros. 2 (USA).nes', 'Super Mario Bros. 2'),
      embedUrl: getEmulatorUrl('Super Mario Bros. 2 (USA).nes', 'Super Mario Bros. 2'),
    },
    {
      id: 'super-mario-bros-3-nes',
      title: 'Super Mario Bros. 3',
      system: 'NES',
      year: '1988',
      description: 'Explore world maps, power-ups, and inventive stages in one of Nintendo\'s all-time classics.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Super_Mario_Bros._3_coverart.png',
      playUrl: getEmulatorUrl('Super Mario Bros. 3 (USA).nes', 'Super Mario Bros. 3'),
      embedUrl: getEmulatorUrl('Super Mario Bros. 3 (USA).nes', 'Super Mario Bros. 3'),
    },
  ]
  const platformLabelMap = {
    Gameboy: 'Game Boy',
    'Gameboy Advance': 'Game Boy Advance',
    'Sega Genesis': 'Sega Genesis',
    SNES: 'SNES',
    NES: 'NES',
  }
  const homeRandomEmulationPlatforms = useMemo(() => {
    const grouped = emulationGames.reduce((acc, game) => {
      if (!acc[game.system]) {
        acc[game.system] = []
      }
      acc[game.system].push(game)
      return acc
    }, {})

    const platforms = Object.entries(grouped).map(([system, games]) => ({
      id: system,
      system,
      label: platformLabelMap[system] || system,
      games,
    }))

    const shuffled = [...platforms]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      const temp = shuffled[index]
      shuffled[index] = shuffled[swapIndex]
      shuffled[swapIndex] = temp
    }

    return shuffled
  }, [emulationGames.length, uploadedRoms.length])
  const activeEmulationGame = selectedEmulationGame || emulationGames[0]
  const [emulationFilter, setEmulationFilter] = useState(null)

  // Load uploaded ROMs from backend (metadata includes description and cover_url)
  useEffect(() => {
    let mounted = true
    const loadUploaded = async () => {
      setLoadingUploadedRoms(true)
      try {
        const items = await getAdminRoms()
        if (!mounted) return
        // Map to emulation-game like objects, preferring built-in metadata when filenames match
        const mapped = (items || []).map((r) => {
          const fname = String(r.filename || '').trim()
          const lname = fname.toLowerCase()
          const getFilenameFromPlayUrl = (playUrl) => {
            try {
              const url = new URL(playUrl, window.location.origin)
              const rom = url.searchParams.get('rom')
              return rom ? decodeURIComponent(rom).toLowerCase() : ''
            } catch (e) {
              const m = /[?&]rom=([^&]+)/.exec(playUrl)
              return m ? decodeURIComponent(m[1]).toLowerCase() : ''
            }
          }

          const builtin = (emulationGames || []).find((g) => {
            const candidate = String(getFilenameFromPlayUrl(g.playUrl) || '').toLowerCase()
            return candidate && candidate === lname
          })

          const title = builtin ? builtin.title : fname.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ')
          const system = builtin ? builtin.system : 'Uploaded'
          const description = (r.description && r.description.length) ? r.description : (builtin ? builtin.description : '')
          const imageUrl = (r.cover_url && r.cover_url.length) ? r.cover_url : (builtin ? builtin.imageUrl : EMULATION_FALLBACK_COVER)

          return {
            id: `uploaded-${fname}`,
            filename: fname,
            title,
            system,
            year: builtin ? builtin.year : '',
            description,
            imageUrl,
            playUrl: getEmulatorUrl(fname, title),
            embedUrl: getEmulatorUrl(fname, title),
          }
        })
        setUploadedRoms(mapped)
      } catch (e) {
        console.error('Could not load uploaded ROMs', e)
        setUploadedRoms([])
      }
      setLoadingUploadedRoms(false)
    }
    loadUploaded()
    return () => { mounted = false }
  }, [])
  const getEmulationControlsBySystem = (system) => {
    const baseControls = [
      { action: 'Move / D-pad', key: 'Arrow Keys' },
      { action: 'Start', key: 'Enter' },
      { action: 'Select', key: 'Shift' },
      { action: 'A / B', key: 'Z / X' },
    ]

    if (system === 'Gameboy Advance') {
      return [
        ...baseControls,
        { action: 'L / R Shoulder', key: 'A / S' },
      ]
    }

    if (system === 'Sega Genesis') {
      return [
        { action: 'Move / D-pad', key: 'Arrow Keys' },
        { action: 'Start', key: 'Enter' },
        { action: 'A / B / C', key: 'Z / X / C' },
      ]
    }

    return baseControls
  }
  const toggleFeature = (feature) => {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    )
  }

  const resetCatalogFilters = () => {
    setCatalogSearch('')
    setCatalogSearchType('title')
    setCatalogGenre('')
    setCatalogTag('')
    setCatalogPlatform('')
    setCatalogSort('-metacritic')
    setReleaseYear(new Date().getFullYear())
    setCriticMin(0)
    setUserMin(0)
    setSelectedFeatures([])
    setCatalogPage(1)
    setSelectedCatalogGameSlug('')
  }
  const randomizedCatalogGames = useMemo(() => {
    const shuffled = [...catalogGames]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      const temp = shuffled[index]
      shuffled[index] = shuffled[swapIndex]
      shuffled[swapIndex] = temp
    }

    return shuffled
  }, [catalogGames])

  const currentTab = activeTab || 'Home'

  return (
    <main className={mergeStyles(styles.pageShell, currentTab === 'Catalog' ? styles.pageShellCatalogMode : {})}>
      <div className={mergeStyles(styles.backgroundGlow, styles.glowLeft)} aria-hidden="true"></div>
      <div className={mergeStyles(styles.backgroundGlow, styles.glowRight)} aria-hidden="true"></div>

      {popupToast ? (
        <div className={`app-popup-toast app-popup-toast-${popupToast.type}`} role="status" aria-live="polite">
          <span>{popupToast.message}</span>
          <button type="button" onClick={() => setPopupToast(null)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ) : null}

      <aside className={mergeStyles(styles.panel, styles.quickFiltersPanel, styles.sidebarNavPanel)}>
        <h2 className={styles.quickFiltersH2}>Sections</h2>
        <p className={styles.sourceInfo}>Jump between the main areas of GameBoxd.</p>
        <div className={styles.sidebarNavList}>
          {sidebarTabs.map(({ label, icon: Icon, description }) => (
            <button
              key={label}
              className={mergeStyles(styles.sidebarNavButton, activeTab === label ? styles.sidebarNavButtonActive : {})}
              onClick={() => setActiveTab((current) => (current === label ? null : label))}
              aria-current={activeTab === label ? 'page' : undefined}
            >
              <span className={styles.sidebarNavIcon} aria-hidden="true">
                {createElement(Icon, { size: 16 })}
              </span>
              <span className={styles.sidebarNavText}>
                <span className={styles.sidebarNavLabel}>{label}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className={mergeStyles(styles.dashboard, styles.panel)}>
        <header className={styles.topbar}>
          <div
            className={styles.brand}
            onClick={() => {
              setBrandClickCount((prev) => prev + 1)
              clearTimeout(brandClickTimeoutRef.current)
              if (brandClickCount + 1 === 3) {
                setShowAdmin(true)
                setBrandClickCount(0)
              } else {
                brandClickTimeoutRef.current = setTimeout(() => {
                  setBrandClickCount(0)
                }, 500)
              }
            }}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            title="Click 3 times rapidly to access admin"
          >
            <Gamepad2 size={20} />
            <span>Gameboxd</span>
          </div>
          <div className={styles.searchbox}>
            <Search size={17} />
            <input
              type="text"
              className={styles.searchboxInput}
              placeholder="Search title/dev/pub (use dev: Atlus or pub: SEGA)"
              value={globalSearchInput}
              onChange={(event) => handleGlobalSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setFocusedSuggestion((prev) => {
                    const next = Math.min((searchSuggestions?.length || 0) - 1, Math.max(0, prev + 1))
                    return next
                  })
                  return
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setFocusedSuggestion((prev) => Math.max(0, prev - 1))
                  return
                }
                if (event.key === 'Escape') {
                  setShowSuggestions(false)
                  setFocusedSuggestion(-1)
                  return
                }
                if (event.key === 'Enter') {
                  // if a suggestion is focused, choose it
                  if (focusedSuggestion >= 0 && searchSuggestions[focusedSuggestion]) {
                    const s = searchSuggestions[focusedSuggestion]
                    if (s.type === 'user') {
                      setSelectedProfileUser(s.username)
                      setActiveTab('Profile')
                    } else if (s.type === 'series') {
                      setGlobalSearchInput(s.name)
                      setCatalogSearch('')
                      setCatalogTag(String(s.id))
                      setCatalogSearchType('title')
                      setActiveTab('Catalog')
                    } else {
                      setGlobalSearchInput(s.name)
                      setCatalogSearch(s.name)
                      setCatalogSearchType('title')
                      setActiveTab('Catalog')
                      setSelectedCatalogGameSlug(s.slug)
                      setCatalogTag('')
                    }
                    setShowSuggestions(false)
                    setFocusedSuggestion(-1)
                  } else {
                    submitGlobalSearch(globalSearchInput)
                  }
                }
              }}
              onFocus={() => { if (searchSuggestions && searchSuggestions.length) setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && searchSuggestions && searchSuggestions.length ? (
              <div className="search-suggestions">
                {searchSuggestions.map((s, idx) => (
                  s.type === 'user' ? (
                    <button
                      key={`user-${s.username}`}
                      type="button"
                      className={`search-suggestion-item ${focusedSuggestion === idx ? 'focused' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onMouseEnter={() => setFocusedSuggestion(idx)}
                      onClick={() => {
                        setSelectedProfileUser(s.username)
                        setActiveTab('Profile')
                        setShowSuggestions(false)
                        setFocusedSuggestion(-1)
                      }}
                    >
                      <div style={{width:46,height:46,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:'rgba(255,255,255,0.02)',overflow:'hidden'}}>
                        {s.profile_pic ? (
                          <img src={s.profile_pic} alt={s.username} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        ) : (
                          <User size={20} color="#dfeaff" />
                        )}
                      </div>
                      <span>User: {s.username}</span>
                    </button>
                  ) : s.type === 'series' ? (
                    <button
                      key={`series-${s.id}`}
                      type="button"
                      className={`search-suggestion-item ${focusedSuggestion === idx ? 'focused' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onMouseEnter={() => setFocusedSuggestion(idx)}
                      onClick={() => {
                        // show games for this series/tag
                        setGlobalSearchInput(s.name)
                        setCatalogSearch('')
                        setCatalogTag(String(s.id))
                        setCatalogSearchType('title')
                        setActiveTab('Catalog')
                        setShowSuggestions(false)
                        setFocusedSuggestion(-1)
                      }}
                    >
                      <div style={{width:46,height:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:'rgba(255,255,255,0.02)',color:'#dfeaff',fontSize:12,fontWeight:700}}>
                        S
                      </div>
                      <span>Series: {s.name} <small style={{marginLeft:8,color:'#9fb3d9'}}>{s.games_count || 0} games</small></span>
                    </button>
                  ) : (
                    <button
                      key={`game-${s.id}`}
                      type="button"
                      className={`search-suggestion-item ${focusedSuggestion === idx ? 'focused' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onMouseEnter={() => setFocusedSuggestion(idx)}
                      onClick={() => {
                        setGlobalSearchInput(s.name)
                        setCatalogSearch(s.name)
                        setCatalogSearchType('title')
                        setShowSuggestions(false)
                        setFocusedSuggestion(-1)
                        if (isMatureRating(s) && !hasMatureAgeAccess()) {
                          setMatureBirthDate('')
                          setMatureAgeError('')
                          setMatureAgeGate({ open: true, game: s })
                          return
                        }
                        setCatalogTag('')
                        setActiveTab('Catalog')
                        setSelectedCatalogGameSlug(s.slug)
                      }}
                    >
                      <img src={s.coverUrl} alt={s.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }} />
                      <span>{s.name}</span>
                    </button>
                  )
                ))}
              </div>
            ) : null}
          </div>
          <div className={styles.userMeta}>
            {authUser && (
              <div className="follow-notif-wrap">
                <button
                  type="button"
                  className="follow-notif-btn"
                  onClick={openFollowNotifications}
                  aria-label="Follow notifications"
                >
                  <Bell size={16} />
                  {followNotifUnreadCount > 0 ? (
                    <span className="follow-notif-badge">{followNotifUnreadCount > 99 ? '99+' : followNotifUnreadCount}</span>
                  ) : null}
                </button>
                {showFollowNotifications ? (
                  <div className="follow-notif-menu">
                    <h4>Followed Users</h4>
                    {followNotifications.length ? (
                      <ul>
                        {followNotifications.map((item) => (
                          <li key={item.id}>
                            <div className="follow-notif-row">
                              <img
                                src={item.actor_profile_pic || '/covers/tetris-nes.svg'}
                                alt={item.actor_username}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }}
                              />
                              <div>
                                <p>{item.message}</p>
                                <span>{formatNotificationTime(item.created_at)}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="follow-notif-empty">No new followed-user posts.</p>
                    )}
                  </div>
                ) : null}
              </div>
            )}
            {authUser && (
              <button
                type="button"
                onClick={() => setActiveTab('Cart')}
                aria-label="Open cart"
                title={`Cart (${cartItems.length} item${cartItems.length === 1 ? '' : 's'})`}
                style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background: activeTab === 'Cart' ? 'rgba(255,255,255,0.1)' : 'none',border:'none',cursor:'pointer',padding:'6px 8px',borderRadius:'6px',transition:'background 0.2s',color:'#e6eef8'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = activeTab === 'Cart' ? 'rgba(255,255,255,0.1)' : 'none'}
              >
                <ShoppingCart size={18} />
                {cartItems.length > 0 ? (
                  <span style={{position:'absolute',top:0,right:0,minWidth:18,height:18,padding:'0 5px',borderRadius:9,background:'#e25c5c',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.35)'}}>
                    {cartItems.length > 99 ? '99+' : cartItems.length}
                  </span>
                ) : null}
              </button>
            )}
            {authUser && (
              <button
                type="button"
                onClick={() => setActiveTab('Profile')}
                style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:'4px 8px',borderRadius:'6px',transition:'background 0.2s'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <img src={(authUser.profile_pic && String(authUser.profile_pic).length > 0) ? authUser.profile_pic : '/covers/tetris-nes.svg'} alt={authUser.username} style={{width:32,height:32,borderRadius:8,objectFit:'cover'}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }} />
                <span style={{color:'#e6eef8'}}>{authUser.username}</span>
              </button>
            )}
          </div>
        </header>

        {currentTab === 'Catalog' ? (
          <section className={styles.catalogPhotoLayout}>
            <aside className={mergeStyles(styles.panel, styles.card, styles.catalogFilterPanel)}>
              <h1>Catalog Filters</h1>

              <div className={styles.catalogFilterBlock}>
                <h3>Genre</h3>
                <select
                  className={styles.catalogSelect}
                  value={catalogGenre}
                  onChange={(event) => {
                    const nextGenre = event.target.value
                    setCatalogGenre(nextGenre)
                    if (nextGenre.startsWith('tag:')) {
                      setCatalogTag(nextGenre.slice(4))
                    } else {
                      setCatalogTag('')
                    }
                    setCatalogPage(1)
                  }}
                >
                  {catalogGenres.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.catalogFilterBlock}>
                <h3>Console</h3>
                <select
                  className={styles.catalogSelect}
                  value={catalogPlatform}
                  onChange={(event) => {
                    setCatalogPlatform(event.target.value)
                    setCatalogPage(1)
                  }}
                >
                  {catalogPlatforms.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.catalogFilterBlock}>
                <h3 className={styles.catalogFilterBlockH3}>Release Year</h3>
                <input
                  type="range"
                  min="1980"
                  max={new Date().getFullYear()}
                  value={releaseYear}
                  onChange={(event) => {
                    setReleaseYear(Number(event.target.value))
                    setCatalogPage(1)
                  }}
                />
                  <p className={styles.muted}>1980 - {releaseYear}</p>
              </div>

                <div className={styles.catalogFilterBlock}>
                  <h3 className={styles.catalogFilterBlockH3}>Critic Score Range</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criticMin}
                  onChange={(event) => {
                    setCriticMin(Number(event.target.value))
                    setCatalogPage(1)
                  }}
                />
                  <p className={styles.muted}>{criticMin} - 100</p>
              </div>

                <div className={styles.catalogFilterBlock}>
                  <h3 className={styles.catalogFilterBlockH3}>User Rating Range</h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={userMin}
                  onChange={(event) => {
                    setUserMin(Number(event.target.value))
                    setCatalogPage(1)
                  }}
                />
                  <p className={styles.muted}>{userMin.toFixed(1)} - 10</p>
              </div>

                <div className={styles.catalogFilterBlock}>
                  <h3 className={styles.catalogFilterBlockH3}>Multi-select Features</h3>
                  <div className={styles.featureGrid}>
                  {['Co-op', 'Single Player', 'Emulated', 'DLC'].map((feature) => (
                      <label key={feature} className={styles.featureOption}>
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className={mergeStyles(styles.tabChip, styles.resetFilterBtn, hoveredEmuGame === 'reset-filters' ? styles.tabChipHover : {})} onMouseEnter={() => setHoveredEmuGame('reset-filters')} onMouseLeave={() => setHoveredEmuGame(null)} onClick={resetCatalogFilters}>
                Reset Filters
              </button>
            </aside>

            <div className={styles.catalogMainPanel}>
                
              {!isLoadingCatalog && catalogError && <p className={styles.errorText}>{catalogError}</p>}

              {!isLoadingCatalog && !catalogError && (
                <>
                  <div className={mergeStyles(styles.catalogGrid, styles.catalogPhotoGrid)}>
                    {randomizedCatalogGames.map((game) => (
                      <article
                        className={mergeStyles(styles.catalogItem, styles.catalogPhotoItem, styles.catalogPhotoItemClickable, selectedCatalogGameSlug === (game.slug ?? String(game.id)) ? styles.catalogPhotoItemSelected : {})}
                        key={game.id}
                        onClick={() => attemptOpenCatalogDetails(game)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            attemptOpenCatalogDetails(game)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Open details for ${game.name}`}
                      >
                        <img src={game.coverUrl} alt={game.name} />
                        <div className={styles.catalogPhotoContent}>
                          <h3>{game.name}</h3>
                          <p className={styles.catalogMeta}>{game.platforms}</p>
                          <p className={styles.catalogMeta}>Critic Rating: {game.criticRating}</p>
                          <p className={styles.catalogRatingBadge}>{game.userRating}</p>
                          <ContentRatingBadge game={game} mode="catalog" style={{ marginBottom: 6 }} />
                          <button
                            type="button"
                            className={styles.catalogDetailsButton}
                            onClick={(event) => {
                              event.stopPropagation()
                              attemptOpenCatalogDetails(game)
                            }}
                          >
                            <span>View details</span>
                            <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {!catalogGames.length && <p className={styles.muted}>No games found for these filters.</p>}
                  <div className={styles.catalogPagination}>
                    <button
                      className={mergeStyles(styles.tabChip, hoveredEmuGame === 'prev-page' ? styles.tabChipHover : {})}
                      onMouseEnter={() => setHoveredEmuGame('prev-page')}
                      onMouseLeave={() => setHoveredEmuGame(null)}
                      onClick={() => setCatalogPage((page) => Math.max(1, page - 1))}
                      disabled={catalogPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {catalogPage}</span>
                    <button
                      className={mergeStyles(styles.tabChip, hoveredEmuGame === 'next-page' ? styles.tabChipHover : {})}
                      onMouseEnter={() => setHoveredEmuGame('next-page')}
                      onMouseLeave={() => setHoveredEmuGame(null)}
                      onClick={() => setCatalogPage((page) => page + 1)}
                      disabled={!hasNextCatalogPage}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        ) : currentTab === 'News' ? (
          <section className={styles.newsPage}>
            <div className={styles.newsPageHeader}>
              <h1>Latest News</h1>
              <p className={styles.muted}>Top headlines first, then browse more posts from the Reddit thread.</p>
            </div>

            <section className={mergeStyles(styles.card, styles.marginBottom10)}>
              <h2>
                <Trophy size={16} /> Top 3 Latest
              </h2>
              {isLoadingNewsPage && <p className={styles.muted}>Loading top headlines...</p>}
              {!isLoadingNewsPage && newsPageError && <p className={styles.errorText}>{newsPageError}</p>}
              {!isLoadingNewsPage && !newsPageError && (
                <div className={styles.newsFeaturedList}>
                  {featuredNewsItems.map((item) => (
                    <article className={styles.newsFeaturedItem} key={item.id}>
                      <div>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className={styles.newsLink}>
                            {item.title}
                          </a>
                        ) : (
                          <span className={styles.newsLink}>{item.title}</span>
                        )}
                        <p className={styles.igdbRating}>
                          {item.source} · {item.publishedAt}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.newsGrid}>
              <h2>
                <Newspaper size={16} /> More Headlines
              </h2>
              {isLoadingNewsPage && <p className={styles.muted}>Loading gaming news page...</p>}
              {!isLoadingNewsPage && newsPageError && <p className={styles.errorText}>{newsPageError}</p>}
              {!isLoadingNewsPage && !newsPageError && (
                pagedNewsItems.map((item) => (
                  <article key={item.id} className={mergeStyles(styles.newsCard, styles.card)}>
                    <div className={styles.newsCardImageWrap}>
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className={styles.newsCardImage}
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.newsCardContent}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.newsLink}>
                          {item.title}
                        </a>
                      ) : (
                        <span className={styles.newsLink}>{item.title}</span>
                      )}
                      <p className={mergeStyles(styles.muted, styles.newsSummary)}>{getShortDescription(item.description)}</p>
                      <p className={styles.igdbRating}>
                        {item.source} · {item.publishedAt}
                      </p>
                    </div>
                  </article>
                ))
              )}
              {!isLoadingNewsPage && !newsPageError && !remainingNewsItems.length && (
                <p className={styles.muted}>No news available right now.</p>
              )}
              {!isLoadingNewsPage && !newsPageError && remainingNewsItems.length > NEWS_ITEMS_PER_PAGE && (
                <div className={styles.catalogPagination}>
                  <button
                    className={mergeStyles(styles.tabChip, hoveredEmuGame === 'news-prev-page' ? styles.tabChipHover : {})}
                    onMouseEnter={() => setHoveredEmuGame('news-prev-page')}
                    onMouseLeave={() => setHoveredEmuGame(null)}
                    onClick={() => setNewsPage((page) => Math.max(1, page - 1))}
                    disabled={clampedNewsPage === 1}
                  >
                    Previous
                  </button>
                  <span>Page {clampedNewsPage} of {totalNewsPages}</span>
                  <button
                    className={mergeStyles(styles.tabChip, hoveredEmuGame === 'news-next-page' ? styles.tabChipHover : {})}
                    onMouseEnter={() => setHoveredEmuGame('news-next-page')}
                    onMouseLeave={() => setHoveredEmuGame(null)}
                    onClick={() => setNewsPage((page) => Math.min(totalNewsPages, page + 1))}
                    disabled={clampedNewsPage === totalNewsPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </section>
        ) : activeTab === 'Game Library' ? (
          <GameLibrary
            purchasedGames={purchasedGames}
            onNavigate={(tab) => setActiveTab(tab)}
            showPopupToast={showPopupToast}
          />
        ) : activeTab === 'Cart' ? (
          <section className={styles.block}>
            <header className={styles.gameDetailsHeader}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingCart size={28} color="#818cf8" /> Your Gaming Cart
                  </h1>
                  <p className={styles.muted} style={{ marginTop: 4 }}>
                    {cartItems.length === 0
                      ? 'Your cart is empty. Explore catalog deals and add your favorite titles.'
                      : `${cartItems.length} title${cartItems.length === 1 ? '' : 's'} ready for instant digital key checkout.`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      className="cart-action-btn danger"
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)' }}
                      onClick={() => {
                        setCartItems([])
                        showPopupToast('Cart cleared', 'info')
                      }}
                    >
                      <Trash2 size={15} /> Clear Cart
                    </button>
                  )}
                  <button
                    type="button"
                    className={mergeStyles(styles.tabChip, hoveredEmuGame === 'back-catalog-cart' ? styles.tabChipHover : {})}
                    onClick={() => setActiveTab('Catalog')}
                    onMouseEnter={() => setHoveredEmuGame('back-catalog-cart')}
                    onMouseLeave={() => setHoveredEmuGame(null)}
                  >
                    Back to Catalog
                  </button>
                </div>
              </div>
            </header>

            {cartItems.length === 0 ? (
              <div className="cart-empty-container">
                <div className="cart-empty-icon-wrap">
                  <ShoppingBag size={38} />
                </div>
                <h2 className="cart-empty-title">Your Cart is Empty</h2>
                <p className="cart-empty-text">
                  Looks like you haven't added any games yet. Browse our catalog for trending titles, emulation classics, and digital key deals!
                </p>
                <button
                  type="button"
                  className="cart-empty-cta"
                  onClick={() => setActiveTab('Catalog')}
                >
                  <Gamepad2 size={18} /> Explore Game Catalog
                </button>
              </div>
            ) : (
              <div className="cart-layout-container">
                {/* Left Column: Cart Items List */}
                <div className="cart-left-col">
                  <div className="cart-toolbar">
                    <span className="cart-count-chip">
                      <Package size={14} /> {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} Items Selected
                    </span>
                    <span className={styles.muted} style={{ fontSize: '0.85rem' }}>
                      Instant Digital Key Allocation
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {cartItems.map((item) => {
                      const numPrice = getItemNumericPrice(item)
                      const itemTotal = (numPrice * (item.quantity || 1)).toFixed(2)
                      return (
                        <article key={item.id} className="cart-item-card">
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="cart-item-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/covers/tetris-nes.svg'
                            }}
                          />
                          <div className="cart-item-details">
                            <div className="cart-item-header">
                              <h3 className="cart-item-title">{item.title}</h3>
                              <div className="cart-item-tags">
                                <span className="cart-tag cart-tag-key">
                                  <Key size={12} /> {item.platform || 'Steam Key'}
                                </span>
                                <span className="cart-tag">
                                  <Sparkles size={12} /> {item.edition || 'Standard Edition'}
                                </span>
                                <span className="cart-tag">Instant Delivery</span>
                              </div>
                            </div>

                            <div className="cart-item-controls">
                              {/* Quantity controls */}
                              <div className="cart-qty-control">
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() => handleUpdateItemQuantity(item.id, -1)}
                                  title="Decrease quantity"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="cart-qty-num">{item.quantity || 1}</span>
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() => handleUpdateItemQuantity(item.id, 1)}
                                  title="Increase quantity"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div className="cart-item-actions">
                                <button
                                  type="button"
                                  className="cart-action-btn"
                                  onClick={() => handleMoveToSavedForLater(item)}
                                >
                                  <Heart size={14} /> Save for Later
                                </button>
                                <button
                                  type="button"
                                  className="cart-action-btn danger"
                                  onClick={() => {
                                    setCartItems((prev) => prev.filter((c) => c.id !== item.id))
                                    showPopupToast(`Removed ${item.title} from cart`, 'info')
                                  }}
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="cart-item-price-column">
                            <div className="cart-item-price">
                              {numPrice === 0 ? 'FREE' : `$${itemTotal}`}
                            </div>
                            {(item.quantity || 1) > 1 && (
                              <div className={styles.muted} style={{ fontSize: '0.78rem' }}>
                                (${numPrice.toFixed(2)} each)
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {/* Saved for Later Section if any */}
                  {savedForLater.length > 0 && (
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Heart size={16} color="#ef4444" /> Saved for Later ({savedForLater.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {savedForLater.map((sItem) => (
                          <div key={sItem.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img src={sItem.coverUrl} alt={sItem.title} style={{ width: 44, height: 56, borderRadius: 6, objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.92rem' }}>{sItem.title}</div>
                                <div style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>{sItem.priceLabel ?? `$${getItemNumericPrice(sItem).toFixed(2)}`}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                className="cart-promo-btn"
                                onClick={() => handleMoveToCartFromSaved(sItem)}
                              >
                                Move to Cart
                              </button>
                              <button
                                type="button"
                                className="cart-action-btn danger"
                                onClick={() => {
                                  setSavedForLater((prev) => prev.filter((s) => s.id !== sItem.id))
                                  showPopupToast(`Removed ${sItem.title}`, 'info')
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Order Summary & Checkout Card */}
                <div className="cart-right-col">
                  <div className="cart-order-summary-card">
                    <h2 className="cart-summary-header">
                      <CreditCard size={20} color="#818cf8" /> Order Summary
                    </h2>

                    <div className="cart-summary-rows">
                      <div className="cart-summary-row">
                        <span>Items Subtotal ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)})</span>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>${cartSubtotal.toFixed(2)}</span>
                      </div>

                      {appliedPromo && (
                        <div className="cart-summary-row discount">
                          <span>Promo ({appliedPromo.code})</span>
                          <span>-${promoDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="cart-summary-row">
                        <span>Est. Digital Processing (5%)</span>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                          {estimatedTax > 0 ? `$${estimatedTax.toFixed(2)}` : 'FREE'}
                        </span>
                      </div>

                      <div className="cart-summary-total">
                        <span>Total Due</span>
                        <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Promo Code Section */}
                    <div style={{ marginTop: 4 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                        Have a Promo Code? (Try: <code style={{ color: '#818cf8' }}>GAMER20</code> or <code style={{ color: '#818cf8' }}>GAMEBOXD10</code>)
                      </label>
                      {appliedPromo ? (
                        <div className="cart-promo-tag">
                          <span>
                            <Tag size={14} style={{ display: 'inline', marginRight: 6 }} />
                            {appliedPromo.code} - {appliedPromo.description}
                          </span>
                          <button
                            type="button"
                            className="cart-promo-remove"
                            onClick={handleRemovePromoCode}
                            title="Remove promo code"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="cart-promo-box">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                            className="cart-promo-input"
                          />
                          <button type="button" className="cart-promo-btn" onClick={handleApplyPromoCode}>
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Primary Checkout Action */}
                    <button
                      type="button"
                      className="cart-checkout-btn-primary"
                      onClick={handleStartCheckout}
                    >
                      <ShieldCheck size={20} /> Proceed to Checkout <ArrowRight size={18} />
                    </button>

                    {/* Trust & Security Badges */}
                    <div className="cart-trust-badges">
                      <div className="cart-trust-item">
                        <Key size={16} className="cart-trust-icon" />
                        <span>Instant digital activation keys upon payment</span>
                      </div>
                      <div className="cart-trust-item">
                        <ShieldCheck size={16} className="cart-trust-icon" />
                        <span>100% genuine guaranteed publisher licenses</span>
                      </div>
                      <div className="cart-trust-item">
                        <Gift size={16} className="cart-trust-icon" />
                        <span>Auto-added to your GameBoxd Collection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Games Grid Section */}
            {catalogGames.length > 0 && (
              <section className="cart-rec-section">
                <div className="cart-rec-header">
                  <Sparkles size={20} color="#818cf8" /> Recommended Games You Might Enjoy
                </div>
                <div className="cart-rec-grid">
                  {catalogGames
                    .filter((g) => !cartItems.some((c) => c.id === g.id))
                    .slice(0, 4)
                    .map((recGame) => {
                      const priceVal = recGame.storePrice?.salePrice
                      const priceLabel =
                        priceVal === null || priceVal === undefined
                          ? '$19.99'
                          : priceVal === 0
                          ? 'Free'
                          : `$${Number(priceVal).toFixed(2)}`
                      return (
                        <div key={recGame.id} className="cart-rec-card">
                          <img
                            src={recGame.coverUrl}
                            alt={recGame.title}
                            className="cart-rec-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/covers/tetris-nes.svg'
                            }}
                          />
                          <div className="cart-rec-info">
                            <div className="cart-rec-title">{recGame.title}</div>
                            <div className="cart-rec-bottom">
                              <span className="cart-rec-price">{priceLabel}</span>
                              <button
                                type="button"
                                className="cart-rec-add-btn"
                                onClick={() => handleQuickAddGameToCart(recGame)}
                              >
                                + Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </section>
            )}
          </section>
        ) : activeTab === 'Game Details' ? (
          <section className={styles.gameDetailsPage}>
            <div className={styles.gameDetailsHeader}>
              <h1>Game Details</h1>
              <p className={styles.muted}>Overview, review signals, screenshots, and trailers for the game you selected.</p>
              <button className={mergeStyles(styles.tabChip, hoveredEmuGame === 'back-catalog' ? styles.tabChipHover : {})} onClick={() => setActiveTab('Catalog')} onMouseEnter={() => setHoveredEmuGame('back-catalog')} onMouseLeave={() => setHoveredEmuGame(null)}>
                Back to Catalog
              </button>
            </div>

            {isLoadingCatalogDetails && <p className={styles.muted}>Loading game details...</p>}
            {!isLoadingCatalogDetails && catalogDetailsError && <p className={styles.errorText}>{catalogDetailsError}</p>}

            {!isLoadingCatalogDetails && !catalogDetailsError && catalogGameDetails && (
              <>
                  <section className={mergeStyles(styles.card, styles.gameOverviewCard)}>
                    <img src={catalogGameDetails.coverUrl} alt={catalogGameDetails.title} className={styles.gameOverviewCover} />
                    <div className={styles.gameOverviewContent}>
                      <h2>{catalogGameDetails.title}</h2>
                      <p className={styles.catalogMeta}>
                        Released: {catalogGameDetails.released} · Community: {catalogGameDetails.rating}
                        {catalogGameDetails.metacritic !== null ? ` · Metacritic: ${catalogGameDetails.metacritic}` : ''}
                        &nbsp;&nbsp;
                        <ContentRatingBadge game={catalogGameDetails} mode="inline" />
                      </p>
                      <p className={styles.catalogMeta}>{catalogGameDetails.ratingsCount} total ratings</p>
                      <p className={styles.catalogMeta}>{catalogGameDetails.genres}</p>
                      <p className={styles.catalogMeta}>{catalogGameDetails.platforms}</p>
                      <p className={styles.muted}>{catalogGameDetails.overview}</p>
                      <ContentRatingBadge game={catalogGameDetails} mode="detail" />
                      <div style={{marginTop:10}}>
                        <div style={{display:'flex',alignItems:'center',gap:12}}>
                          <label style={{marginRight:8,display:'flex',alignItems:'center',gap:8}}>Rating:
                            <StarRating value={detailRating} onChange={setDetailRating} />
                          </label>
                        </div>
                        <label style={{display:'block',marginTop:12}}>Player Status:
                          <div style={{marginLeft:8, marginTop:6}}>
                            <div style={{display:'flex',gap:8}} role="group" aria-label="Player status">
                              <button
                                type="button"
                                className={`status-chip ${detailStatus === 'library' ? 'active' : ''}`}
                                onClick={() => setDetailStatus('library')}
                                aria-pressed={detailStatus === 'library'}
                              >
                                Library
                              </button>
                              <button
                                type="button"
                                className={`status-chip ${detailStatus === 'playing' ? 'active' : ''}`}
                                onClick={() => setDetailStatus('playing')}
                                aria-pressed={detailStatus === 'playing'}
                              >
                                Playing
                              </button>
                              <button
                                type="button"
                                className={`status-chip ${detailStatus === 'completed' ? 'active' : ''}`}
                                onClick={() => setDetailStatus('completed')}
                                aria-pressed={detailStatus === 'completed'}
                              >
                                Completed
                              </button>
                            </div>
                          </div>
                        </label>
                        <label style={{display:'block',marginTop:12}}>Review:
                          <textarea
                              ref={detailReviewRef}
                              className="detail-review"
                              rows={4}
                              value={detailReviewText}
                              onChange={(e)=>setDetailReviewText(e.target.value)}
                              placeholder="Write your thoughts about this game..."
                            />
                        </label>
                        <div style={{marginTop:10, maxWidth: 280}}>
                          <button
                            type="button"
                            className={styles.detailAddButton}
                            onClick={async ()=>{
                              if (!authUser?.token) {
                                showPopupToast('Please log in to add games to your collection.', 'error')
                                return
                              }
                              const rating = detailRating || null
                              const review = detailReviewText || null
                              try {
                                const res = await apiAddGame(authUser.token, { rawg_id: catalogGameDetails.id, status: detailStatus, rating, review })
                                if (res && res.id) {
                                  showPopupToast('Added to collection', 'success')
                                  setPendingAddGameSlug(null)
                                } else {
                                  showPopupToast(res?.detail || 'Could not add', 'error')
                                }
                              } catch (err) {
                                showPopupToast('Could not add game', 'error')
                              }
                            }}>
                            <span>Save to Collection</span>
                            <span aria-hidden="true">+</span>
                          </button>
                        </div>
                      </div>
                  </div>
                </section>

                  <section className={mergeStyles(styles.card, styles.gameReviewsCard)}>
                    <h2>Reviews Snapshot</h2>
                    <div className={styles.reviewScoreGrid}>
                      {catalogGameDetails.reviewScores.map((score) => (
                        <article key={score.id} className={styles.reviewScoreItem}>
                        <p className={styles.titleLg}>{score.label}</p>
                        <p className={styles.catalogMeta}>{score.percent.toFixed(1)}%</p>
                          <p className={styles.titleLg}>{score.label}</p>
                          <p className={styles.catalogMeta}>{score.percent.toFixed(1)}%</p>
                          <p className={styles.muted}>{score.count} votes</p>
                      </article>
                    ))}
                    {!catalogGameDetails.reviewScores.length && (
                      <p className={styles.muted}>No review breakdown available for this game.</p>
                    )}
                  </div>
                </section>

                <section className={mergeStyles(styles.card, styles.gameReviewsCard)}>
                  <h2>Recent Reviews</h2>
                  <div className={styles.reviewEntriesGrid}>
                    {catalogGameDetails.reviews.map((review) => (
                      <article key={review.id} className={styles.reviewEntryItem}>
                        <p className={styles.catalogMeta}>
                          {review.author}
                          {review.rating !== null ? ` · Rating: ${review.rating}/5` : ''}
                          {review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString()}` : ''}
                        </p>
                        <p className={styles.muted}>{review.body}</p>
                        <p className={styles.catalogMeta}>Likes: {review.likes} · Comments: {review.comments}</p>
                      </article>
                    ))}
                    {!catalogGameDetails.reviews.length && (
                      <p className={styles.muted}>No review entries available for this game yet.</p>
                    )}
                  </div>
                </section>

                <section className={mergeStyles(styles.card, styles.gameReviewsCard)}>
                  <h2>Community Reviews</h2>
                  {isLoadingGameReviews && <p className={styles.muted}>Loading reviews...</p>}
                  {!isLoadingGameReviews && gameReviews.length === 0 && (
                    <p className={styles.muted}>No community reviews yet. Be the first to add one!</p>
                  )}
                  {!isLoadingGameReviews && gameReviews.length > 0 && (
                    <div className={styles.reviewEntriesGrid}>
                      {gameReviews.map((rev, idx) => (
                        <article key={idx} className={styles.reviewEntryItem}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            {rev.profile_pic && (
                              <img
                                src={rev.profile_pic}
                                alt={rev.username}
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProfileUser(rev.username)
                                setActiveTab('Profile')
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e6eef8',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: 'inherit',
                              }}
                            >
                              {rev.username}
                            </button>
                          </div>
                          {rev.rating && <p className={styles.catalogMeta}>Rating: {rev.rating}/10</p>}
                          {rev.review && <p className={styles.muted}>{rev.review}</p>}
                          {rev.added_at && (
                            <p className={styles.catalogMeta}>{new Date(rev.added_at).toLocaleDateString()}</p>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className={mergeStyles(styles.card, styles.stack10)}>
                  <h2>Online Store</h2>
                  <div className={styles.storePurchase}>
                    {catalogGameDetails.storePrice?.salePrice !== null && catalogGameDetails.storePrice?.salePrice !== undefined ? (
                      <>
                        <p className={styles.storePrice}>
                          {catalogGameDetails.storePrice.salePrice === 0
                            ? 'Free'
                            : `$${catalogGameDetails.storePrice.salePrice.toFixed(2)}`}
                        </p>
                        {catalogGameDetails.storePrice.isOnSale && catalogGameDetails.storePrice.normalPrice !== null && (
                          <p className={styles.storePriceOriginal}>
                            ${catalogGameDetails.storePrice.normalPrice.toFixed(2)}
                          </p>
                        )}
                        <p className={styles.storePriceNote}>Steam price available to buy.</p>
                      </>
                    ) : (
                      <>
                        <p className={styles.storePrice}>Price unavailable</p>
                        <p className={styles.storePriceNote}>No Steam listing was found for this game.</p>
                      </>
                    )}
                    {authUser?.token ? (
                      <div className={styles.storeActions}>
                        <button
                          type="button"
                          className={styles.storeCartButton}
                          onClick={() => {
                            const gameId = catalogGameDetails.id
                            if (cartItems.some((c) => c.id === gameId)) {
                              showPopupToast('Already in your cart', 'success')
                              return
                            }
                            const priceValue = catalogGameDetails.storePrice?.salePrice
                            const priceLabel =
                              priceValue === null || priceValue === undefined
                                ? null
                                : priceValue === 0
                                ? 'Free'
                                : `$${Number(priceValue).toFixed(2)}`
                            setCartItems((prev) => [
                              ...prev,
                              {
                                id: catalogGameDetails.id,
                                title: catalogGameDetails.title,
                                coverUrl: catalogGameDetails.coverUrl,
                                priceLabel,
                              },
                            ])
                            setActiveTab('Cart')
                            showPopupToast(`Added ${catalogGameDetails.title} to cart`, 'success')
                          }}
                        >
                          {cartItems.some((c) => c.id === catalogGameDetails.id) ? 'In cart' : 'Add to cart'}
                        </button>
                        <button
                          type="button"
                          className={styles.storeBuyButton}
                          onClick={() => {
                            const gameId = catalogGameDetails.id
                            if (!cartItems.some((c) => c.id === gameId)) {
                              const priceValue = catalogGameDetails.storePrice?.salePrice
                              const priceLabel =
                                priceValue === null || priceValue === undefined
                                  ? null
                                  : priceValue === 0
                                  ? 'Free'
                                  : `$${Number(priceValue).toFixed(2)}`
                              const numericPrice = typeof priceValue === 'number' ? priceValue : 19.99
                              setCartItems((prev) => [
                                ...prev,
                                {
                                  id: catalogGameDetails.id,
                                  title: catalogGameDetails.title,
                                  coverUrl: catalogGameDetails.coverUrl,
                                  priceLabel,
                                  price: numericPrice,
                                  quantity: 1,
                                  platform: catalogGameDetails.platforms?.split(',')[0]?.trim() || 'Steam Key',
                                  edition: 'Standard Edition',
                                },
                              ])
                              showPopupToast(`Added ${catalogGameDetails.title} to cart`, 'success')
                            }
                            setActiveTab('Cart')
                          }}
                        >
                          Buy now
                        </button>
                      </div>
                    ) : (
                      <p className={styles.storePriceNote}>Please log in to add to cart</p>
                    )}
                  </div>
                </section>

                <section className={mergeStyles(styles.card, styles.gameScreenshotsCard)}>
                  <h2>Screenshots</h2>
                  <div className={styles.gameScreenshotsGrid}>
                    {catalogGameDetails.screenshots.map((shot, index) => (
                      <button
                        key={shot.id}
                        type="button"
                        className={mergeStyles(styles.screenshotButton, hoveredScreenshot === shot.id ? styles.screenshotButtonHover : {})}
                        onMouseEnter={() => setHoveredScreenshot(shot.id)}
                        onMouseLeave={() => setHoveredScreenshot(null)}
                        onClick={() => setExpandedImageIndex(index)}
                        aria-label="Enlarge screenshot"
                      >
                        <img src={shot.image} alt={`${catalogGameDetails.title} screenshot`} className={styles.gameScreenshot} />
                      </button>
                    ))}
                    {!catalogGameDetails.screenshots.length && (
                      <p className={styles.muted}>No screenshots available for this game.</p>
                    )}
                  </div>
                </section>

                <section className={mergeStyles(styles.card, styles.gameScreenshotsCard)}>
                  <h2>Video Trailer</h2>
                  <div className={styles.gameTrailersGrid}>
                    {catalogGameDetails.youtubeEmbeds.length > 0 ? (
                      catalogGameDetails.youtubeEmbeds.map((video) => (
                        <article key={video.id} className={styles.trailerItem}>
                          {video.isNative ? (
                            // Direct video file from RAWG
                            <video
                              controls
                              className={styles.trailerVideo}
                              controlsList="nodownload"
                              loading="lazy"
                            >
                              <source src={video.embedUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            // YouTube embed
                            <iframe
                              src={video.embedUrl}
                              title={video.title}
                              className={styles.trailerVideo}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          )}
                          <p className={styles.muted}>{video.title}</p>
                        </article>
                      ))
                    ) : (
                      <p className={styles.muted}>No trailers or gameplay videos available for this game right now.</p>
                    )}
                  </div>
                </section>

                <section className={mergeStyles(styles.card, styles.recommendedGamesCard)}>
                  <h2>
                    <Flame size={16} /> Recommended Games
                  </h2>
                  <div className={styles.recommendedGamesGrid}>
                    {catalogGameDetails.recommendedGames?.length > 0 ? (
                      catalogGameDetails.recommendedGames.map((game) => (
                        <button
                          key={game.id}
                          type="button"
                          className={mergeStyles(styles.recommendedGameTile, hoveredRecommendedTile === game.id ? styles.recommendedGameTileHover : {})}
                          onMouseEnter={() => setHoveredRecommendedTile(game.id)}
                          onMouseLeave={() => setHoveredRecommendedTile(null)}
                          onClick={() => attemptOpenCatalogDetails(game)}
                          title={`View ${game.title}`}
                        >
                          <div className={styles.recommendedGameCover}>
                            <img src={game.coverUrl} alt={game.title} className={mergeStyles(styles.recommendedGameCoverImg, hoveredRecommendedTile === game.id ? styles.recommendedGameTileHoverImg : {})} />
                          </div>
                          <div className={styles.recommendedGameInfo}>
                            <p className={styles.recommendedGameTitle}>{game.title}</p>
                            <p className={styles.recommendedGameMeta}>
                              {game.releaseYear} · {game.rating} ⭐
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className={styles.muted}>No related games found for recommendation.</p>
                    )}
                  </div>
                </section>
              </>
            )}
          </section>
        ) : currentTab === 'Emulation' ? (
          <section className={styles.emulationPage}>
            <div className={styles.emulationHeader}>
              <h1>Emulation Station</h1>
              <p className={styles.muted}>Play Game Boy, Game Boy Advance, and NES classics directly from your dashboard.</p>
            </div>

            <section className={mergeStyles(styles.card, styles.emulationPlayerCard)}>
              <h2>
                <Bot size={16} /> {activeEmulationGame.title} ({activeEmulationGame.system})
              </h2>
              <p className={styles.muted}>Now playing: {activeEmulationGame.title} ({activeEmulationGame.year})</p>
              <div className={styles.emulationEmbedWrap}>
                <iframe
                  src={activeEmulationGame.embedUrl}
                  title={`${activeEmulationGame.title} Emulator`}
                  loading="lazy"
                  className={styles.emulationIframe}
                  allow="autoplay; fullscreen"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className={styles.muted}>
                If the game does not load in-app due to site restrictions,{' '}
                <a
                  href={activeEmulationGame.playUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.newsLink}
                >
                  open it in a new tab
                </a>
                .
              </p>
            </section>

            <section className={mergeStyles(styles.card, styles.emulationControlsCard)}>
              <h2>
                <Gamepad2 size={16} /> Controls Guide
              </h2>
              <p className={styles.muted}>These default controls apply both in Loader and when opening the emulator in a new tab.</p>
              <div className={styles.emulationControlsGrid}>
                <div>
                  <p className={styles.emulationControlsTitle}>{activeEmulationGame.system} Default Controls</p>
                  <ul className={styles.emulationControlsList}>
                    {getEmulationControlsBySystem(activeEmulationGame.system).map((control) => (
                      <li key={`${activeEmulationGame.system}-${control.action}`}>
                        <strong>{control.action}:</strong> {control.key}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={styles.emulationControlsTitle}>Quick Tips</p>
                  <ul className={styles.emulationControlsList}>
                    <li>Use Save State and Load State buttons to persist progress per ROM.</li>
                    <li>Use Fullscreen for a larger play area.</li>
                    <li>If keys do not respond, click the game canvas once to focus it.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className={styles.emulationPlatformGroup}>
              <h2 className={styles.emulationPlatformTitle}>Choose a Game</h2>
              <div className={styles.emulationGrid}>
                {(() => {
                  const uploadedFilenames = new Set((uploadedRoms || []).map((r) => String(r.filename || r.title || '').toLowerCase()))
                  const getRomFilenameFromPlayUrl = (playUrl) => {
                    try {
                      const url = new URL(playUrl, window.location.origin)
                      const rom = url.searchParams.get('rom')
                      return rom ? decodeURIComponent(rom).toLowerCase() : ''
                    } catch (e) {
                      const m = /[?&]rom=([^&]+)/.exec(playUrl)
                      return m ? decodeURIComponent(m[1]).toLowerCase() : ''
                    }
                  }

                  const filteredBuiltins = (emulationGames || []).filter((g) => {
                    const fname = getRomFilenameFromPlayUrl(g.playUrl)
                    return !uploadedFilenames.has(fname)
                  })

                  const display = [...(uploadedRoms || []), ...filteredBuiltins]
                  // Deduplicate by rom filename + system (keep first occurrence: uploaded entries come first)
                  const seenKeys = new Set()
                  const dedupedDisplay = []
                  const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
                  for (const g of display) {
                    const fname = getRomFilenameFromPlayUrl(g.playUrl) || String(g.filename || '').toLowerCase()
                    const key = `${fname}::${normalize(g.system)}`
                    if (!seenKeys.has(key)) {
                      seenKeys.add(key)
                      dedupedDisplay.push(g)
                    }
                  }
                  // If an emulation filter is set, only show games for that system
                  const filteredByPlatform = emulationFilter
                    ? dedupedDisplay.filter((g) => normalize(g.system) === normalize(emulationFilter))
                    : dedupedDisplay
                  return filteredByPlatform.map((game) => (
                    <article key={game.id} className={mergeStyles(styles.card, styles.emulationItem)}>
                      <img
                        src={game.imageUrl}
                        alt={`${game.title} cover`}
                        className={styles.emulationCover}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = EMULATION_FALLBACK_COVER
                        }}
                      />
                      <div className={styles.emulationContent}>
                        <h2>{game.title}</h2>
                        <p className={styles.catalogMeta}>
                          {game.system} {game.year ? `• ${game.year}` : ''}
                        </p>
                        <p className={styles.muted}>{getShortDescription(game.description || '')}</p>
                        <div className={styles.emulationActions}>
                          <button
                            type="button"
                            className={mergeStyles(
                              styles.tabChip,
                              hoveredEmuGame === `play-${game.id}` ? styles.tabChipHover : {}
                            )}
                            onMouseEnter={() => setHoveredEmuGame(`play-${game.id}`)}
                            onMouseLeave={() => setHoveredEmuGame(null)}
                            onClick={() => setSelectedEmulationGame(game)}
                          >
                            Play in Loader
                          </button>
                          <a
                            href={game.playUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={mergeStyles(styles.tabChip, styles.emulationPlayBtn)}
                          >
                            Open Emulator Page
                          </a>
                        </div>
                      </div>
                    </article>
                  ))
                })()}
              </div>
            </section>

          </section>
        ) : currentTab === 'Profile' ? (
            <section className={styles.block}>
            <Profile
              username={selectedProfileUser || authUser?.username}
              token={authUser?.token}
              isOwner={selectedProfileUser ? false : !!authUser}
              onAuthExpired={clearExpiredSession}
              onBackToOwnProfile={selectedProfileUser ? () => setSelectedProfileUser(null) : undefined}
            />
          </section>
        ) : currentTab === 'Following Feed' ? (
          <section className={styles.block}>
            <div className="following-feed-header">
              <h1>Following Feed</h1>
              <p className={styles.muted}>Latest posts from users you follow, sorted newest first.</p>
            </div>
            {isLoadingFollowingFeed && <p className={styles.muted}>Loading following feed...</p>}
            {!isLoadingFollowingFeed && followingFeedError && <p className={styles.errorText}>{followingFeedError}</p>}
            {!isLoadingFollowingFeed && !followingFeedError && followingFeed.length === 0 ? (
              <div className="following-feed-empty">
                <h2>No followed posts yet</h2>
                <p className={styles.muted}>Follow users to see their latest posts appear here.</p>
              </div>
            ) : null}
            {!isLoadingFollowingFeed && !followingFeedError && followingFeed.length > 0 ? (
              <div className="following-feed-timeline">
                {followingFeed.map((item) => (
                  <article key={`${item.author_username}-${item.post_id}`} className="following-feed-item">
                    <div className="following-feed-dot" aria-hidden="true"></div>
                    <div className="following-feed-card">
                      <header className="following-feed-header-row">
                        <img
                          src={item.author_profile_pic || '/covers/tetris-nes.svg'}
                          alt={item.author_username}
                          className="following-feed-avatar"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }}
                        />
                        <div>
                          <strong>{item.author_username}</strong>
                          <p className={styles.muted}>
                            {formatFeedTime(item.added_at)} · {String(item.status || 'library').replace('_', ' ')}
                          </p>
                        </div>
                      </header>
                      <div className="following-feed-content">
                        <img
                          src={item.cover_url || '/covers/tetris-nes.svg'}
                          alt={item.title || 'Post cover'}
                          className="following-feed-cover"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }}
                        />
                        <div className="following-feed-body">
                          <h3>{item.title || 'Untitled post'}</h3>
                          {item.review ? (
                            <p>{item.review}</p>
                          ) : (
                            <p className={styles.muted}>No review text was added for this post.</p>
                          )}
                          {item.rating ? <span className="following-feed-rating">★ {item.rating}/10</span> : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : currentTab === 'My Collection' ? (
          <section className={styles.block}>
            <Collection token={authUser?.token} />
          </section>
        ) : (
          <>
            <section className={styles.block}>
              <h1>My Collection & Activity</h1>
              <div className={styles.collectionGrid}>
                {collectionCards.map((card) => (
                  <article
                    className={styles.card}
                    key={card.title}
                    onClick={() => setActiveTab('My Collection')}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onKeyPress={(e) => { if (e.key === 'Enter') setActiveTab('My Collection') }}
                  >
                    <h2>{card.title}</h2>
                    <div className={styles.cardMain}>
                      <img src={card.cover} alt={card.subtitle} />
                      <div>
                        <p className={styles.titleLg}>{card.subtitle}</p>
                        <p className={styles.muted}>{card.status}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.block}>
              <h1>Game Discovery & Recommendations</h1>
              <div className={styles.discoveryGrid}>
                <article className={styles.card}>
                  <h2>
                    <Trophy size={16} />
                    Recent Gaming Headlines
                  </h2>
                  {isLoadingGames && <p className={styles.muted}>Loading recent headlines...</p>}
                  {!isLoadingGames && gamesError && <p className={styles.errorText}>{gamesError}</p>}
                  {!isLoadingGames && !gamesError && (
                    <div className={styles.igdbGrid}>
                      {topGames.map((game) => (
                        <article className={styles.igdbItem} key={game.id}>
                          <img src={game.coverUrl} alt={game.name} />
                          {game.url ? (
                            <a href={game.url} target="_blank" rel="noreferrer" className={styles.newsLink}>
                              {game.name}
                            </a>
                          ) : (
                            <span className={styles.newsLink}>{game.name}</span>
                          )}
                          <p className={styles.igdbRating}>
                            {game.source} · {game.publishedAt}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </article>

                <article className={styles.card}>
                  <h2>
                    <Bot size={16} />
                    Integrated Emulation Station
                  </h2>
                  <div className={styles.emuGrid}>
                    {homeRandomEmulationPlatforms.map((platform, index) => (
                      <button
                        key={platform.id}
                        className={mergeStyles(styles.emuGame, hoveredEmuGame === `emu-${platform.id}` ? styles.emuGameHover : {})}
                        onMouseEnter={() => setHoveredEmuGame(`emu-${platform.id}`)}
                        onMouseLeave={() => setHoveredEmuGame(null)}
                        onClick={() => {
                          // set a filter so Emulation page shows only this platform's games
                          setSelectedEmulationGame(platform.games[0])
                          setEmulationFilter(platform.system || platform.id)
                          setActiveTab('Emulation')
                        }}
                      >
                        {index === 0 ? <Tv size={18} /> : <Monitor size={18} />}
                        <span>
                          {platform.label}
                          <small>{platform.games.length} games available</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </>
        )}
      </section>

      <aside className={mergeStyles(styles.panel, styles.rightRail, currentTab === 'Catalog' ? styles.hiddenPanel : {})}>
        <div className={styles.authStack}>
          {authUser ? (
            <button
              className={mergeStyles(styles.authStackBtn, hoveredAuthBtn === 'logout' ? styles.authStackBtnHover : {})}
              onMouseEnter={() => setHoveredAuthBtn('logout')}
              onMouseLeave={() => setHoveredAuthBtn(null)}
              onClick={() => { try { localStorage.removeItem('gb_user') } catch(e){} setAuthUser(null) }}
            >
              <User size={16} /> Logout
            </button>
          ) : (
            <button
              className={mergeStyles(styles.authStackBtn, hoveredAuthBtn === 'login' ? styles.authStackBtnHover : {})}
              onMouseEnter={() => setHoveredAuthBtn('login')}
              onMouseLeave={() => setHoveredAuthBtn(null)}
              onClick={() => setShowAuthModal(true)}
            >
              <User size={16} /> Log In
            </button>
          )}
        </div>

        {/* Follower Social Activity Feed removed per user request */}

        <section className={styles.sideCard}>
          <h2>
            <Newspaper size={16} /> Gaming News
          </h2>
          <ul className={styles.sideCardUl}>
            {isLoadingNews && <li className={styles.sideCardLi}>Loading gaming news...</li>}
            {!isLoadingNews && newsError && <li className={styles.sideCardLi}>{newsError}</li>}
            {!isLoadingNews && !newsError &&
              newsFeed.map((item) => (
                <li className={styles.sideCardLi} key={item.id}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className={mergeStyles(styles.sideNewsLink, hoveredEmuGame === `news-${item.id}` ? styles.sideNewsLinkHover : {})} onMouseEnter={() => setHoveredEmuGame(`news-${item.id}`)} onMouseLeave={() => setHoveredEmuGame(null)}>
                      {item.title}
                    </a>
                  ) : (
                    <span className={styles.sideNewsLink}>{item.title}</span>
                  )}
                </li>
              ))}
          </ul>
        </section>
      </aside>

      {matureAgeGate.open && (
        <div
          className="mature-gate-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mature content age gate"
          onClick={() => setMatureAgeGate({ open: false, game: null })}
        >
          <div className="mature-gate-modal" onClick={(event) => event.stopPropagation()}>
            <div className="mature-gate-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>Age verification required</h2>
            <p>
              {(matureAgeGate.game?.name || matureAgeGate.game?.title || 'This game')} is rated Mature 17+ / Adults Only 18+.
              Please confirm your date of birth to continue.
            </p>
            <label className="mature-gate-label" htmlFor="mature-birthdate">Date of birth</label>
            <input
              id="mature-birthdate"
              type="date"
              className="mature-gate-input"
              value={matureBirthDate}
              onChange={(event) => {
                setMatureBirthDate(event.target.value)
                setMatureAgeError('')
              }}
              max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().slice(0, 10)}
            />
            {matureAgeError && <div className="mature-gate-error">{matureAgeError}</div>}
            <div className="mature-gate-actions">
              <button type="button" className="mature-gate-confirm" onClick={submitMatureVerification}>
                Unlock game
              </button>
              <button
                type="button"
                className="mature-gate-cancel"
                onClick={() => setMatureAgeGate({ open: false, game: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {expandedShot && (
        <div
          className={styles.imageLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded screenshot"
          onClick={() => setExpandedImageIndex(null)}
        >
          <button
            type="button"
            className={mergeStyles(styles.imageLightboxNav, styles.imageLightboxNavLeft, styles.tabChip)}
            onClick={(event) => {
              event.stopPropagation()
              moveExpandedImage(-1)
            }}
            aria-label="Previous screenshot"
          >
            Previous
          </button>

          <p className={mergeStyles(styles.imageLightboxCounter, styles.muted)} onClick={(event) => event.stopPropagation()}>
            {expandedImageIndex + 1} / {screenshotCount}
          </p>

          <button
            type="button"
            className={mergeStyles(styles.imageLightboxClose, styles.tabChip)}
            onClick={() => setExpandedImageIndex(null)}
            aria-label="Close image preview"
          >
            Close
          </button>

          <button
            type="button"
            className={mergeStyles(styles.imageLightboxNav, styles.imageLightboxNavRight, styles.tabChip)}
            onClick={(event) => {
              event.stopPropagation()
              moveExpandedImage(1)
            }}
            aria-label="Next screenshot"
          >
            Next
          </button>

          <img
            src={expandedShot.image}
            alt={`${catalogGameDetails.title} screenshot`}
            className={styles.imageLightboxMedia}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {checkoutModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => checkoutStep !== 'processing' && setCheckoutModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="checkout-modal-close"
              onClick={() => checkoutStep !== 'processing' && setCheckoutModalOpen(false)}
            >
              <X size={18} />
            </button>

            {checkoutStep === 'review' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={24} color="#818cf8" /> Secure Digital Checkout
                </h2>
                <p className={styles.muted} style={{ fontSize: '0.88rem', marginBottom: 20 }}>
                  Confirm payment method to complete purchase and receive digital activation keys.
                </p>

                <div style={{ background: 'rgba(15,23,42,0.6)', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: '#94a3b8' }}>
                    <span>Total Items ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)}):</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 600 }}>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: '#34d399' }}>
                      <span>Discount ({appliedPromo.code}):</span>
                      <span>-${promoDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>Final Amount:</span>
                    <span style={{ color: '#818cf8' }}>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                  Select Payment Method:
                </label>
                <div className="checkout-payment-options">
                  {/* Option 1: Card */}
                  <div
                    className={`checkout-payment-option ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('card')}
                  >
                    <CreditCard size={20} color="#818cf8" />
                    <div style={{ flex: 1 }}>
                      <div>Credit / Debit Card</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>Visa, MasterCard, Amex</div>
                    </div>
                    {cardAuth.authenticated ? (
                      <span className="checkout-auth-badge verified">
                        <Check size={12} /> Authenticated
                      </span>
                    ) : (
                      <span className="checkout-auth-badge unverified">
                        <Lock size={12} /> Auth Required
                      </span>
                    )}
                  </div>

                  {selectedPaymentMethod === 'card' && (
                    <div className="checkout-auth-panel">
                      {cardAuth.authenticated ? (
                        <div className="checkout-auth-verified-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="checkout-auth-verified-icon">
                              <Check size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                                Card Authenticated & Verified (3D Secure)
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {cardAuth.brand} ending in {(cardAuth.cardNumber || '').replace(/\D/g, '').slice(-4) || '4242'} · Exp: {cardAuth.expiry || '08/29'}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="checkout-auth-btn-ghost"
                            onClick={() => setCardAuth((prev) => ({ ...prev, authenticated: false }))}
                          >
                            Edit Card
                          </button>
                        </div>
                      ) : (
                        <div className="checkout-auth-form">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Lock size={13} /> Card Authentication Details
                            </span>
                            <button
                              type="button"
                              className="checkout-auth-quick-btn"
                              onClick={handleFillTestCard}
                            >
                              Use Demo Card
                            </button>
                          </div>

                          <div className="checkout-form-group">
                            <label>Cardholder Name</label>
                            <input
                              type="text"
                              placeholder="e.g. ALEX MERCER"
                              value={cardAuth.cardholder}
                              onChange={(e) => setCardAuth((prev) => ({ ...prev, cardholder: e.target.value, error: '' }))}
                              className="checkout-field-input"
                            />
                          </div>

                          <div className="checkout-form-group">
                            <label>Card Number</label>
                            <div className="checkout-input-with-badge">
                              <input
                                type="text"
                                placeholder="4242 8812 3491 5520"
                                value={cardAuth.cardNumber}
                                onChange={(e) => handleCardNumberInput(e.target.value)}
                                className="checkout-field-input"
                                maxLength={19}
                              />
                              <span className="checkout-card-brand-pill">{cardAuth.brand}</span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div className="checkout-form-group">
                              <label>Expiry Date</label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardAuth.expiry}
                                onChange={(e) => handleExpiryInput(e.target.value)}
                                className="checkout-field-input"
                                maxLength={5}
                              />
                            </div>
                            <div className="checkout-form-group">
                              <label>CVC / CVV</label>
                              <input
                                type="password"
                                placeholder="•••"
                                value={cardAuth.cvv}
                                onChange={(e) => handleCvvInput(e.target.value)}
                                className="checkout-field-input"
                                maxLength={4}
                              />
                            </div>
                          </div>

                          {cardAuth.error && (
                            <div className="checkout-auth-error-msg">
                              <AlertCircle size={14} /> {cardAuth.error}
                            </div>
                          )}

                          <button
                            type="button"
                            className="checkout-auth-action-btn"
                            onClick={handleStartCard3ds}
                          >
                            <ShieldCheck size={16} /> Authenticate Card (3D Secure)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option 2: PayPal */}
                  <div
                    className={`checkout-payment-option ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                  >
                    <ShoppingBag size={20} color="#38bdf8" />
                    <div style={{ flex: 1 }}>
                      <div>PayPal Instant</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>One-click PayPal checkout</div>
                    </div>
                    {paypalAuth.authenticated ? (
                      <span className="checkout-auth-badge verified">
                        <Check size={12} /> Authenticated
                      </span>
                    ) : (
                      <span className="checkout-auth-badge unverified">
                        <Lock size={12} /> Auth Required
                      </span>
                    )}
                  </div>

                  {selectedPaymentMethod === 'paypal' && (
                    <div className="checkout-auth-panel">
                      {paypalAuth.authenticated ? (
                        <div className="checkout-auth-verified-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="checkout-auth-verified-icon">
                              <Check size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                                PayPal Account Authorized
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                                {paypalAuth.email}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="checkout-auth-btn-ghost"
                            onClick={() => setPaypalAuth((prev) => ({ ...prev, authenticated: false }))}
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <div className="checkout-auth-paypal-box">
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
                            Connect and authenticate your PayPal account to authorize secure checkout.
                          </p>
                          <button
                            type="button"
                            className="checkout-paypal-connect-btn"
                            onClick={handleOpenPaypalModal}
                          >
                            <span style={{ fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                              <span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#0079C1' }}>Pal</span>
                            </span>
                            <span style={{ marginLeft: 8, fontWeight: 600 }}>Authenticate & Connect</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option 3: Wallet */}
                  <div
                    className={`checkout-payment-option ${selectedPaymentMethod === 'wallet' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('wallet')}
                  >
                    <Sparkles size={20} color="#34d399" />
                    <div style={{ flex: 1 }}>
                      <div>GameBoxd Wallet Balance</div>
                      <div style={{ fontSize: '0.78rem', color: walletBalance >= cartTotal ? '#34d399' : '#f87171', fontWeight: 500 }}>
                        Balance: ${walletBalance.toFixed(2)} Available {walletBalance < cartTotal && `(Short $${(cartTotal - walletBalance).toFixed(2)})`}
                      </div>
                    </div>
                    {walletAuth.authenticated ? (
                      <span className="checkout-auth-badge verified">
                        <Check size={12} /> Authorized
                      </span>
                    ) : walletBalance < cartTotal ? (
                      <span className="checkout-auth-badge insufficient">
                        Insufficient
                      </span>
                    ) : (
                      <span className="checkout-auth-badge unverified">
                        <Lock size={12} /> PIN Required
                      </span>
                    )}
                  </div>

                  {selectedPaymentMethod === 'wallet' && (
                    <div className="checkout-auth-panel">
                      {!authUser?.username ? (
                        <div className="checkout-auth-alert-card">
                          <AlertCircle size={18} color="#f59e0b" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fef3c7' }}>Sign In Required</div>
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>You must be logged into your GameBoxd account to authenticate wallet funds.</div>
                          </div>
                          <button
                            type="button"
                            className="checkout-auth-quick-btn"
                            onClick={() => setShowAuthModal(true)}
                          >
                            Sign In
                          </button>
                        </div>
                      ) : walletBalance < cartTotal ? (
                        <div className="checkout-auth-alert-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                          <AlertCircle size={18} color="#ef4444" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fca5a5' }}>Insufficient Wallet Funds</div>
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                              Current balance: ${walletBalance.toFixed(2)} · Required: ${cartTotal.toFixed(2)}.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="checkout-auth-quick-btn"
                            onClick={() => {
                              const nextBal = walletBalance + 50.00
                              setWalletBalance(nextBal)
                              try { localStorage.setItem('gb_wallet_balance', nextBal.toFixed(2)) } catch (e) {}
                              showPopupToast('Added $50.00 to GameBoxd Wallet!', 'success')
                            }}
                          >
                            + Top Up $50
                          </button>
                        </div>
                      ) : walletAuth.authenticated ? (
                        <div className="checkout-auth-verified-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="checkout-auth-verified-icon">
                              <Check size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                                Wallet PIN Verified & Authorized
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#34d399' }}>
                                ${cartTotal.toFixed(2)} will be debited · Remaining balance: ${(walletBalance - cartTotal).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="checkout-auth-btn-ghost"
                            onClick={() => setWalletAuth({ authenticated: false, pin: '', error: '' })}
                          >
                            Lock
                          </button>
                        </div>
                      ) : (
                        <div className="checkout-auth-form">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Lock size={13} /> Wallet Security Verification
                            </span>
                            <button
                              type="button"
                              className="checkout-auth-quick-btn"
                              onClick={() => handleVerifyWalletPin('1234')}
                            >
                              Auto-fill PIN (1234)
                            </button>
                          </div>

                          <div className="checkout-form-group">
                            <label>Enter 4-Digit Wallet Security PIN</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                type="password"
                                placeholder="••••"
                                value={walletAuth.pin}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/\D/g, '').slice(0, 4)
                                  setWalletAuth((prev) => ({ ...prev, pin: clean, error: '' }))
                                  if (clean.length === 4) {
                                    handleVerifyWalletPin(clean)
                                  }
                                }}
                                className="checkout-field-input"
                                maxLength={4}
                                style={{ letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center', maxWidth: 120 }}
                              />
                              <button
                                type="button"
                                className="checkout-auth-action-btn"
                                style={{ margin: 0, flex: 1 }}
                                onClick={() => handleVerifyWalletPin()}
                              >
                                <ShieldCheck size={16} /> Authenticate PIN
                              </button>
                            </div>
                          </div>

                          {walletAuth.error && (
                            <div className="checkout-auth-error-msg">
                              <AlertCircle size={14} /> {walletAuth.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginTop: 16, marginBottom: 6 }}>
                  Digital Delivery Email:
                </label>
                <input
                  type="email"
                  defaultValue={authUser?.username ? `${authUser.username}@gameboxd.com` : 'gamer@gameboxd.com'}
                  className="cart-promo-input"
                  style={{ width: '100%', marginBottom: 20 }}
                />

                <button
                  type="button"
                  className="cart-checkout-btn-primary"
                  onClick={handleConfirmPurchase}
                >
                  {selectedPaymentMethod === 'card' && !cardAuth.authenticated
                    ? 'Authenticate Card to Pay'
                    : selectedPaymentMethod === 'paypal' && !paypalAuth.authenticated
                    ? 'Authenticate PayPal to Pay'
                    : selectedPaymentMethod === 'wallet' && !walletAuth.authenticated
                    ? 'Authenticate Wallet to Pay'
                    : `Pay $${cartTotal.toFixed(2)} & Get Keys`}
                </button>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div style={{ display: 'inline-block', width: 50, height: 50, border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                  Authorizing Purchase...
                </h3>
                <p className={styles.muted}>
                  Allocating digital keys from publisher servers & generating license receipt.
                </p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <CheckCircle2 size={54} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                    Order Confirmed!
                  </h2>
                  <p className={styles.muted} style={{ fontSize: '0.88rem' }}>
                    Receipt #{purchasedKeys[0]?.orderId || 'GBX-894721'} · {purchasedKeys[0]?.paymentMethod ? `Paid via ${purchasedKeys[0].paymentMethod}` : 'Digital Keys ready for activation below.'}
                  </p>
                  {purchasedKeys[0]?.paymentMethod?.includes('Wallet') && (
                    <div style={{ display: 'inline-block', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', color: '#34d399', fontWeight: 600, marginTop: 8 }}>
                      Remaining Wallet Balance: ${walletBalance.toFixed(2)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {purchasedKeys.map((itemKey) => (
                    <div key={itemKey.id} className="checkout-key-card">
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                        {itemKey.title} ({itemKey.platform})
                      </div>
                      <div className="checkout-key-text">
                        <span>{itemKey.key}</span>
                        <button
                          type="button"
                          className="cart-promo-btn"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            navigator.clipboard?.writeText(itemKey.key)
                            showPopupToast(`Key for ${itemKey.title} copied!`, 'success')
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="cart-checkout-btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setCheckoutModalOpen(false)
                      setActiveTab('Game Library')
                    }}
                  >
                    View in Game Library
                  </button>
                  <button
                    type="button"
                    className="cart-promo-btn"
                    style={{ padding: '12px 18px' }}
                    onClick={() => setCheckoutModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {cardAuth.is3dsOpen && (
              <div className="checkout-modal-suboverlay" onClick={() => setCardAuth((prev) => ({ ...prev, is3dsOpen: false }))}>
                <div className="checkout-submodal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="checkout-submodal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldCheck size={22} color="#818cf8" />
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                        {cardAuth.brand} 3-D Secure 2.0 Check
                      </span>
                    </div>
                    <button
                      type="button"
                      className="checkout-modal-close-sub"
                      onClick={() => setCardAuth((prev) => ({ ...prev, is3dsOpen: false }))}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: 14, lineHeight: 1.5 }}>
                      Your issuing bank requires identity authentication for this digital checkout of <strong style={{ color: '#818cf8' }}>${cartTotal.toFixed(2)}</strong>. A one-time verification passcode was generated.
                    </p>

                    <div style={{ background: 'rgba(15,23,42,0.8)', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                        <span>Merchant:</span>
                        <span style={{ color: '#f8fafc', fontWeight: 600 }}>GameBoxd Digital Distribution</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                        <span>Card:</span>
                        <span style={{ color: '#f8fafc', fontWeight: 600 }}>•••• {(cardAuth.cardNumber || '').replace(/\D/g, '').slice(-4) || '4242'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span>Total Charge:</span>
                        <span style={{ color: '#818cf8', fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="checkout-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', margin: 0 }}>
                          Enter 6-Digit SMS / Passcode
                        </label>
                        <button
                          type="button"
                          className="checkout-auth-quick-link"
                          onClick={() => handleVerifyCardOtp('748291')}
                        >
                          Auto-fill Test Code (748291)
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="748291"
                        value={cardAuth.otpInput}
                        onChange={(e) => setCardAuth((prev) => ({ ...prev, otpInput: e.target.value.replace(/\D/g, '').slice(0, 6), error: '' }))}
                        className="checkout-field-input"
                        maxLength={6}
                        style={{ fontSize: '1.2rem', letterSpacing: '0.25em', textAlign: 'center' }}
                      />
                    </div>

                    {cardAuth.error && (
                      <div className="checkout-auth-error-msg" style={{ marginBottom: 12 }}>
                        <AlertCircle size={14} /> {cardAuth.error}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                      <button
                        type="button"
                        className="cart-checkout-btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleVerifyCardOtp()}
                      >
                        Confirm Verification
                      </button>
                      <button
                        type="button"
                        className="cart-promo-btn"
                        onClick={() => setCardAuth((prev) => ({ ...prev, is3dsOpen: false }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paypalAuth.isModalOpen && (
              <div className="checkout-modal-suboverlay" onClick={() => !paypalAuth.authorizing && setPaypalAuth((prev) => ({ ...prev, isModalOpen: false }))}>
                <div className="checkout-submodal-card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ background: '#003087', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '-0.5px' }}>
                      Pay<span style={{ color: '#0079c1' }}>Pal</span>
                    </div>
                    <button
                      type="button"
                      className="checkout-modal-close-sub"
                      style={{ color: '#fff' }}
                      onClick={() => !paypalAuth.authorizing && setPaypalAuth((prev) => ({ ...prev, isModalOpen: false }))}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                      Authenticate PayPal Wallet
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 16 }}>
                      Authorize 1-click digital purchases for GameBoxd with your PayPal account.
                    </p>

                    <div className="checkout-form-group">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>PayPal Email Address</label>
                      <input
                        type="email"
                        value={paypalAuth.paypalEmailInput}
                        onChange={(e) => setPaypalAuth((prev) => ({ ...prev, paypalEmailInput: e.target.value, error: '' }))}
                        className="checkout-field-input"
                        placeholder="gamer@paypal.com"
                      />
                    </div>

                    <div className="checkout-form-group">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>Password</label>
                      <input
                        type="password"
                        value={paypalAuth.paypalPasswordInput}
                        onChange={(e) => setPaypalAuth((prev) => ({ ...prev, paypalPasswordInput: e.target.value }))}
                        className="checkout-field-input"
                        placeholder="••••••••"
                      />
                    </div>

                    {paypalAuth.error && (
                      <div className="checkout-auth-error-msg" style={{ marginBottom: 12 }}>
                        <AlertCircle size={14} /> {paypalAuth.error}
                      </div>
                    )}

                    <button
                      type="button"
                      className="checkout-paypal-action-btn"
                      disabled={paypalAuth.authorizing}
                      onClick={handleAuthorizePaypal}
                    >
                      {paypalAuth.authorizing ? (
                        <span>Authenticating with PayPal...</span>
                      ) : (
                        <span>Log In & Authorize Payment</span>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <button
                        type="button"
                        className="checkout-auth-quick-link"
                        onClick={() => setPaypalAuth((prev) => ({ ...prev, isModalOpen: false }))}
                      >
                        Cancel and return
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthPage 
          onLogin={({ username, token }) => {
            try { localStorage.setItem('gb_user', JSON.stringify({ username, token })) } catch(e){}
            setAuthUser({ username, token })
            setShowAuthModal(false)
          }} 
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showAdmin && (
        <Admin
          onClose={() => setShowAdmin(false)}
          initialToken={authUser?.token}
          initialUser={authUser}
        />
      )}
    </main>
  )
}

export default App

