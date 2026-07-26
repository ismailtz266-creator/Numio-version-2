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
1. Analyze the image and identify the ACTUAL educational content (facts, concepts, math problems, vocabulary, etc.)
2. Generate exactly 15 questions that test understanding of that content
3. Choose the best question format based on the content:
   - Multiple choice (MCQ) for facts, definitions, math
   - True/False for concepts and statements
   - Fill in the blank for vocabulary or simple recall
4. Make the language simple, fun, and encouraging

CRITICAL RULES — you MUST follow these:
- ONLY ask questions about the actual knowledge/content in the image (math concepts, facts, vocabulary, science, history, etc.)
- NEVER ask about the title, page number, header, footer, image layout, or any meta information about the document itself
- NEVER ask "What is the title of...?" or "What is the name of the worksheet?" or anything about the document structure
- Every question must help the child LEARN and UNDERSTAND the subject matter
- If the image shows addition tables, ask about addition. If it shows history facts, ask about those facts. Focus on what the student needs to KNOW.
- Mix question types naturally (aim for roughly 7 MCQ, 4 true/false, 4 fill in the blank)

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

For MCQ questions, always include 4 options. For true_false, correct_answer is either "True" or "False". For fill_blank, correct_answer is the missing word or phrase. Generate exactly 15 questions total.`

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
        max_tokens: 4000,
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
                text: 'Generate exactly 15 quiz questions from the educational content in this image. Only ask about the actual subject matter — never about titles, headers, or document structure. Return only the JSON.',
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
