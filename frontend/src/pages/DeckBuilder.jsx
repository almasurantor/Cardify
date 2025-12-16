import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createDeck } from '../services/supabaseService'
import { generateCardsWithGemini } from '../services/geminiService'

function DeckBuilder() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [cards, setCards] = useState([])
  const [generateTopic, setGenerateTopic] = useState('')
  const [generateCount, setGenerateCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [manualFront, setManualFront] = useState('')
  const [manualBack, setManualBack] = useState('')
  const [manualImageUrl, setManualImageUrl] = useState('')
  const navigate = useNavigate()

  const handleGenerate = async () => {
    if (!generateTopic.trim()) return
    setGenerating(true)
    try {
      const generatedCards = await generateCardsWithGemini(generateTopic, generateCount)
      const cardsWithIds = generatedCards.map((card) => ({
        ...card,
        id: Date.now() + Math.random(), // Temporary ID
      }))
      setCards([...cards, ...cardsWithIds])
      setGenerateTopic('')
    } catch (error) {
      console.error('Failed to generate cards:', error)
      alert('Failed to generate cards. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleAddManual = () => {
    if (!manualFront.trim() || !manualBack.trim()) return
    const newCard = {
      id: Date.now(),
      frontText: manualFront,
      backText: manualBack,
      imageUrl: manualImageUrl || null,
    }
    setCards([...cards, newCard])
    setManualFront('')
    setManualBack('')
    setManualImageUrl('')
  }

  const handleRemoveCard = (id) => {
    setCards(cards.filter((card) => card.id !== id))
  }

  const handleUpdateCard = (id, field, value) => {
    setCards(
      cards.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a deck title')
      return
    }
    if (cards.length === 0) {
      alert('Please add at least one card')
      return
    }

    setSaving(true)
    try {
      await createDeck(user.id, {
        title,
        subject: subject || null,
        cards: cards.map((card) => ({
          frontText: card.frontText,
          backText: card.backText,
          imageUrl: card.imageUrl || null,
        })),
      })
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to save deck:', error)
      alert('Failed to save deck')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Deck</h1>

      {/* Deck Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deck Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Biology Terms"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject (optional)
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Biology"
          />
        </div>
      </div>

      {/* Generate Cards Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Cards</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Topic (e.g., animals, chemistry, history)"
          />
          <input
            type="number"
            min="1"
            max="20"
            value={generateCount}
            onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !generateTopic.trim()}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Manual Add Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Card Manually</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={manualFront}
            onChange={(e) => setManualFront(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Front (question)"
          />
          <input
            type="text"
            value={manualBack}
            onChange={(e) => setManualBack(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Back (answer)"
          />
          <input
            type="url"
            value={manualImageUrl}
            onChange={(e) => setManualImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Image URL (optional)"
          />
          <button
            onClick={handleAddManual}
            disabled={!manualFront.trim() || !manualBack.trim()}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            Add Card
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cards ({cards.length})
        </h2>
        {cards.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No cards yet. Generate or add cards above.</p>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">Card {cards.indexOf(card) + 1}</span>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={card.frontText}
                    onChange={(e) => handleUpdateCard(card.id, 'frontText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Front"
                  />
                  <input
                    type="text"
                    value={card.backText}
                    onChange={(e) => handleUpdateCard(card.id, 'backText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Back"
                  />
                  {card.imageUrl && (
                    <input
                      type="url"
                      value={card.imageUrl || ''}
                      onChange={(e) => handleUpdateCard(card.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Image URL"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || cards.length === 0}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Deck'}
        </button>
      </div>
    </div>
  )
}

export default DeckBuilder

