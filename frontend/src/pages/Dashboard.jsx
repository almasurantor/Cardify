import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDecks, getDashboardStats, deleteDeck } from '../services/supabaseService'

function Dashboard() {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [stats, setStats] = useState({ masteredCards: 0, strugglingCards: 0, reviewedToday: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [decksData, statsData] = await Promise.all([
        getDecks(user.id),
        getDashboardStats(user.id),
      ])
      setDecks(decksData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDeck = async (deckId, title) => {
    const confirmed = window.confirm(`Delete deck "${title}"? This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteDeck(deckId, user.id)
      setDecks((prev) => prev.filter((d) => d.id !== deckId))
    } catch (error) {
      console.error('Failed to delete deck:', error)
      alert('Failed to delete deck')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        <div className="text-center text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/decks/new"
          className="bg-primary-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-700"
        >
          Create Deck
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">
        <div className="bg-white rounded-xl shadow p-7">
          <div className="text-sm font-medium text-gray-600 mb-2">Mastered Cards</div>
          <div className="text-4xl font-bold text-green-600">{stats.masteredCards}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-7">
          <div className="text-sm font-medium text-gray-600 mb-2">Struggling Cards</div>
          <div className="text-4xl font-bold text-red-600">{stats.strugglingCards}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-7">
          <div className="text-sm font-medium text-gray-600 mb-2">Reviewed Today</div>
          <div className="text-4xl font-bold text-primary-600">{stats.reviewedToday}</div>
        </div>
      </div>

      {/* Decks List */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-5">Your Decks</h2>
        {decks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            <p className="mb-5 text-lg">You don't have any decks yet.</p>
            <Link
              to="/decks/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first deck →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {decks.map((deck) => (
              <div key={deck.id} className="bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-100">
                <div className="p-7 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{deck.title}</h3>
                      {deck.subject && (
                        <p className="text-sm text-gray-600 mt-1">{deck.subject}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDeck(deck.id, deck.title)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">
                        {deck.masteredCards || 0} / {deck.totalCards || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{ width: `${deck.masteredPercent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    to={`/decks/${deck.id}/study`}
                    className="block w-full text-center bg-primary-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-700"
                  >
                    Study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

