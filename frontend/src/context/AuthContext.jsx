import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// ── Point axios at your Express backend ───────────────────
// Create frontend/.env and set: VITE_API_URL=http://localhost:5000
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.withCredentials = true

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // ── Rehydrate on mount ────────────────────────────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem('sas_user')
            if (stored) {
                const parsed = JSON.parse(stored)
                setUser(parsed)
                axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
            }
        } catch {
            localStorage.removeItem('sas_user')
        }
        setLoading(false)
    }, [])

    // ── Persist user + set auth header ───────────────────
    const persist = (data) => {
        localStorage.setItem('sas_user', JSON.stringify(data))
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data)
    }

    // ── Auth actions ──────────────────────────────────────
    const login = async (email, password) => {
        // throws on 4xx/5xx — caught in Login.jsx
        const { data } = await axios.post('/api/auth/login', { email, password })
        persist(data)
        return data
    }

    const register = async (name, email, password) => {
        const { data } = await axios.post('/api/auth/register', { name, email, password })
        persist(data)
        return data
    }

    const logout = () => {
        localStorage.removeItem('sas_user')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
