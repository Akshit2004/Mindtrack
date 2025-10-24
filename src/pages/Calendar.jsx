import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({ days: [], streaks: { currentStreak: 0, longestStreak: 0 } })
  const [loading, setLoading] = useState(true)

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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Create a map for quick lookup
  const dataMap = {}
  calendarData.days.forEach((day) => {
    dataMap[day.date] = day
  })

  // Get intensity for heatmap coloring
  const getIntensity = (count) => {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 4) return 2
    if (count <= 6) return 3
    return 4
  }

  const intensityColors = [
    'bg-slate-100 hover:bg-slate-200',
    'bg-emerald-200 hover:bg-emerald-300',
    'bg-emerald-400 hover:bg-emerald-500',
    'bg-emerald-600 hover:bg-emerald-700',
    'bg-emerald-800 hover:bg-emerald-900',
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Calendar & Streaks
        </h1>
        <p className="text-sm text-slate-600">Track your consistency and build lasting habits</p>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-shrink-0">
        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
          <p className="text-slate-600 text-xs font-semibold mb-2">Current Streak</p>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-3xl font-bold text-orange-600">
              {calendarData.streaks.currentStreak}
            </p>
            <div className="text-2xl">🔥</div>
          </div>
          <p className="text-slate-600 text-xs">days in a row</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
          <p className="text-slate-600 text-xs font-semibold mb-2">Longest Streak</p>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-3xl font-bold text-purple-600">
              {calendarData.streaks.longestStreak}
            </p>
            <div className="text-2xl">🏆</div>
          </div>
          <p className="text-slate-600 text-xs">personal best</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 flex-1 flex flex-col min-h-0">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-lg font-bold text-emerald-600">
            {format(currentDate, 'MMMM yyyy')}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 flex-1">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 flex-shrink-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-600 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1 content-start">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square max-h-16" />
              ))}

              {/* Days of the month */}
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayData = dataMap[dateStr]
                const count = dayData ? dayData.completedCount : 0
                const intensity = getIntensity(count)
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={dateStr}
                    className={`aspect-square max-h-16 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      intensityColors[intensity]
                    } ${isCurrentDay ? 'ring-1 ring-emerald-600' : ''} ${
                      !isSameMonth(day, currentDate) ? 'opacity-30' : ''
                    }`}
                    title={`${format(day, 'MMM d')}: ${count} habits completed`}
                  >
                    <span className={`text-sm font-bold ${intensity > 2 ? 'text-white' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] font-semibold ${intensity > 2 ? 'text-white' : 'text-emerald-700'}`}>
                        {count} ✓
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-2 bg-slate-50 rounded-lg p-2 flex-shrink-0">
              <span className="text-xs text-slate-600 font-semibold">Less</span>
              {intensityColors.map((color, i) => (
                <div key={i} className={`w-5 h-5 rounded ${color.split(' ')[0]}`} />
              ))}
              <span className="text-xs text-slate-600 font-semibold">More</span>
            </div>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="bg-white rounded-xl p-4 mt-4 text-center shadow-md border border-slate-200 flex-shrink-0">
        <p className="text-sm text-slate-700 font-medium">
          {calendarData.streaks.currentStreak === 0 && "🌱 Start your journey today! Every great streak begins with day one."}
          {calendarData.streaks.currentStreak > 0 && calendarData.streaks.currentStreak < 7 && "🌟 Great start! Keep the momentum going!"}
          {calendarData.streaks.currentStreak >= 7 && calendarData.streaks.currentStreak < 30 && "🔥 You're on fire! One week down, keep pushing!"}
          {calendarData.streaks.currentStreak >= 30 && "🏆 Incredible! You've built a solid habit. This is who you are now!"}
        </p>
      </div>
    </div>
  )
}
