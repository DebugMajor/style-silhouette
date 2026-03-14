/**
 * AnalysisLoader
 * Shows a fullscreen/inline AI processing animation.
 *
 * Props:
 *  message  {string}  – optional override message
 *  inline   {bool}    – if true, fits inside a parent container instead of fixed overlay
 */
export default function AnalysisLoader({ message = 'Analysing your outfit…', inline = false }) {
    const base = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        background: inline ? 'transparent' : 'rgba(3,3,3,.92)',
        backdropFilter: inline ? 'none' : 'blur(24px)',
    }

    const containerStyle = inline
        ? { ...base, padding: '48px 24px' }
        : { ...base, position: 'fixed', inset: 0, zIndex: 900 }

    return (
        <div style={containerStyle}>
            {/* Rotating ring */}
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg width="80" height="80" viewBox="0 0 80 80"
                    style={{ animation: 'rotateSlow 2s linear infinite' }}>
                    <style>{`@keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                    <circle cx="40" cy="40" r="32" fill="none"
                        stroke="rgba(220,20,60,.12)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="32" fill="none"
                        stroke="var(--r)" strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="201" strokeDashoffset="150" />
                </svg>

                {/* Inner pulse dot */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: 'var(--r)',
                        animation: 'pulse 1.6s ease-in-out infinite',
                    }} />
                </div>
            </div>

            {/* Scan line */}
            <div style={{
                width: '200px', height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--r), transparent)',
                boxShadow: '0 0 10px rgba(220,20,60,.4)',
                animation: 'shimmer 1.8s ease-in-out infinite',
            }}>
                <style>{`@keyframes shimmer{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontFamily: 'var(--fp)', fontSize: '20px', fontStyle: 'italic',
                    color: 'var(--t1)', marginBottom: '8px',
                }}>{message}</div>
                <div style={{
                    fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em',
                    textTransform: 'uppercase', color: 'var(--r)',
                    animation: 'flicker 3s ease-in-out infinite',
                }}>AI Engine Running</div>
            </div>

            {/* Progress steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
                {[
                    { label: 'Detecting garments', delay: '0s' },
                    { label: 'Scoring colour harmony', delay: '.4s' },
                    { label: 'Checking occasion fit', delay: '.8s' },
                    { label: 'Generating suggestion', delay: '1.2s' },
                ].map(({ label, delay }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0, animation: `fadeUp .5s var(--ease) ${delay} forwards` }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--r)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
