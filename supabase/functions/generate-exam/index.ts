import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `You are an exam generator for kids aged 6 to 12 years old.

The user will send you an image of something they want to learn from — a textbook page, handwritten notes, a worksheet, a diagram, anything educational.

Your job is to:
1. Analyze the image and identify the topic and key concepts
2. Generate a short quiz (5 questions) appropriate for a child aged 6-12
3. Choose the best question format based on the content:
   - Multiple choice (MCQ) for facts, definitions, math
   - True/False for concepts and statements
   - Fill in the blank for vocabulary or simple recall
4. Make the language simple, fun, and encouraging

You MUST respond with ONLY a valid JSON object — no markdown, no backticks, no preamble.

The JSON must follow this exact structure:
{
  "topic": "Short topic name (e.g. Addition, Animals, The Solar System)",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "The question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "A short, kid-friendly explanation of why this is correct."
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "The statement here.",
      "correct_answer": "True",
      "explanation": "A short, kid-friendly explanation."
    },
    {
      "id": 3,
      "type": "fill_blank",
      "question": "The ___ is the closest planet to the Sun.",
      "correct_answer": "Mercury",
      "explanation": "A short, kid-friendly explanation."
    }
  ]
}

For MCQ questions, always include 4 options. For true_false, correct_answer is either "True" or "False". For fill_blank, correct_answer is the missing word or phrase. Mix the formats naturally based on the content.`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    const { image, mediaType } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Call Claude API with the image
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: 'Generate a quiz from this image for a kid aged 6-12. Return only the JSON.',
              },
            ],
          },
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text()
      console.error('Claude API error:', err)
      return new Response(
        JSON.stringify({ error: 'Claude API failed', detail: err }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const claudeData = await claudeResponse.json()

    // Extract the text content from Claude's response
    const rawText = claudeData.content?.[0]?.text || ''

    // Parse the JSON Claude returned
    let exam
    try {
      exam = JSON.parse(rawText)
    } catch {
      console.error('Failed to parse Claude JSON:', rawText)
      return new Response(
        JSON.stringify({ error: 'Claude returned invalid JSON', raw: rawText }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(exam),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
