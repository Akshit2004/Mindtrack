import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayCheckins, setTodayCheckins] = useState(new Set())
  const [showNewHabit, setShowNewHabit] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [habitsData, checkinsData] = await Promise.all([
        api.getHabits(),
        api.getCheckins({
          from: format(new Date(), 'yyyy-MM-dd'),
          to: format(new Date(), 'yyyy-MM-dd'),
        }),
      ])

      setHabits(habitsData)

      // Build set of today's checkins
      const checkinSet = new Set()
      checkinsData.forEach((checkin) => {
        checkinSet.add(checkin.habitId)
      })
      setTodayCheckins(checkinSet)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCheckin = async (habitId) => {
    try {
      if (todayCheckins.has(habitId)) {
        return
      }

      await api.createCheckin(habitId, {
        checkedAt: new Date().toISOString(),
        quantity: 1,
      })

      setTodayCheckins(new Set([...todayCheckins, habitId]))
    } catch (error) {
      console.error('Failed to create checkin:', error)
    }
  }

  const completedCount = todayCheckins.size
  const totalCount = habits.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Today's Progress
        </h1>
        <p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-600 text-sm font-semibold mb-2">Daily Progress</p>
            <p className="text-4xl font-bold text-slate-900">
              {completedCount} <span className="text-2xl text-slate-400">/</span> {totalCount}
            </p>
            <p className="text-slate-600 text-sm mt-1">habits completed</p>
          </div>
          <div className="text-6xl">
            {completionPercentage === 100 ? '🎉' : completionPercentage > 50 ? '🌟' : '💪'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="mt-4 text-center text-slate-700 font-medium">
          {completionPercentage === 100
            ? '🎉 Amazing! All habits completed today!'
            : completionPercentage > 50
            ? '🌟 Great progress! You\'re more than halfway there!'
            : completedCount > 0
            ? '💪 Good start! Keep the momentum going!'
            : '🚀 Let\'s start your day right! Check in your first habit.'}
        </p>
      </div>

      {/* Habits List */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Today's Habits</h2>
          <button
            onClick={() => setShowNewHabit(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            New Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No habits yet!</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Create your first habit and start building a better routine today.
            </p>
            <button
              onClick={() => setShowNewHabit(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompleted = todayCheckins.has(habit.id)
              return (
                <div
                  key={habit.id}
                  className={`group relative flex items-center gap-5 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => !isCompleted && handleToggleCheckin(habit.id)}
                >
                  {/* Checkbox */}
                  <button
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 border-2 border-slate-300 group-hover:border-blue-500'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Emoji */}
                  <div className={`text-4xl ${isCompleted ? 'opacity-50' : ''}`}>
                    {habit.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-slate-600 line-clamp-1">{habit.description}</p>
                    )}
                  </div>

                  {/* Frequency Badge */}
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      {habit.frequency === 'daily' ? 'Daily' : habit.frequency}
                    </span>
                    
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Done
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Habit Modal */}
      {showNewHabit && (
        <NewHabitModal
          onClose={() => setShowNewHabit(false)}
          onSuccess={() => {
            setShowNewHabit(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function NewHabitModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('✅')
  const [loading, setLoading] = useState(false)

  const emojiOptions = ['✅', '💧', '📚', '🏃', '🧘', '🥗', '😴', '💪', '🎯', '🌟', '🎨', '🎵', '🧠', '❤️']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.createHabit({
        title,
        description,
        emoji,
        frequency: 'daily',
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to create habit:', error)
      alert('Failed to create habit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[95vw] sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Create New Habit
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
                      ? 'bg-blue-100 ring-2 ring-blue-500'
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              rows="3"
              placeholder="Why is this important to you?"
            />
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                'Create Habit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
