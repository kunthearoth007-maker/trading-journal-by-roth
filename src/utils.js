// 1.00 lot = 100 units, so a 0.01 lot means a $1 price move = $1 P&L
export const LOT_MULTIPLIER = 100

export function todayStr(d) {
  const dt = d || new Date()
  return (
    dt.getFullYear() +
    '-' +
    String(dt.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(dt.getDate()).padStart(2, '0')
  )
}

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(dateStr, n) {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

export function fmtMoney(v) {
  const sign = v < 0 ? '-' : v > 0 ? '+' : ''
  return sign + '$' + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function tradePnl(t) {
  const entry = parseFloat(t.entry)
  const exit = parseFloat(t.exit)
  const size = parseFloat(t.size)
  if (isNaN(entry) || isNaN(exit) || isNaN(size)) return null
  const diff = t.dir === 'short' ? entry - exit : exit - entry
  return diff * size * LOT_MULTIPLIER
}

export function dayPnl(entries, date) {
  const e = entries[date]
  if (!e || !e.trades.length) return null
  let sum = 0
  let any = false
  e.trades.forEach((t) => {
    const p = tradePnl(t)
    if (p !== null) {
      sum += p
      any = true
    }
  })
  return any ? sum : null
}

export function dayWinStats(entries, date) {
  const e = entries[date]
  const stats = { wins: 0, losses: 0 }
  if (!e) return stats
  e.trades.forEach((t) => {
    const p = tradePnl(t)
    if (p !== null) {
      if (p > 0) stats.wins++
      else if (p < 0) stats.losses++
    }
  })
  return stats
}

export function getEntry(entries, date) {
  return entries[date] || { date, trades: [], notes: '' }
}
