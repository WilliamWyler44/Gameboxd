import React from 'react'
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react'
import { resolveContentRating } from '../services/contentRatings'
import '../styles/ContentRatingBadge.css'

/**
 * ContentRatingBadge Component
 * Displays ESRB / Content Ratings for games in multiple modes:
 * - 'detail' (Full ESRB rating block with descriptors and explanation for Game Details page)
 * - 'inline' (Compact pill badge for metadata header)
 * - 'catalog' (Micro badge for catalog cards)
 */
export default function ContentRatingBadge({ game, mode = 'detail', className = '' }) {
  let rating
  try {
    rating = resolveContentRating(game)
  } catch (e) {
    // Safety net — if rating resolution fails, show nothing rather than crash the app
    return null
  }
  if (!rating) return null

  if (mode === 'catalog') {
    return (
      <span
        className={`cr-catalog-badge ${className}`}
        style={{
          color: rating.color,
          background: rating.bgColor,
          borderColor: rating.borderColor,
        }}
        title={`${rating.label} (${rating.age}) - ${rating.description}`}
      >
        <span style={{ fontWeight: 800 }}>{rating.code}</span>
        <span>{rating.shortLabel}</span>
      </span>
    )
  }

  if (mode === 'inline') {
    return (
      <span
        className={`cr-inline-badge ${className}`}
        style={{
          color: rating.color,
          background: rating.bgColor,
          border: `1px solid ${rating.borderColor}`,
        }}
        title={`${rating.label} - ${rating.age}: ${rating.description}`}
      >
        <span className="cr-badge-code" style={{ borderColor: rating.color }}>
          {rating.code}
        </span>
        <span className="cr-badge-text">{rating.label}</span>
      </span>
    )
  }

  // Full 'detail' ESRB rating box
  const isCodeLong = rating.code.length > 2

  return (
    <div className={`cr-detail-container ${className}`}>
      <div className="cr-detail-header">
        <div className="cr-section-title">
          <ShieldCheck size={16} color={rating.color} />
          <span>Age & Content Rating</span>
        </div>
        <span
          className="cr-age-chip"
          style={{
            color: rating.color,
            background: rating.bgColor,
            border: `1px solid ${rating.borderColor}`,
          }}
        >
          {rating.age}
        </span>
      </div>

      <div className="cr-detail-body">
        {/* Iconic ESRB Rating Block */}
        <div className="cr-esrb-block" title={`ESRB Rating: ${rating.label}`}>
          <div className="cr-esrb-top">ESRB</div>
          <div className="cr-esrb-symbol-wrap">
            <span className={`cr-esrb-symbol ${isCodeLong ? 'cr-esrb-symbol-small' : ''}`}>
              {rating.code}
            </span>
          </div>
          <div className="cr-esrb-bottom">{rating.shortLabel}</div>
        </div>

        {/* Rating description & content descriptors */}
        <div className="cr-detail-info">
          <div className="cr-rating-title-row">
            <span className="cr-rating-label" style={{ color: rating.color }}>
              {rating.label}
            </span>
          </div>

          <p className="cr-rating-desc">{rating.description}</p>

          {rating.descriptors && rating.descriptors.length > 0 && (
            <div className="cr-descriptors-wrap">
              {rating.descriptors.map((desc, idx) => (
                <span key={idx} className="cr-descriptor-pill">
                  {desc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
