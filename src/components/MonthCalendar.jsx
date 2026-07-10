import { dayPnl, dayWinStats, fmtMoney, todayStr } from '../utils.js'

function monthDateStr(y, m, d) {
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
}

export default function MonthCalendar({ entries, currentDate, monthCursor, setMonthCursor, onJumpDate }) {
  const { year, month } = monthCursor
  const monthName = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayStr()

  function navigateMonth(delta) {
    setMonthCursor((prev) => {
      let m = prev.month + delta
      let y = prev.year
      if (m < 0) {
        m = 11
        y--
      }
      if (m > 11) {
        m = 0
        y++
      }
      return { year: y, month: m }
    })
  }

  function jumpToCurrentMonth() {
    const now = new Date()
    setMonthCursor({ year: now.getFullYear(), month: now.getMonth() })
  }

  const cells = []
  for (let i = 0; i < firstDow; i++) {
    cells.push(<div key={'empty-' + i} className="month-cell empty" />)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = monthDateStr(year, month, d)
    const p = dayPnl(entries, dateStr)
    const { wins, losses } = dayWinStats(entries, dateStr)
    const winRate = wins + losses ? Math.round((wins / (wins + losses)) * 100) : null

    let classes = 'month-cell'
    if (dateStr === today) classes += ' today'
    if (dateStr === currentDate) classes += ' selected'
    if (p !== null) classes += p > 0 ? ' cell-gain' : p < 0 ? ' cell-loss' : ''

    cells.push(
      <div key={dateStr} className={classes} onClick={() => onJumpDate(dateStr)}>
        <div className="date-num">{d}</div>
        {p !== null && <div className={`day-pnl ${p > 0 ? 'pnl-pos' : p < 0 ? 'pnl-neg' : 'pnl-zero'}`}>{fmtMoney(p)}</div>}
        {winRate !== null && <div className="day-winrate">{winRate}% win</div>}
      </div>
    )
  }

  return (
    <div className="panel" style={{ marginTop: 18 }}>
      <div className="panel-title">
        <span>{monthName}</span>
        <div className="nav-btns">
          <button className="icon-btn" onClick={() => navigateMonth(-1)}>
            ‹
          </button>
          <button className="today-btn" onClick={jumpToCurrentMonth}>
            This month
          </button>
          <button className="icon-btn" onClick={() => navigateMonth(1)}>
            ›
          </button>
        </div>
      </div>
      <div className="month-cal-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="month-cal-grid">{cells}</div>
    </div>
  )
}
