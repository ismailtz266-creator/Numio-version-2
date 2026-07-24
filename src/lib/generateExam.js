const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exam`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Max dimensions before sending to Claude.
// 1200px keeps all text readable while cutting token cost significantly.
const MAX_PX = 1200
const JPEG_QUALITY = 0.85 // 85% quality — visually identical, much smaller

/**
 * Main function:
 * 1. Compress the image (resize + re-encode as JPEG)
 * 2. Convert to base64
 * 3. POST to Supabase Edge Function
 * 4. Return the exam JSON from Claude
 */
export async function generateExam(imageFile) {
  const { base64, mediaType } = await compressImage(imageFile)

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ image: base64, mediaType }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge Function error: ${error}`)
  }

  return response.json()
}

/**
 * Compresses an image File:
 * - Draws it onto a canvas scaled to MAX_PX on the longest side
 * - Re-encodes as JPEG at JPEG_QUALITY
 * - Returns { base64, mediaType }
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Calculate new dimensions keeping aspect ratio
      let { width, height } = img
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_PX)
          width = MAX_PX
        } else {
          width = Math.round((width / height) * MAX_PX)
          height = MAX_PX
        }
      }

      // Draw onto canvas at new size
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Export as JPEG base64 (strips the data:image/jpeg;base64, prefix)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const base64  = dataUrl.split(',')[1]

      resolve({ base64, mediaType: 'image/jpeg' })
    }

    img.onerror = reject
    img.src = objectUrl
  })
}
