/**
 * OutfitResult — reusable result panel
 *
 * Props:
 *  result  {object|null}  – API response shape:
 *    { score, label, items[], recommendation, scores:{ colour, occasion, trend } }
 *  empty   {bool}         – if true shows placeholder state
 */

const pnl = {
    padding: '20px',
    background: 'rgba(8,3,3,.85)',
    border: '1px solid var(--b)',
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden',
}

const topLine = {
    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
    background: 'linear-gradient(90deg,transparent,var(--r),transparent)',
    opacity: .4,
}

export default function OutfitResult({ result = null, gradientId = 'rg-result' }) {
    const empty = !result
    const score = result?.score ?? 0
    const dashOffset = 251.2 - (251.2 * score / 100)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ── Score ring ── */}
            <div style={{ ...pnl, display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b0020" />
                                <stop offset="100%" stopColor="#ff2d5b" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={`url(#${gradientId})`} strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray="251.2"
                            strokeDashoffset={empty ? 251.2 : dashOffset}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1)' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--fp)', fontSize: '26px', fontWeight: 700, fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1 }}>
                            {empty ? '—' : score}
                        </span>
                        <span style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--r)' }}>score</span>
                    </div>
                </div>
                <div>
                    <div className="ol" style={{ marginBottom: '8px' }}>Style Score</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '22px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '4px' }}>
                        {empty ? 'Awaiting analysis' : result.label ?? 'Excellent Coordination'}
                    </div>
                    {!empty && (
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--r)' }}>
                            Top 15% of analysed outfits
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detected items ── */}
            <div style={pnl}>
                <div style={topLine} />
                <div className="ol" style={{ marginBottom: '14px' }}>Detected Items</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {empty
                        ? <span style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t3)' }}>Items detected after analysis</span>
                        : (result.items ?? []).map(item => <span key={item} className="badge">{item}</span>)
                    }
                </div>
            </div>

            {/* ── AI recommendation ── */}
            <div style={pnl}>
                <div style={topLine} />
                <div className="ol" style={{ marginBottom: '4px' }}>AI Recommendation</div>
                <blockquote style={{
                    fontFamily: 'var(--fp)', fontSize: '15px', fontStyle: 'italic',
                    color: empty ? 'var(--t3)' : 'var(--t2)', lineHeight: 1.75,
                    borderLeft: '2px solid var(--r)', paddingLeft: '14px', marginTop: '10px',
                }}>
                    {empty
                        ? '"Analyse an outfit to receive a personalised recommendation."'
                        : `"${result.recommendation ?? 'Strong coordination. Consider elevating footwear to complete this look.'}"`}
                </blockquote>
            </div>

            {/* ── Compatibility matrix ── */}
            <div style={pnl}>
                <div style={topLine} />
                <div className="ol" style={{ marginBottom: '14px' }}>Compatibility Matrix</div>
                {[
                    { label: 'Colour Harmony', key: 'colour' },
                    { label: 'Occasion Match', key: 'occasion' },
                    { label: 'Trend Alignment', key: 'trend' },
                ].map(({ label, key }) => {
                    const pct = empty ? 0 : (result?.scores?.[key] ?? 80)
                    return (
                        <div key={key} className="prog-wrap">
                            <div className="prog-label">
                                <span>{label}</span>
                                <strong>{empty ? '—' : `${pct}%`}</strong>
                            </div>
                            <div className="prog-track">
                                <div className="prog-fill" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
