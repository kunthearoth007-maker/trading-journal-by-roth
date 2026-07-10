import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, dayWinStats, fmtMoney, getEntry, todayStr, tradePnl, uid } from './utils.js'
import TradesPanel from './components/TradesPanel.jsx'
import MetricsPanel from './components/MetricsPanel.jsx'
import ActivityHeatmap from './components/ActivityHeatmap.jsx'
import MonthCalendar from './components/MonthCalendar.jsx'

const STORAGE_KEY = 'journal-entries'

function loadInitialEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function computeStreak(entries) {
  let streak = 0
  let d = todayStr()
  const hasContent = (date) => {
    const e = entries[date]
    return e && (e.trades.length || (e.notes && e.notes.trim()))
  }
  if (!hasContent(d)) d = addDays(d, -1)
  while (hasContent(d)) {
    streak++
    d = addDays(d, -1)
  }
  return streak
}

export default function App() {
  const [entries, setEntries] = useState(loadInitialEntries)
  const [currentDate, setCurrentDate] = useState(todayStr())
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [saveStatus, setSaveStatus] = useState('')
  const saveTimer = useRef(null)
  const firstRun = useRef(true)

  // debounced save to localStorage whenever entries change
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setSaveStatus('saving…')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus((s) => (s === 'saved' ? '' : s)), 1200)
      } catch {
        setSaveStatus('save failed')
      }
    }, 400)
    return () => clearTimeout(saveTimer.current)
  }, [entries])

  const entry = getEntry(entries, currentDate)

  function addTrade() {
    setEntries((prev) => {
      const e = prev[currentDate] || { date: currentDate, trades: [], notes: '' }
      const newTrade = { id: uid(), symbol: '', dir: 'long', session: '', entry: '', exit: '', size: '' }
      return { ...prev, [currentDate]: { ...e, trades: [...e.trades, newTrade] } }
    })
  }

  function updateTrade(id, field, value) {
    setEntries((prev) => {
      const e = prev[currentDate]
      if (!e) return prev
      const trades = e.trades.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      return { ...prev, [currentDate]: { ...e, trades } }
    })
  }

  function deleteTrade(id) {
    setEntries((prev) => {
      const e = prev[currentDate]
      if (!e) return prev
      return { ...prev, [currentDate]: { ...e, trades: e.trades.filter((t) => t.id !== id) } }
    })
  }

  function updateNotes(value) {
    setEntries((prev) => {
      const e = prev[currentDate] || { date: currentDate, trades: [], notes: '' }
      return { ...prev, [currentDate]: { ...e, notes: value } }
    })
  }

  function navigateDate(delta) {
    setCurrentDate((d) => addDays(d, delta))
  }
  function jumpToday() {
    setCurrentDate(todayStr())
  }
  function jumpToDate(dateStr) {
    setCurrentDate(dateStr)
  }

  const metrics = useMemo(() => {
    let total = 0
    let wins = []
    let losses = []
    let tradeCount = 0
    const dayTotals = []

    Object.keys(entries).forEach((date) => {
      const e = entries[date]
      let dayTotal = 0
      let any = false
      e.trades.forEach((t) => {
        const p = tradePnl(t)
        if (p !== null) {
          tradeCount++
          total += p
          dayTotal += p
          any = true
          if (p > 0) wins.push(p)
          else if (p < 0) losses.push(p)
        }
      })
      if (any) dayTotals.push({ date, pnl: dayTotal })
    })

    const daysJournaled = Object.values(entries).filter(
      (e) => e.trades.length || (e.notes && e.notes.trim())
    ).length
    const winRate = wins.length + losses.length ? Math.round((wins.length / (wins.length + losses.length)) * 100) : null
    const sorted = [...dayTotals].sort((a, b) => b.pnl - a.pnl)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : null
    const streak = computeStreak(entries)

    return { total, winRate, tradeCount, daysJournaled, best, worst, avgWin, avgLoss, streak }
  }, [entries])

  const dateObj = useMemo(() => new Date(currentDate + 'T00:00:00'), [currentDate])

  return (
    <div className="wrap">
      <div className="header">
        <div className="brand">
          LEDGER<span>.</span>
        </div>
        <div className="header-right">
          <div>
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="streak">
            streak <b>{metrics.streak}</b>
          </div>
        </div>
      </div>

      <div className="grid">
        <TradesPanel
          currentDate={currentDate}
          dateObj={dateObj}
          entry={entry}
          onAddTrade={addTrade}
          onUpdateTrade={updateTrade}
          onDeleteTrade={deleteTrade}
          onNotesChange={updateNotes}
          onNavigateDate={navigateDate}
          onJumpToday={jumpToday}
          saveStatus={saveStatus}
        />
        <MetricsPanel metrics={metrics} />
      </div>

      <ActivityHeatmap entries={entries} currentDate={currentDate} onJumpDate={jumpToDate} />

      <MonthCalendar
        entries={entries}
        currentDate={currentDate}
        monthCursor={monthCursor}
        setMonthCursor={setMonthCursor}
        onJumpDate={jumpToDate}
      />
    </div>
  )
}
