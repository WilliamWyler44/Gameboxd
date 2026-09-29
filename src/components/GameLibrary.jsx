import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Gamepad2,
  Key,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
} from 'lucide-react'
import './GameLibrary.css'

export default function GameLibrary({ purchasedGames = [], onNavigate, showPopupToast }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [copiedKeyId, setCopiedKeyId] = useState(null)

  const platformsList = useMemo(() => {
    const set = new Set()
    purchasedGames.forEach((g) => {
      if (g.platform) set.add(g.platform)
    })
    return Array.from(set)
  }, [purchasedGames])

  const filteredGames = useMemo(() => {
    return purchasedGames.filter((game) => {
      const matchesSearch =
        !searchQuery ||
        game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlatform =
        platformFilter === 'all' ||
        game.platform?.toLowerCase() === platformFilter.toLowerCase()
      return matchesSearch && matchesPlatform
    })
  }, [purchasedGames, searchQuery, platformFilter])

  const totalSpent = useMemo(() => {
    return purchasedGames.reduce((acc, game) => {
      const price = typeof game.price === 'number' ? game.price : 19.99
      return acc + price
    }, 0)
  }, [purchasedGames])

  const handleCopyKey = (key, title, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key)
    }
    setCopiedKeyId(id)
    if (showPopupToast) {
      showPopupToast(`Activation key for ${title} copied to clipboard!`, 'success')
    }
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  return (
    <div className="game-library-page">
      <header className="game-library-hero">
        <div className="game-library-hero-main">
          <div className="game-library-title-row">
            <div className="game-library-icon-badge">
              <Gamepad2 size={28} />
            </div>
            <div>
              <h2>Purchased Game Library</h2>
              <p className="game-library-subtitle">
                Access your owned digital games, view activation keys, and track your purchase receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="game-library-stats">
          <div className="library-stat-card">
            <span className="stat-label">Owned Games</span>
            <strong className="stat-value">{purchasedGames.length}</strong>
          </div>
          <div className="library-stat-card highlight">
            <span className="stat-label">Total Spent</span>
            <strong className="stat-value">${totalSpent.toFixed(2)}</strong>
          </div>
          <div className="library-stat-card">
            <span className="stat-label">Active Licenses</span>
            <strong className="stat-value">{purchasedGames.length}</strong>
          </div>
        </div>
      </header>

      {/* Controls & Search Toolbar */}
      <div className="game-library-toolbar">
        <div className="library-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search owned games by title or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="library-search-input"
          />
        </div>

        <div className="library-filter-chips">
          <button
            type="button"
            className={`library-chip ${platformFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPlatformFilter('all')}
          >
            All Platforms ({purchasedGames.length})
          </button>
          {platformsList.map((p) => {
            const count = purchasedGames.filter(
              (g) => g.platform?.toLowerCase() === p.toLowerCase()
            ).length
            return (
              <button
                key={p}
                type="button"
                className={`library-chip ${
                  platformFilter.toLowerCase() === p.toLowerCase() ? 'active' : ''
                }`}
                onClick={() => setPlatformFilter(p)}
              >
                {p} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Purchased Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="library-empty-box">
          <div className="empty-icon-ring">
            <ShoppingBag size={36} />
          </div>
          <h3>{purchasedGames.length === 0 ? 'No Purchased Games Yet' : 'No Matching Games Found'}</h3>
          <p>
            {purchasedGames.length === 0
              ? 'Games you buy from the Store Catalog or Cart will automatically appear here with their digital activation keys.'
              : `No games match "${searchQuery}". Try clearing your search or filter.`}
          </p>
          {onNavigate && (
            <button
              type="button"
              className="library-explore-btn"
              onClick={() => onNavigate('Catalog')}
            >
              <Sparkles size={16} /> Browse Game Catalog
            </button>
          )}
        </div>
      ) : (
        <div className="game-library-grid">
          {filteredGames.map((game) => {
            const isCopied = copiedKeyId === game.id
            const price = typeof game.price === 'number' ? game.price : 19.99
            return (
              <article key={game.id} className="purchased-game-card">
                <div className="card-cover-container">
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="card-cover-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/covers/tetris-nes.svg'
                    }}
                  />
                  <span className="card-platform-badge">
                    <Key size={12} /> {game.platform || 'Steam Key'}
                  </span>
                </div>

                <div className="card-details">
                  <div className="card-header">
                    <h3 className="card-title">{game.title}</h3>
                    <div className="card-meta-row">
                      <span className="meta-price">
                        {price === 0 ? 'FREE' : `$${price.toFixed(2)}`}
                      </span>
                      <span className="meta-dot">·</span>
                      <span className="meta-date">Purchased {game.purchaseDate || 'Aug 2026'}</span>
                    </div>
                  </div>

                  <div className="card-key-section">
                    <label className="key-label">
                      <ShieldCheck size={13} /> Digital License Key:
                    </label>
                    <div className="key-display-box">
                      <code className="key-code">{game.key || 'GBXD-894A-721F-L099'}</code>
                      <button
                        type="button"
                        className={`key-copy-btn ${isCopied ? 'copied' : ''}`}
                        onClick={() => handleCopyKey(game.key || 'GBXD-894A-721F-L099', game.title, game.id)}
                        title="Copy activation key"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="receipt-tag">
                      <Tag size={12} /> Order #{game.orderId || 'GBX-894721'}
                    </span>
                    {onNavigate && (
                      <button
                        type="button"
                        className="card-action-link"
                        onClick={() => onNavigate('Catalog')}
                      >
                        View Details <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

