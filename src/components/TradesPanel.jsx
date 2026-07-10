import { tradePnl, fmtMoney, todayStr } from '../utils.js'

function pnlClass(p) {
  if (p === null) return 'pnl-zero'
  if (p > 0) return 'pnl-pos'
  if (p < 0) return 'pnl-neg'
  return 'pnl-zero'
}

function TradeRow({ trade, onUpdate, onDelete }) {
  const p = tradePnl(trade)
  const pText = p === null ? '—' : fmtMoney(p)

  return (
    <div className="trade-row">
      <input
        value={trade.symbol}
        placeholder="AAPL"
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => onUpdate(trade.id, 'symbol', e.target.value)}
      />
      <select value={trade.dir} onChange={(e) => onUpdate(trade.id, 'dir', e.target.value)}>
        <option value="long">Long</option>
        <option value="short">Short</option>
      </select>
      <select value={trade.session || ''} onChange={(e) => onUpdate(trade.id, 'session', e.target.value)}>
        <option value="">—</option>
        <option value="asian">Asian</option>
        <option value="london">London</option>
        <option value="newyork">New York</option>
      </select>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={trade.entry}
        placeholder="Entry"
        onChange={(e) => onUpdate(trade.id, 'entry', e.target.value)}
      />
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={trade.exit}
        placeholder="Exit"
        onChange={(e) => onUpdate(trade.id, 'exit', e.target.value)}
      />
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={trade.size}
        placeholder="0.01"
        onChange={(e) => onUpdate(trade.id, 'size', e.target.value)}
      />
      <div className={`pnl-cell num ${pnlClass(p)}`}>{pText}</div>
      <button className="del-btn" onClick={() => onDelete(trade.id)} aria-label="Delete trade">
        ×
      </button>
    </div>
  )
}

export default function TradesPanel({
  currentDate,
  dateObj,
  entry,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  onNotesChange,
  onNavigateDate,
  onJumpToday,
  saveStatus,
}) {
  return (
    <div>
      <div className="panel">
        <div className="datebar">
          <div>
            <div className="day">
              {dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="sub">{dateObj.toLocaleDateString(undefined, { weekday: 'long' })}</div>
          </div>
          <div className="nav-btns">
            <button className="today-btn" onClick={onJumpToday}>
              Today
            </button>
            <button className="icon-btn" onClick={() => onNavigateDate(-1)}>
              ‹
            </button>
            <button className="icon-btn" onClick={() => onNavigateDate(1)}>
              ›
            </button>
          </div>
        </div>

        <div className="panel-title">Trades</div>
        {entry.trades.length > 0 && (
          <div className="trades-head">
            <div>Symbol</div>
            <div>Side</div>
            <div>Session</div>
            <div>Entry</div>
            <div>Exit</div>
            <div>Lots</div>
            <div style={{ textAlign: 'right' }}>P&amp;L</div>
            <div></div>
          </div>
        )}
        <div>
          {entry.trades.length === 0 ? (
            <div className="empty-trades">No trades logged for this day yet.</div>
          ) : (
            entry.trades.map((t) => (
              <TradeRow key={t.id} trade={t} onUpdate={onUpdateTrade} onDelete={onDeleteTrade} />
            ))
          )}
        </div>
        <button className="add-trade" onClick={onAddTrade}>
          + Add trade
        </button>

        <hr className="tear" />

        <div className="panel-title">Notes &amp; lessons</div>
        <textarea
          value={entry.notes || ''}
          placeholder="What worked, what didn't, what you'll do differently tomorrow..."
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <div className="save-hint">{saveStatus}</div>
      </div>
    </div>
  )
}
