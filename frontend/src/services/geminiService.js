import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Fallback mock generator (from cardGenerator.js)
function generateMockCards(topic, count) {
  const topicLower = topic.toLowerCase()
  let templates = []

  if (topicLower.includes('animal') || topicLower.includes('zoo')) {
    templates = [
      ['What is the largest mammal?', 'Blue whale'],
      ['What is the fastest land animal?', 'Cheetah'],
      ['What animal is known as the king of the jungle?', 'Lion'],
      ['What is a group of lions called?', 'Pride'],
      ['What is the smallest mammal?', 'Bumblebee bat'],
      ['What animal has the longest neck?', 'Giraffe'],
      ['What is a baby kangaroo called?', 'Joey'],
      ['What is the largest bird?', 'Ostrich'],
      ['What animal is known for changing colors?', 'Chameleon'],
      ['What is a group of elephants called?', 'Herd'],
    ]
  } else if (topicLower.includes('chem') || topicLower.includes('acid') || topicLower.includes('base')) {
    templates = [
      ['What is the chemical symbol for water?', 'H2O'],
      ['What is the pH of a neutral solution?', '7'],
      ['What is the most abundant element in the universe?', 'Hydrogen'],
      ['What is the chemical formula for table salt?', 'NaCl'],
      ['What is the pH of an acid?', 'Less than 7'],
      ['What is the pH of a base?', 'Greater than 7'],
      ['What is the chemical symbol for gold?', 'Au'],
      ['What is the atomic number of carbon?', '6'],
      ['What is the chemical formula for carbon dioxide?', 'CO2'],
      ['What is the most common gas in Earth\'s atmosphere?', 'Nitrogen'],
    ]
  } else {
    for (let i = 1; i <= Math.min(count, 20); i++) {
      templates.push([`What is ${topic} ${i}?`, `Definition or answer for ${topic} ${i}`])
    }
  }

  const shuffled = [...templates].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, Math.min(count, templates.length))

  return selected.map(([front, back]) => ({
    frontText: front,
    backText: back,
    imageUrl: null,
  }))
}

/**
 * Parse Gemini API response to extract flashcard pairs
 */
function parseGeminiResponse(text) {
  const cards = []
  
  // Try multiple parsing strategies
  
  // Strategy 1: Look for "Question:" / "Answer:" or "Q:" / "A:" patterns
  const qaPattern1 = /(?:Question|Q|Front)[:\s]+(.+?)(?:\n|Answer|Back|$)/gi
  const qaPattern2 = /(?:Answer|A|Back)[:\s]+(.+?)(?:\n|Question|Q|Front|$)/gi
  
  // Strategy 2: Look for numbered format "1. Question: ... Answer: ..."
  const numberedPattern = /(\d+)[\.\)]\s*(?:Question|Q|Front)?[:\s]*(.+?)(?:\n\s*(?:Answer|A|Back)[:\s]+(.+?)(?=\n\d+|\n\n|$))/gis
  
  // Strategy 3: Split by double newlines and try to identify Q&A pairs
  const sections = text.split(/\n\n+/)
  
  // Try numbered pattern first
  let matches = [...text.matchAll(numberedPattern)]
  if (matches.length > 0) {
    matches.forEach(match => {
      const front = match[2]?.trim()
      const back = match[3]?.trim()
      if (front && back) {
        cards.push({ frontText: front, backText: back, imageUrl: null })
      }
    })
  }
  
  // If no cards found, try Q: / A: pattern
  if (cards.length === 0) {
    const questionMatches = [...text.matchAll(/(?:Question|Q|Front)[:\s]+(.+?)(?=\n(?:Answer|A|Back)|$)/gis)]
    const answerMatches = [...text.matchAll(/(?:Answer|A|Back)[:\s]+(.+?)(?=\n(?:Question|Q|Front)|\n\n|$)/gis)]
    
    if (questionMatches.length === answerMatches.length && questionMatches.length > 0) {
      for (let i = 0; i < questionMatches.length; i++) {
        const front = questionMatches[i][1]?.trim()
        const back = answerMatches[i][1]?.trim()
        if (front && back) {
          cards.push({ frontText: front, backText: back, imageUrl: null })
        }
      }
    }
  }
  
  // If still no cards, try splitting by sections
  if (cards.length === 0 && sections.length >= 2) {
    for (let i = 0; i < sections.length - 1; i += 2) {
      const front = sections[i]?.trim().replace(/^(?:Question|Q|Front|^\d+[\.\)])[:\s]*/i, '').trim()
      const back = sections[i + 1]?.trim().replace(/^(?:Answer|A|Back)[:\s]*/i, '').trim()
      if (front && back && front.length > 5 && back.length > 5) {
        cards.push({ frontText: front, backText: back, imageUrl: null })
      }
    }
  }
  
  // Last resort: try to find any pattern with "?" for questions
  if (cards.length === 0) {
    const lines = text.split('\n').filter(l => l.trim())
    let currentCard = null
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('?') && trimmed.length < 200) {
        if (currentCard && currentCard.backText) {
          cards.push(currentCard)
        }
        currentCard = { frontText: trimmed, backText: '', imageUrl: null }
      } else if (currentCard && !currentCard.backText && trimmed.length > 10) {
        currentCard.backText = trimmed
      }
    }
    if (currentCard && currentCard.backText) {
      cards.push(currentCard)
    }
  }

  return cards.filter(card => card.frontText && card.backText && card.frontText.length > 3 && card.backText.length > 3)
}

