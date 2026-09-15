import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, AlertCircle } from 'lucide-react'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handle = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form.name, form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>
                        STYLE-A-SILHOUETTE
                    </Link>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                        Create your account
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Start your personalized fashion technology journey
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handle}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Alex Morgan"
                            required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="name@company.com"
                            required
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '12px', padding: '12px' }}>
                        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                        {!loading && <ArrowRight size={15} />}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
