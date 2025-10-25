import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { format } from 'date-fns'
import NewHabitModal from '../components/NewHabitModal'
import { useAuth } from '../contexts/AuthContext'
import PersonalQuote from '../components/PersonalQuote'

export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewHabit, setShowNewHabit] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (user && user.uid) {
      loadData()
    } else {
      setHabits([])
      setLoading(false)
    }
  }, [user?.uid, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      if (!user || !user.uid) {
        setHabits([])
        return
      }
      const habitsData = await api.getHabits({ userId: user.uid })

      const today = new Date()
      const filteredHabits = habitsData.filter((habit) => {
        if (!habit.createdAt) return true
        const habitCreatedDate = new Date(habit.createdAt)
        return habitCreatedDate <= today
      })

      setHabits(filteredHabits)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCheckin = async (habit) => {
    try {
      if (habit.is_completed === true) {
        return
      }

      await api.updateHabit(habit.id, { is_completed: true })

      setHabits((prev) => prev.map(h => h.id === habit.id ? { ...h, is_completed: true } : h))
    } catch (error) {
      console.error('Failed to create checkin:', error)
    }
  }

  const isHabitCompleted = (habit) => habit.is_completed === true
  const completedCount = habits.filter(isHabitCompleted).length
  const totalCount = habits.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading || authLoading) {
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
      <PersonalQuote />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Today's Progress
        </h1>
        <p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

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

      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Today's Habits</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewHabit(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-semibold"
              title="Create new habit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Habit
            </button>
          </div>
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
          <div className="space-y-2 sm:space-y-3">
            {habits.map((habit) => {
              const isCompleted = isHabitCompleted(habit)
              return (
                <div
                  key={habit.id}
                  className={`group relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => !isCompleted && handleToggleCheckin(habit)}
                >
                  <button
                    className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 border-2 border-slate-300 group-hover:border-blue-500'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className={`text-xl sm:text-2xl flex-shrink-0 ${isCompleted ? 'opacity-50' : ''}`}>
                    {habit.emoji}
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2">
                    <h3 className={`text-sm sm:text-base font-semibold truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <span className="hidden lg:inline text-sm text-slate-500 truncate">
                        • {habit.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                      {habit.frequency === 'daily' ? 'Daily' : habit.frequency}
                    </span>
                    
                    {isCompleted && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 mt-6 text-center shadow-md border border-slate-200 flex-shrink-0">
        <p className="text-sm text-slate-700 font-medium">
          {totalCount === 0
            ? '🌱 No habits yet. Create one to get started.'
            : completedCount === 0
            ? '🌱 Start your journey today! Every great streak begins with day one.'
            : completionPercentage < 50
            ? '🌟 Great start! Keep the momentum going!'
            : completionPercentage < 100
            ? "🔥 You're on fire! Keep going!"
            : '🏆 Incredible! All habits completed today!'}
        </p>
      </div>

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
