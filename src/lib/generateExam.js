const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exam`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Takes a File, converts it directly to base64 (no compression),
 * sends it to the Edge Function, returns exam JSON.
 */
export async function generateExam(imageFile) {
  console.log('📁 File selected:', imageFile.name, imageFile.type, Math.round(imageFile.size / 1024) + 'KB')

  const base64 = await fileToBase64(imageFile)
  console.log('📦 Base64 length:', base64.length)

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      image: base64,
      mediaType: imageFile.type || 'image/jpeg',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge Function error: ${error}`)
  }

  return response.json()
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
