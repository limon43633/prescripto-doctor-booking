import { useState } from 'react'

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false)
  const sizeClasses = size === 'sm' ? 'w-9 h-9 text-[12px]' : 'w-10 h-10 text-[13px]'

  const initials =
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-[#F2F4F7] text-[#344054] font-medium flex items-center justify-center shrink-0 select-none ${className}`}
        aria-label={name}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClasses} rounded-full object-cover shrink-0 select-none ${className}`}
    />
  )
}

export default Avatar
