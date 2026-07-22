const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exam`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Takes a File object from the image picker,
 * converts it to base64, sends it to the Edge Function,
 * and returns the exam JSON from Claude.
 */
export async function generateExam(imageFile) {
  // 1. Convert image file to base64 string
  const base64 = await fileToBase64(imageFile)

  // 2. POST to Supabase Edge Function
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      image: base64,
      mediaType: imageFile.type, // e.g. "image/jpeg", "image/png"
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge Function error: ${error}`)
  }

  const exam = await response.json()
  return exam
}

/**
 * Converts a File to a base64 data string (without the data:image/...;base64, prefix).
 * Claude API expects raw base64, not the full data URL.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // result is "data:image/jpeg;base64,/9j/4AAQ..."
      // We strip the prefix, Claude just wants the raw base64 part
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
