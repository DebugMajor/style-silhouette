/* ── Suggestions.jsx ─────────────────────────────────────────
   Apply the same SAS_Ultra panel pattern:
   - outer div: padding 36px 40px, zIndex 1
   - page header: ol-r overline + Playfair title
   - content in glass panels: background rgba(8,3,3,.8), border 1px solid var(--b), borderRadius 2px
   ─────────────────────────────────────────────────────── */

export default function Suggestions() {
    return (
        <div style={{ padding: '36px 40px', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '24px' }}>
                <div className="ol-r">Suggestions</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '36px', fontWeight: 700, fontStyle: 'italic', marginTop: '6px' }}>
                    <span style={{ color: 'var(--r)' }}>Suggestions</span> Studio
                </div>
            </div>

            <div style={{ padding: '40px', background: 'rgba(8,3,3,.8)', border: '1px solid var(--b)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '18px', fontStyle: 'italic', color: 'var(--t2)', marginBottom: '8px' }}>
                        Suggestions — coming in Phase 2
                    </div>
                    <div className="ol">Feature under development</div>
                </div>
            </div>
        </div>
    )
}
