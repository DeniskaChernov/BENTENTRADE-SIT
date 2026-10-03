import React, { useState, memo } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Placeholder для отсутствующих изображений (будет добавлено позже)
const PLACEHOLDER_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0icmdiYSgyNDUsIDI0MywgMjQwLCAwLjA1KSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjQ1LCAyNDMsIDI0MCwgMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+0JjQt9C+0LHRgNCw0LbQtdC90LjQtSDQsdGD0LTQtdGCINC00L7QsdCw0LLQu9C10L3QviDQv9C+0LbQttC1PC90ZXh0Pjwvc3ZnPg=='

export const ImageWithFallback = memo(function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const {
    src,
    alt,
    style,
    className,
    loading = 'lazy',
    decoding = 'async',
    fetchPriority = 'low',
    ...rest
  } = props

  // Если src пустая строка или undefined, показываем placeholder
  if (!src || src.trim() === '') {
    return (
      <div
        className={`inline-block bg-muted/20 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={PLACEHOLDER_IMG_SRC} alt="Изображение будет добавлено позже" loading="lazy" decoding="async" {...rest} />
        </div>
      </div>
    )
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" loading="lazy" decoding="async" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      {...rest} 
      onError={handleError} 
    />
  )
})