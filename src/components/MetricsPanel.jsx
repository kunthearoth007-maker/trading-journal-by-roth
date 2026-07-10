import { fmtMoney } from '../utils.js'

function Row({ label, value, className = '' }) {
  return (
    <div className="metric-row">
      <div className="metric-label">{label}</div>
      <div className={`metric-val num ${className}`}>{value}</div>
    </div>
  )
}

export default function MetricsPanel({ metrics }) {
  const { total, winRate, tradeCount, daysJournaled, best, worst, avgWin, avgLoss } = metrics

  return (
    <div className="panel">
      <div className="panel-title">Metrics</div>
      <Row label="Total P&L" value={fmtMoney(total)} className={total > 0 ? 'pnl-pos' : total < 0 ? 'pnl-neg' : ''} />
      <Row label="Win rate" value={winRate === null ? '—' : winRate + '%'} />
      <Row label="Trades logged" value={tradeCount} />
      <Row label="Days journaled" value={daysJournaled} />
      <Row label="Best day" value={best ? fmtMoney(best.pnl) : '—'} className={best ? 'pnl-pos' : ''} />
      <Row label="Worst day" value={worst ? fmtMoney(worst.pnl) : '—'} className={worst && worst.pnl < 0 ? 'pnl-neg' : ''} />
      <Row label="Avg win" value={avgWin === null ? '—' : fmtMoney(avgWin)} className={avgWin !== null ? 'pnl-pos' : ''} />
      <Row label="Avg loss" value={avgLoss === null ? '—' : fmtMoney(avgLoss)} className={avgLoss !== null ? 'pnl-neg' : ''} />
    </div>
  )
}
