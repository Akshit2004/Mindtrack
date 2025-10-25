import { useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

// Cache per user+date to avoid repeated calls & keep message stable for the day
const makeCacheKey = (uid, dateStr) => `personalQuote:${uid}:${dateStr}`

export default function PersonalQuote() {
  const { user } = useAuth()
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY
  const yesterday = useMemo(() => subDays(new Date(), 1), [])
  const ymd = useMemo(() => format(yesterday, 'yyyy-MM-dd'), [yesterday])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')

      try {
        if (!user?.uid) {
          setQuote('')
          setLoading(false)
          return
        }

        // Return cached line if present
        const cacheKey = makeCacheKey(user.uid, ymd)
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          setQuote(cached)
          setLoading(false)
          return
        }

        // Load habits and yesterday check-ins
        const habits = await api.getHabits({ userId: user.uid })
        const habitMap = new Map(habits.map(h => [h.id, h]))

        const checkins = await api.getCheckins({ from: ymd, to: ymd })
        const finishedTitlesYesterday = (checkins || [])
          .map(c => habitMap.get(c.habitId))
          .filter(Boolean)
          .map(h => h.title)

        let titles = finishedTitlesYesterday
        if (!titles.length) {
          // Fallback: habits marked completed (if you’re using global completion flag)
          titles = habits.filter(h => h.is_completed === true).map(h => h.title)
        }

        if (!titles.length) {
          setQuote('A small win today sets up a stronger you tomorrow.')
          setLoading(false)
          return
        }

        // Pick ONE activity to keep the line focused & personal
        const selectedTitle = titles[Math.floor(Math.random() * titles.length)]

        // Category & benefit mapping to guide tone and fallback
        const categories = {
          music: { keys: ['music', 'song', 'listen', 'playlist', 'spotify'], benefit: 'boosted creativity' },
          reading: { keys: ['read', 'book', 'reading', 'chapter'], benefit: 'built focus' },
          fitness: { keys: ['walk', 'run', 'jog', 'cycle', 'yoga', 'gym', 'workout', 'swim'], benefit: 'boosted energy' },
          creativity: { keys: ['draw', 'paint', 'write', 'sketch', 'compose'], benefit: 'sparked creativity' },
        }
        const detectCategory = (title) => {
          const t = (title || '').toLowerCase()
          for (const [name, cfg] of Object.entries(categories)) {
            if (cfg.keys.some(k => t.includes(k))) return name
          }
          return null
        }

        const cat = detectCategory(selectedTitle)
        const benefit = cat ? categories[cat].benefit : 'kept your momentum'

        // Try Gemini for a short, personal, varied line
        let generated = ''
        if (apiKey) {
          try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
            const who = user?.displayName ? `${user.displayName}` : 'You'
            const hint = cat ? `Focus subtly on ${cat} benefits like "${benefit}".` : ''
            const prompt = `You are a warm, upbeat coach. Produce ONE short, personal, positive sentence (10-18 words).
Only use this item from yesterday: ${JSON.stringify(selectedTitle)}.
Personalize the line for ${who} (first name only if available). Mention a plausible benefit when relevant:
- music -> boosted creativity or sparked focus
- reading -> built focus or expanded ideas
- fitness -> boosted energy or kept you ahead
- creativity -> sparked creativity
Do NOT invent activities. Keep it varied and concise. No quotes, no emojis, past tense preferred.
${hint}
Vary phrasing across requests (be creative). Output only the sentence.`

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }]}],
              generationConfig: { temperature: 0.9, topP: 0.9, maxOutputTokens: 60 },
            })
            const resp = await result.response
            generated = (resp?.text?.() || resp?.text || '').trim()
          } catch {
            // Fall through to local fallback
          }
        }

        if (!generated) {
          // Local fallback that stays aligned with the personal/benefit guidance
          generated = `${user?.displayName ? user.displayName : 'You'} nailed ${selectedTitle} — ${benefit}. Keep going!`
        }

        setQuote(generated)
        sessionStorage.setItem(cacheKey, generated)
      } catch (err) {
        console.error('PersonalQuote error:', err)
        setError('')
        setQuote('Nice progress — keep pushing, you’re closer than you think.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [user?.uid, user?.displayName, ymd, apiKey])

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 shadow-md border border-slate-200">
      <div className="flex items-start gap-3">
        <div className="text-2xl sm:text-3xl">💡</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 mb-1">Yesterday’s snapshot</p>
          {loading ? (
            <p className="text-slate-700 animate-pulse">Crafting your personal note…</p>
          ) : (
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed">{quote}</p>
          )}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
