import { useState, useEffect, useMemo } from 'react'
import { api } from '../utils/api'
import { format, parseISO } from 'date-fns'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingHabit, setEditingHabit] = useState(null)
  const [showNewHabit, setShowNewHabit] = useState(false)

  // Pagination by date: we build a list of unique dates (yyyy-MM-dd) and allow navigating between them
  const [dates, setDates] = useState([])
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const data = await api.getHabits()
      setHabits(data)

      // Build unique date list sorted desc (by createdAt date)
      const dateSet = new Set()
      data.forEach((h) => {
        const d = h.createdAt ? format(parseISO(h.createdAt), 'yyyy-MM-dd') : 'unknown'
        dateSet.add(d)
      })
      const dateArr = Array.from(dateSet).sort((a, b) => (a < b ? 1 : -1))
      setDates(dateArr)
      setSelectedDateIndex(0)
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
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    } catch (error) {
      console.error('Failed to delete habit:', error)
      alert('Failed to delete habit')
    }
  }

  // Group habits by date (yyyy-MM-dd)
  const groups = useMemo(() => {
    const map = {}
    habits.forEach((h) => {
      const d = h.createdAt ? format(parseISO(h.createdAt), 'yyyy-MM-dd') : 'unknown'
      if (!map[d]) map[d] = []
      map[d].push(h)
    })
    return map
  }, [habits])

  const selectedDate = dates[selectedDateIndex]
  const pageHabits = selectedDate ? groups[selectedDate] || [] : habits

  const goPrevDate = () => setSelectedDateIndex((i) => Math.min(dates.length - 1, i + 1))
  const goNextDate = () => setSelectedDateIndex((i) => Math.max(0, i - 1))

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Habits</h1>
          <p className="text-slate-600 text-sm">Simple list view — paginate by date</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewHabit(true)} className="hidden" />
        </div>
      </div>

      {/* Date pagination controls */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={goPrevDate} disabled={selectedDateIndex >= dates.length - 1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50">
            ‹
          </button>
          <div className="text-sm font-semibold">
            {selectedDate ? format(parseISO(selectedDate + 'T00:00:00'), 'MMMM d, yyyy') : 'All Dates'}
          </div>
          <button onClick={goNextDate} disabled={selectedDateIndex <= 0} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50">
            ›
          </button>
        </div>
        <div className="text-xs text-slate-500">Showing {pageHabits.length} habit(s)</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {pageHabits.length === 0 ? (
          <div className="p-6 text-center text-slate-600">No habits for this date.</div>
        ) : (
          <ul className="divide-y">
            {pageHabits.map((h) => (
              <li key={h.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xl flex-shrink-0">{h.emoji}</div>
                  <div className="truncate">
                    <div className={`font-semibold text-sm truncate ${h.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{h.title}</div>
                    {h.description && <div className={`text-xs truncate ${h.is_completed ? 'text-slate-400' : 'text-slate-500'}`}>{h.description}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {h.is_completed && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Completed
                    </span>
                  )}
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs">{h.frequency === 'daily' ? 'Daily' : h.frequency}</span>
                  <button onClick={() => setEditingHabit(h)} className="p-2 rounded hover:bg-slate-100" title="Edit">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="p-2 rounded hover:bg-red-50" title="Delete">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
  const [isCompleted, setIsCompleted] = useState(habit?.is_completed || false)

  const emojiOptions = ['✅', '💧', '📚', '🏃', '🧘', '🥗', '😴', '💪', '🎯', '🌟', '🎨', '🎵', '🧠', '❤️', '🌿', '⚡']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (habit) {
        await api.updateHabit(habit.id, { title, description, emoji, frequency, is_completed: isCompleted })
      } else {
        await api.createHabit({ title, description, emoji, frequency, is_completed: isCompleted })
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
