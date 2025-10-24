import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({ days: [], streaks: { currentStreak: 0, longestStreak: 0 } })
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1

        const data = await api.getCalendar(year, month)
        setCalendarData(data)
      } catch (error) {
        console.error('Failed to load calendar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentDate])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Create a map for quick lookup
  const dataMap = {}
  calendarData.days.forEach((day) => {
    dataMap[day.date] = day
  })

  // Get intensity and color for heatmap
  const getDayStyle = (count) => {
    if (count === 0) return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
    if (count <= 2) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    if (count <= 4) return { bg: 'bg-green-300', text: 'text-green-800', border: 'border-green-400' }
    if (count <= 6) return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' }
    return { bg: 'bg-green-700', text: 'text-white', border: 'border-green-800' }
  }

  const getMotivationalMessage = () => {
    const streak = calendarData.streaks.currentStreak
    if (streak === 0) return { emoji: '🌱', text: 'Start your journey today!' }
    if (streak < 7) return { emoji: '⭐', text: 'Great start! Keep the momentum going!' }
    if (streak < 30) return { emoji: '🔥', text: "You're on fire! One week down!" }
    return { emoji: '🏆', text: "Incredible! You've built a solid habit!" }
  }

  const message = getMotivationalMessage()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              📅 Your Progress Calendar
            </h1>
            <p className="text-slate-600">Track your consistency and celebrate your wins</p>
          </div>
          <button
            onClick={goToToday}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Today
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold opacity-90">Current Streak</p>
              <span className="text-3xl">🔥</span>
            </div>
            <p className="text-4xl font-bold mb-1">{calendarData.streaks.currentStreak}</p>
            <p className="text-xs opacity-80">days in a row</p>
          </div>

          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold opacity-90">Best Streak</p>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-4xl font-bold mb-1">{calendarData.streaks.longestStreak}</p>
            <p className="text-xs opacity-80">personal record</p>
          </div>

          {/* Total Days */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold opacity-90">Active Days</p>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold mb-1">{calendarData.days.filter(d => d.completedCount > 0).length}</p>
            <p className="text-xs opacity-80">this month</p>
          </div>

          {/* Motivation Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold opacity-90">Status</p>
              <span className="text-3xl">{message.emoji}</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">{message.text}</p>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 max-w-4xl mx-auto">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={previousMonth}
            className="p-3 hover:bg-slate-100 rounded-xl transition-all hover:scale-110"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{format(currentDate, 'yyyy')}</p>
          </div>

          <button
            onClick={nextMonth}
            className="p-3 hover:bg-slate-100 rounded-xl transition-all hover:scale-110"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center py-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-600">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayData = dataMap[dateStr]
                const count = dayData ? dayData.completedCount : 0
                const style = getDayStyle(count)
                const isCurrentDay = isToday(day)
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}
                    className={`
                      relative aspect-square rounded-xl border-2 transition-all
                      ${style.bg} ${style.border} ${style.text}
                      ${isCurrentDay ? 'ring-4 ring-green-400 ring-offset-2' : ''}
                      ${!isCurrentMonth ? 'opacity-30' : 'hover:scale-105 hover:shadow-lg'}
                      ${selectedDay === dateStr ? 'scale-95 shadow-inner' : ''}
                      flex flex-col items-center justify-center gap-1
                      font-bold text-sm sm:text-base
                    `}
                    title={`${format(day, 'MMM d')}: ${count} habits completed`}
                  >
                    <span>{format(day, 'd')}</span>
                    {count > 0 && (
                      <span className="text-[10px] sm:text-xs font-semibold">
                        {count}✓
                      </span>
                    )}
                    {isCurrentDay && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-600">Less</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border-2 border-slate-200"></div>
                  <div className="w-8 h-8 rounded-lg bg-green-100 border-2 border-green-200"></div>
                  <div className="w-8 h-8 rounded-lg bg-green-300 border-2 border-green-400"></div>
                  <div className="w-8 h-8 rounded-lg bg-green-500 border-2 border-green-600"></div>
                  <div className="w-8 h-8 rounded-lg bg-green-700 border-2 border-green-800"></div>
                </div>
                <span className="text-xs font-bold text-slate-600">More</span>
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">
                Each day shows the number of habits you completed
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
