export const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement | null
  if (!image) return

  const originalSrc = image.dataset.originalSrc || image.currentSrc || image.src
  image.dataset.originalSrc = originalSrc

  const retries = Number(image.dataset.retryCount ?? '0')
  if (retries < 1) {
    image.dataset.retryCount = String(retries + 1)
    const separator = originalSrc.includes('?') ? '&' : '?'
    image.src = `${originalSrc}${separator}retry=${Date.now()}`
    return
  }

  image.src = '/image-fallback.svg'
}
