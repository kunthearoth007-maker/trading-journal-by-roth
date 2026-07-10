import { useMemo } from 'react'
import { addDays, dayPnl, fmtMoney, parseDate, todayStr, tradePnl } from '../utils.js'

const WEEKS = 12

export default function ActivityHeatmap({ entries, currentDate, onJumpDate }) {
  const { dates, maxAbs, stats } = useMemo(() => {
    const totalDays = WEEKS * 7
    const today = todayStr()
    const todayDate = parseDate(today)
    const endPad = 6 - todayDate.getDay()
    const endDate = addDays(today, endPad)
    const startDate = addDays(endDate, -(totalDays - 1))

    const dates = []
    let cursor = startDate
    for (let i = 0; i < totalDays; i++) {
      dates.push(cursor)
      cursor = addDays(cursor, 1)
    }

    let maxAbs = 0
    let total = 0
    let wins = 0
    let losses = 0
    let greenDays = 0
    let redDays = 0

    dates.forEach((d) => {
      const p = dayPnl(entries, d)
      if (p !== null) maxAbs = Math.max(maxAbs, Math.abs(p))
      const e = entries[d]
      if (e) {
        e.trades.forEach((t) => {
          const tp = tradePnl(t)
          if (tp !== null) {
            total += tp
            if (tp > 0) wins++
            else if (tp < 0) losses++
          }
        })
      }
      if (p !== null) {
        if (p > 0) greenDays++
        else if (p < 0) redDays++
      }
    })

    const winRate = wins + losses ? Math.round((wins / (wins + losses)) * 100) : null

    return { dates, maxAbs, stats: { total, winRate, greenDays, redDays } }
  }, [entries])

  const today = todayStr()

  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = null
    for (let w = 0; w < WEEKS; w++) {
      const colDate = dates[w * 7]
      const m = parseDate(colDate).toLocaleDateString(undefined, { month: 'short' })
      labels.push(m !== lastMonth ? m : '')
      lastMonth = m
    }
    return labels
  }, [dates])

  return (
    <div className="panel" style={{ marginTop: 18 }}>
      <div className="panel-title">
        Activity{' '}
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
          last {WEEKS} weeks — click a day to jump there
        </span>
      </div>

      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <div className="label">Period P&amp;L</div>
          <div className={`val ${stats.total > 0 ? 'pnl-pos' : stats.total < 0 ? 'pnl-neg' : ''}`}>
            {fmtMoney(stats.total)}
          </div>
        </div>
        <div className="heatmap-stat">
          <div className="label">Win rate</div>
          <div className="val">{stats.winRate === null ? '—' : stats.winRate + '%'}</div>
        </div>
        <div className="heatmap-stat">
          <div className="label">Green / red days</div>
          <div className="val">
            <span className="pnl-pos">{stats.greenDays}</span> / <span className="pnl-neg">{stats.redDays}</span>
          </div>
        </div>
      </div>

      <div className="heatmap-scroll">
        <div className="month-labels" style={{ marginLeft: 38 }}>
          {monthLabels.map((m, i) => (
            <div key={i} style={{ width: 26 }}>
              {m}
            </div>
          ))}
        </div>
        <div className="heatmap-body">
          <div className="weekday-labels" style={{ width: 32 }}>
            <div></div>
            <div>Mon</div>
            <div></div>
            <div>Wed</div>
            <div></div>
            <div>Fri</div>
            <div></div>
          </div>
          <div className="heatmap">
            {dates.map((d) => {
              const p = dayPnl(entries, d)
              let bg = 'var(--border-soft)'
              if (p !== null && maxAbs > 0) {
                const ratio = Math.min(Math.abs(p) / maxAbs, 1)
                if (p > 0) bg = ratio > 0.5 ? 'var(--gain)' : 'var(--gain-dim)'
                else if (p < 0) bg = ratio > 0.5 ? 'var(--loss)' : 'var(--loss-dim)'
                else bg = 'var(--border)'
              } else if (entries[d] && (entries[d].notes || '').trim()) {
                bg = 'var(--border)'
              }
              const isToday = d === today
              const title = d + (p !== null ? ' — ' + fmtMoney(p) : entries[d] ? ' — notes only' : ' — no entry')
              return (
                <div
                  key={d}
                  className={`cell${isToday ? ' today-cell' : ''}`}
                  style={{ background: bg }}
                  title={title}
                  onClick={() => onJumpDate(d)}
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>loss</span>
        <div className="legend-cell" style={{ background: 'var(--loss)' }}></div>
        <div className="legend-cell" style={{ background: 'var(--loss-dim)' }}></div>
        <div className="legend-cell" style={{ background: 'var(--border-soft)' }}></div>
        <div className="legend-cell" style={{ background: 'var(--gain-dim)' }}></div>
        <div className="legend-cell" style={{ background: 'var(--gain)' }}></div>
        <span>gain</span>
      </div>
    </div>
  )
}
