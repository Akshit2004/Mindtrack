import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingHabit, setEditingHabit] = useState(null)
  const [showNewHabit, setShowNewHabit] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const data = await api.getHabits()
      setHabits(data)
    } catch (error) {
      console.error('Failed to load habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return
    }

    try {
      await api.deleteHabit(habitId)
      setHabits(habits.filter((h) => h.id !== habitId))
    } catch (error) {
      console.error('Failed to delete habit:', error)
      alert('Failed to delete habit')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Habits
          </h1>
          <p className="text-slate-600">Manage and track your daily routines</p>
        </div>
        <button
          onClick={() => setShowNewHabit(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-md border border-slate-200">
          <div className="text-7xl mb-6">🎯</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No habits yet</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Create your first habit to start your wellness journey and build lasting positive routines
          </p>
          <button
            onClick={() => setShowNewHabit(true)}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow border border-slate-200"
            >
              <div className="flex items-start gap-5">
                <div className="text-5xl">
                  {habit.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-slate-600 mb-4">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                      {habit.frequency === 'daily' ? '📅 Daily' : habit.frequency}
                    </span>
                    {habit.target && habit.target > 1 && (
                      <span className="text-slate-600">🎯 Target: {habit.target} times</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="p-3 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit habit"
                  >
                    <svg className="w-5 h-5 text-slate-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-3 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete habit"
                  >
                    <svg className="w-5 h-5 text-slate-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showNewHabit && (
        <HabitModal
          onClose={() => setShowNewHabit(false)}
          onSuccess={() => {
            setShowNewHabit(false)
            loadHabits()
          }}
        />
      )}

      {editingHabit && (
        <HabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSuccess={() => {
            setEditingHabit(null)
            loadHabits()
          }}
        />
      )}
    </div>
  )
}

function HabitModal({ habit, onClose, onSuccess }) {
  const [title, setTitle] = useState(habit?.title || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '✅')
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily')
  const [loading, setLoading] = useState(false)

  const emojiOptions = ['✅', '💧', '📚', '🏃', '🧘', '🥗', '😴', '💪', '🎯', '🌟', '🎨', '🎵', '🧠', '❤️', '🌿', '⚡']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (habit) {
        await api.updateHabit(habit.id, { title, description, emoji, frequency })
      } else {
        await api.createHabit({ title, description, emoji, frequency })
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save habit:', error)
      alert('Failed to save habit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[95vw] sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Choose an Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-3xl p-3 rounded-lg transition-colors ${
                    emoji === e
                      ? 'bg-purple-100 ring-2 ring-purple-500'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Habit Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors resize-none"
              rows="3"
              placeholder="Why is this important to you?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                habit ? 'Update Habit' : 'Create Habit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
