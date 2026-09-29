import React, { useEffect, useState } from 'react'
import StarRating from './StarRating'
import { fetchRawgGameDetails } from '../services/rawgGameDetails'
import { addGame as apiAddGame } from '../services/backendApi'
import './AddModal.css'

export default function AddModal({ open, onClose, identifier, token, onAdded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [details, setDetails] = useState(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [status, setStatus] = useState('library')

  useEffect(() => {
    if (!open || !identifier) return
    let mounted = true
    setLoading(true)
    setError('')
    setDetails(null)
    ;(async () => {
      try {
        const d = await fetchRawgGameDetails(identifier)
        if (!mounted) return
        setDetails(d)
      } catch (err) {
        if (!mounted) return
        setError('Could not load game details from RAWG')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [open, identifier])

  if (!open) return null

  const handleAdd = async () => {
    if (!token) {
      setError('You must be logged in to add games.')
      return
    }
    try {
      const res = await apiAddGame(token, { rawg_id: details.id, status: status || 'library', rating: rating || null, review: review || null })
      if (res && res.id) {
        if (onAdded) onAdded(res)
        onClose()
      } else {
        setError(res?.detail || 'Could not add game')
      }
    } catch (err) {
      setError(err?.detail || err?.message || 'Could not add game')
    }
  }

  return (
    <div className="gb-modal-overlay" role="dialog" aria-modal="true">
      <div className="gb-modal">
        <div className="gb-modal-header">
          <h3>{details ? details.title : 'Add Game'}</h3>
          <button className="gb-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="gb-modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {details && (
            <div className="gb-modal-grid">
              <img src={details.coverUrl} alt={details.title} className="gb-modal-cover" />
              <div>
                <p className="muted">Released: {details.released} · Community: {details.rating}</p>
                <div style={{marginTop:8}}>
                  <label style={{display:'flex',alignItems:'center',gap:8}}>Rating: <StarRating value={rating} onChange={setRating} /></label>
                </div>
                <div style={{marginTop:8}}>
                  <label style={{display:'flex',alignItems:'center',gap:8}}>Player Status:
                    <div style={{display:'inline-flex', marginLeft:8, gap:8}} role="group" aria-label="Player status">
                      <button
                        type="button"
                        className={`status-chip ${status === 'library' ? 'active' : ''}`}
                        onClick={() => setStatus('library')}
                        aria-pressed={status === 'library'}
                      >
                        Library
                      </button>
                      <button
                        type="button"
                        className={`status-chip ${status === 'playing' ? 'active' : ''}`}
                        onClick={() => setStatus('playing')}
                        aria-pressed={status === 'playing'}
                      >
                        Playing
                      </button>
                      <button
                        type="button"
                        className={`status-chip ${status === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatus('completed')}
                        aria-pressed={status === 'completed'}
                      >
                        Completed
                      </button>
                    </div>
                  </label>
                </div>
                <div style={{marginTop:8}}>
                  <textarea className="detail-review" rows={4} value={review} onChange={(e)=>setReview(e.target.value)} placeholder="Write a short review (optional)" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="gb-modal-footer">
          <button className="tabChip" onClick={onClose}>Cancel</button>
          <button className="tabChip" onClick={handleAdd}>Add to Collection</button>
        </div>
      </div>
    </div>
  )
}
