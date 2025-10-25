import { useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function NewHabitModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('✅')
  const [frequency, setFrequency] = useState('daily')
  const [loading, setLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const emojiOptions = [
    { emoji: '💧', label: 'Water' },
    { emoji: '📚', label: 'Read' },
    { emoji: '🏃', label: 'Exercise' },
    { emoji: '🧘', label: 'Meditate' },
    { emoji: '🥗', label: 'Healthy' },
    { emoji: '😴', label: 'Sleep' },
    { emoji: '💪', label: 'Strength' },
    { emoji: '🎯', label: 'Goal' },
    { emoji: '🌟', label: 'Star' },
    { emoji: '🎨', label: 'Creative' },
    { emoji: '🎵', label: 'Music' },
    { emoji: '🧠', label: 'Learn' },
    { emoji: '❤️', label: 'Health' },
    { emoji: '🌿', label: 'Nature' },
    { emoji: '⚡', label: 'Energy' },
  ]

  const frequencyOptions = [
    { value: 'daily', label: 'Every Day', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const body = {
        title,
        description,
        emoji,
        frequency,
        is_completed: isCompleted,
      }
      if (user && user.uid) body.userId = user.uid
      await api.createHabit(body)
      onSuccess()
    } catch (error) {
      console.error('Failed to create habit:', error)
      alert('Failed to create habit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create New Habit</h2>
            <p className="text-blue-100 text-sm sm:text-base">Build a better routine, one habit at a time</p>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3">
                Choose an Icon
              </label>
              <div className="grid grid-cols-8 gap-2">
                {emojiOptions.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => setEmoji(option.emoji)}
                    className={`relative group aspect-square rounded-xl text-2xl sm:text-3xl transition-all ${
                      emoji === option.emoji
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg scale-110'
                        : 'bg-slate-100 hover:bg-slate-200 hover:scale-105'
                    }`}
                    title={option.label}
                  >
                    <span className={emoji === option.emoji ? 'drop-shadow-md' : ''}>
                      {option.emoji}
                    </span>
                    {emoji === option.emoji && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Habit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., Drink 8 glasses of water"
                maxLength={50}
              />
              <p className="text-xs text-slate-500 mt-1">{title.length}/50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Description <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
                rows="3"
                placeholder="Why is this habit important to you?"
                maxLength={200}
              />
              <p className="text-xs text-slate-500 mt-1">{description.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3">
                Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFrequency(option.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                      frequency === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className={`text-sm font-semibold ${
                      frequency === option.value ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {option.label}
                    </div>
                    {frequency === option.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 border-2 border-slate-300 rounded-xl hover:bg-slate-100 transition-all font-bold text-slate-700 hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Habit
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