/**
 * Generate flashcards using Gemini API
 */
export async function generateCardsWithGemini(topic, count) {
  // Fallback to mock if no API key
  if (!API_KEY) {
    console.warn('Gemini API key not found, using mock generator')
    return generateMockCards(topic, count)
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Generate exactly ${count} educational flashcards about "${topic}". 

For each flashcard, provide:
- A clear, concise question on the front
- A detailed, accurate answer on the back

Format your response EXACTLY as follows (this format is critical):

1. Question: [question text]
Answer: [answer text]

2. Question: [question text]
Answer: [answer text]

3. Question: [question text]
Answer: [answer text]

Continue this pattern for all ${count} cards. Make sure:
- Each card is numbered (1, 2, 3, etc.)
- Each question starts with "Question:"
- Each answer starts with "Answer:"
- Questions are diverse and cover different aspects of ${topic}
- Answers are concise but informative (2-3 sentences maximum)
- Use clear, educational language appropriate for learning`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    let cards = parseGeminiResponse(text)

    // If parsing didn't work well, try a simpler approach
    if (cards.length === 0) {
      // Try to extract Q&A pairs using regex
      const qaPattern = /(?:Question|Q|Front)[:\s]+(.+?)(?:\n|Answer|Back|$)/gi
      const matches = [...text.matchAll(qaPattern)]
      
      if (matches.length > 0) {
        cards = matches.map(match => ({
          frontText: match[1].trim(),
          backText: '', // Will need to extract separately
          imageUrl: null,
        }))
      }
    }

    // Ensure we have the right number of cards
    if (cards.length > count) {
      cards = cards.slice(0, count)
    } else if (cards.length < count && cards.length > 0) {
      // If we got fewer cards, duplicate and modify slightly
      while (cards.length < count) {
        const card = cards[cards.length % cards.length]
        cards.push({
          frontText: card.frontText + ' (continued)',
          backText: card.backText,
          imageUrl: null,
        })
      }
      cards = cards.slice(0, count)
    }

    // If still no cards, fallback to mock
    if (cards.length === 0) {
      console.warn('Failed to parse Gemini response, using mock generator')
      return generateMockCards(topic, count)
    }

    return cards
  } catch (error) {
    console.error('Gemini API error:', error)
    console.warn('Falling back to mock generator')
    return generateMockCards(topic, count)
  }
}

/**
 * Chat about a specific flashcard using Gemini (short, tutor-style answers)
 */
export async function chatAboutCardWithGemini(question, answer, userMessage) {
  if (!API_KEY) {
    return 'AI chat is not available because the Gemini API key is not configured.'
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a friendly tutor helping a student understand this flashcard.

Flashcard:
Question: ${question}
Answer: ${answer || '(answer not provided yet)'}

Student just asked:
"${userMessage}"

Respond with a **short** explanation:
- At most 3 short bullet points OR 3 short sentences.
- Use simple language.
- Give a tiny numeric example if it helps.
- Do NOT restate the entire course; stay focused on this specific concept.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return text.trim()
  } catch (error) {
    console.error('Gemini chat error:', error)
    return 'Sorry, something went wrong while talking to the AI. Please try again in a bit.'
  }
}

