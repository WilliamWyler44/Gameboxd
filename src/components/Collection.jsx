import { useEffect, useMemo, useState } from 'react'
import StarRating from './StarRating'
import { listGames, updateGame, deleteGame } from '../services/backendApi'
import './Collection.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All games' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'library', label: 'Still in my Library' },
]

const STATUS_LABELS = {
  playing: 'Playing',
  completed: 'Completed',
  library: 'Still in my Library',
  wishlist: 'Still in my Library',
  finished: 'Completed',
}

const STATUS_TONES = {
  playing: 'is-playing',
  completed: 'is-completed',
  library: 'is-library',
  wishlist: 'is-library',
  finished: 'is-completed',
}

const normalizeStatus = (value) => {
  const normalized = String(value || 'library').trim().toLowerCase().replace(/\s+/g, '_')
  if (normalized === 'finished') return 'completed'
  if (normalized === 'wishlist') return 'library'
  if (normalized === 'still_in_my_library') return 'library'
  if (normalized === 'playing' || normalized === 'completed' || normalized === 'library') return normalized
  return 'library'
}

const normalizeGame = (game) => ({ ...game, status: normalizeStatus(game.status) })

const getStatusLabel = (value) => STATUS_LABELS[normalizeStatus(value)] || 'Still in my Library'

const statusCounts = (games) =>
  games.reduce(
    (accumulator, game) => {
      const key = normalizeStatus(game.status)
      accumulator[key] = (accumulator[key] || 0) + 1
      accumulator.total += 1
      return accumulator
    },
    { total: 0, playing: 0, completed: 0, library: 0 },
  )

export default function Collection({ token }) {
  const [games, setGames] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('library')
  const [editRating, setEditRating] = useState(0)
  const [editReview, setEditReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refreshGames = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await listGames(token)
      setGames((res || []).map(normalizeGame))
    } catch {
      setError('Could not load your collection right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshGames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const stats = useMemo(() => statusCounts(games), [games])

  const visibleGames = useMemo(() => {
    if (activeFilter === 'all') return games
    return games.filter((game) => normalizeStatus(game.status) === activeFilter)
  }, [games, activeFilter])

  const handleDelete = async (id) => {
    if (!token) return
    await deleteGame(token, id)
    setGames((previous) => previous.filter((game) => game.id !== id))
    if (editingId === id) {
      setEditingId(null)
    }
  }

  const startEdit = (game) => {
    setEditingId(game.id)
    setEditStatus(normalizeStatus(game.status))
    setEditRating(game.rating || 0)
    setEditReview(game.review || '')
    setNotice('')
    setError('')
  }

  const saveEdit = async (game) => {
    if (!token) return
    setError('')
    setNotice('')
    try {
      const payload = {
        rawg_id: game.rawg_id,
        status: normalizeStatus(editStatus),
        review: editReview,
        rating: editRating || null,
      }
      const updated = await updateGame(token, game.id, payload)
      setGames((previous) => previous.map((item) => (item.id === game.id ? normalizeGame(updated) : item)))
      setEditingId(null)
      setNotice('Collection entry updated.')
    } catch {
      setError('Could not update this game right now.')
    }
  }

  if (!token) return <div className="collection-empty-state">Please log in to manage your collection.</div>

  return (
    <section className="collection-page">
      <header className="collection-hero">
        <div>
          <p className="collection-kicker">Your Game Library</p>
          <h2>My Collection</h2>
          <p className="collection-subtitle">
            Track what you are playing, what you finished, and what is still in your library.
          </p>
        </div>
        <div className="collection-summary-grid">
          <article className="collection-summary-card">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article className="collection-summary-card is-playing">
            <span>Playing</span>
            <strong>{stats.playing}</strong>
          </article>
          <article className="collection-summary-card is-completed">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </article>
          <article className="collection-summary-card is-library">
            <span>Library</span>
            <strong>{stats.library}</strong>
          </article>
        </div>
      </header>

      <section className="collection-panel">
        <div className="collection-toolbar">
          <div>
            <h3>Browse</h3>
            <p className="collection-toolbar-subtitle">Filter the games by played state.</p>
          </div>
          <div className="collection-filters">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`collection-filter-chip ${activeFilter === option.value ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="collection-message">Loading your collection...</p>}
        {!loading && !visibleGames.length && <p className="collection-message">No games match this filter yet.</p>}

        <div className="collection-grid">
          {visibleGames.map((game) => {
            const statusKey = normalizeStatus(game.status)
            const isEditing = editingId === game.id
            return (
              <article key={game.id} className={`collection-card ${STATUS_TONES[statusKey] || 'is-library'}`}>
                <div className="collection-card-cover-wrap">
                  <img src={game.cover_url} alt={game.title || 'Game cover'} className="collection-card-cover" />
                  <span className={`collection-status-pill ${STATUS_TONES[statusKey] || 'is-library'}`}>
                    {getStatusLabel(statusKey)}
                  </span>
                </div>

                <div className="collection-card-body">
                  <div className="collection-card-title-row">
                    <h4>{game.title || 'Untitled Game'}</h4>
                    {typeof game.rating === 'number' && game.rating > 0 ? (
                      <div className="collection-star-row">
                        <StarRating value={game.rating} readOnly />
                      </div>
                    ) : null}
                  </div>

                  {game.review ? <p className="collection-card-review">“{game.review}”</p> : <p className="collection-card-review is-muted">No review added yet.</p>}

                  <div className="collection-card-actions">
                    <button type="button" onClick={() => handleDelete(game.id)}>
                      Remove
                    </button>
                    <button type="button" onClick={() => startEdit(game)}>
                      Edit
                    </button>
                  </div>

                  {isEditing && (
                    <div className="collection-edit-panel">
                      <label className="collection-field">
                        <span>Is this game being played?</span>
                        <select value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
                          <option value="playing">Playing</option>
                          <option value="completed">Completed</option>
                          <option value="library">Still in my Library</option>
                        </select>
                      </label>

                      <label className="collection-field">
                        <span>Rating</span>
                        <StarRating value={editRating} onChange={setEditRating} />
                      </label>

                      <label className="collection-field collection-wide-field">
                        <span>Review</span>
                        <textarea rows="3" value={editReview} onChange={(event) => setEditReview(event.target.value)} />
                      </label>

                      <div className="collection-edit-actions">
                        <button type="button" className="collection-primary-btn" onClick={() => saveEdit(game)}>
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}
