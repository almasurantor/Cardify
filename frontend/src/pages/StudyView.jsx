import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStudyCards, reviewCard } from '../services/supabaseService'
import { chatAboutCardWithGemini } from '../services/geminiService'

function StudyView() {
  const { user } = useAuth()
  const { deckId } = useParams()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([]) // {from: 'user' | 'ai', text: string}
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadCards()
    }
  }, [deckId, user])

  const loadCards = async () => {
    try {
      const cardsData = await getStudyCards(deckId, user.id)
      setCards(cardsData)
      if (cardsData.length === 0) {
        alert('This deck has no cards')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to load cards:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (action) => {
    if (!cards[currentIndex]) return
    setReviewing(true)
    try {
      await reviewCard(cards[currentIndex].id, user.id, action)
      // Update local state
      const updatedCards = [...cards]
      const currentCard = updatedCards[currentIndex]
      if (currentCard.progress) {
        currentCard.progress.status = action
        currentCard.progress.timesReviewed += 1
        if (action === 'MASTERED') {
          currentCard.progress.timesMastered += 1
        } else if (action === 'STRUGGLING') {
          currentCard.progress.timesStruggled += 1
        }
      }
      setCards(updatedCards)
      
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        // Finished all cards
        alert('You\'ve finished reviewing all cards!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to review card:', error)
    } finally {
      setReviewing(false)
    }
  }

  const handleNext = () => {
    if (cards.length === 0) return

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Loop back to the first card instead of leaving the page
      setCurrentIndex(0)
    }
    setIsFlipped(false)
    // Reset chat state when moving between cards
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
  }

  const handlePrev = () => {
    if (cards.length === 0) return

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      // From first card, go to last
      setCurrentIndex(cards.length - 1)
    }
    setIsFlipped(false)
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
  }

  const handleToggleChat = () => {
    setChatOpen((prev) => !prev)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text || !cards[currentIndex]) return

    const currentCard = cards[currentIndex]
    const newUserMessage = { from: 'user', text }
    const newMessages = [...chatMessages, newUserMessage]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const reply = await chatAboutCardWithGemini(
        currentCard.frontText,
        currentCard.backText,
        text
      )
      setChatMessages((prev) => [...prev, { from: 'ai', text: reply }])
    } catch (error) {
      console.error('Failed to load AI chat:', error)
      setChatMessages((prev) => [
        ...prev,
        { from: 'ai', text: 'Sorry, something went wrong while talking to the AI.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return null
  }

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100
  const masteredCount = cards.filter((c) => c.progress?.status === 'MASTERED').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-start gap-4">
        <div className="flex-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 mb-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-sm text-gray-600">
              {masteredCount} mastered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <button
          onClick={handleToggleChat}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100"
        >
          <span>{chatOpen ? 'Close Chat' : 'Open Chat'}</span>
        </button>
      </div>

      <div
        className={`gap-6 items-start ${
          chatOpen ? 'grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : 'flex flex-col'
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-lg p-8 min-h-[320px] flex items-center justify-center ${
            chatOpen ? '' : 'max-w-3xl mx-auto w-full'
          }`}
        >
          <div className="text-center w-full space-y-4">
            {currentCard.imageUrl && (
              <img
                src={currentCard.imageUrl}
                alt="Card"
                className="max-w-full max-h-64 mx-auto mb-4 rounded"
              />
            )}
            <div className="text-2xl font-semibold text-gray-900">
              {isFlipped ? currentCard.backText : currentCard.frontText}
            </div>
            <div>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-primary-600 hover:text-primary-700 text-sm underline"
              >
                {isFlipped ? 'Show Question' : 'Flip Card'}
              </button>
            </div>
          </div>
        </div>

        {chatOpen && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Cardify Tutor</h2>
            </div>
            <div className="flex-1 overflow-auto text-sm text-gray-700 border border-gray-100 rounded-md p-3 bg-gray-50 space-y-3">
              {chatMessages.length === 0 && !chatLoading && (
                <div className="text-gray-500">
                  Ask anything about this card. For example: <br />
                  <span className="italic">"Explain this in simple terms"</span> or{' '}
                  <span className="italic">"Give me a small example"</span>.
                </div>
              )}
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-md max-w-full ${
                    m.from === 'user'
                      ? 'bg-primary-100 text-gray-900 self-end'
                      : 'bg-gray-100 text-gray-800 self-start'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <div className="text-gray-500 text-sm">Cardify Tutor is thinking...</div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a question about this card..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        <button
          onClick={handlePrev}
          disabled={reviewing}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => handleReview('STRUGGLING')}
          disabled={reviewing}
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Struggling
        </button>
        <button
          onClick={() => handleReview('MASTERED')}
          disabled={reviewing}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Mastered
        </button>
        <button
          onClick={handleNext}
          disabled={reviewing}
          className="bg-primary-700 text-white px-6 py-3 rounded-md hover:bg-primary-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default StudyView

