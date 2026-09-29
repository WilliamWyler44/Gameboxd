import { useState } from 'react'
import './StarRating.css'

export default function StarRating({ value = 0, onChange, size = 28, readOnly = false }) {
  const [hovered, setHovered] = useState(0)
  const stars = Array.from({ length: 10 }, (_, index) => index + 1)

  const handleClick = (v) => {
    if (readOnly) return
    onChange?.(v)
  }

  return (
    <div className="star-rating" role="radiogroup" aria-label="Rating">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className={"star" + ((hovered || value) >= s ? ' filled' : '') + (readOnly ? ' readonly' : '')}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => handleClick(s)}
          aria-checked={value === s}
          aria-label={`${s} star${s === 1 ? '' : 's'}`}
          style={{ fontSize: size }}
        >
          ★
        </button>
      ))}
    </div>
  )
}
