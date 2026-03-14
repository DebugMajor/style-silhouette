import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handle = async (e) => {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid email or password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: 'var(--void)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,20,60,.18), transparent 65%)',
                filter: 'blur(60px)', pointerEvents: 'none', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', animation: 'breathe 6s ease-in-out infinite',
            }} />

            <div className="au" style={{
                width: '100%', maxWidth: '400px',
                padding: '44px 38px',
                background: 'rgba(8,3,3,.9)',
                border: '1px solid rgba(220,20,60,.15)',
                borderRadius: '2px',
                backdropFilter: 'blur(32px)',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 2,
            }}>
                {/* Watermark */}
                <div style={{
                    position: 'absolute', right: '-20px', bottom: '-30px',
                    fontFamily: 'var(--fp)', fontSize: '200px', fontWeight: 900, fontStyle: 'italic',
                    color: 'rgba(220,20,60,.04)', lineHeight: 1, pointerEvents: 'none',
                }}>S</div>

                <span style={{ fontFamily: 'var(--fp)', fontSize: '12px', fontStyle: 'italic', fontWeight: 700, color: 'var(--t3)', marginBottom: '28px', display: 'block' }}>
                    Style-A-Silhouette
                </span>

                <div className="ol-r" style={{ marginBottom: '8px' }}>Welcome back</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '38px', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.05, marginBottom: '30px' }}>
                    Sign into<br />your <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>studio</em>
                </div>

                {error && (
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--rh)', marginBottom: '16px', padding: '10px 14px', background: 'rgba(220,20,60,.07)', border: '1px solid rgba(220,20,60,.2)', borderRadius: '2px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handle}>
                    <div className="field">
                        <label className="lbl">Email</label>
                        <input
                            className="inp" type="email" placeholder="your@email.com" required
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                    </div>
                    <div className="field">
                        <label className="lbl">Password</label>
                        <input
                            className="inp" type="password" placeholder="••••••••" required
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        />
                    </div>
                    <button type="submit" className="btn bp" disabled={loading}
                        style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '12px' }}>
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '18px', fontFamily: 'var(--fg)', fontSize: '12px', color: 'var(--t3)' }}>
                    No account? <Link to="/register" style={{ color: 'var(--rh)', cursor: 'none' }}>Create one</Link>
                </div>
            </div>
        </div>
    )
}
