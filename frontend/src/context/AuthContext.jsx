import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// ── Point axios at your Express backend ───────────────────
// Create frontend/.env and set: VITE_API_URL=http://localhost:5000
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.withCredentials = true

const AuthContext = createContext(null)

// ── Axios 401 Interceptor for automatic stale token handling ───
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('sas_user')
            delete axios.defaults.headers.common['Authorization']
            if (error.config && !error.config._retry) {
                error.config._retry = true
                if (error.config.headers) {
                    delete error.config.headers['Authorization']
                }
                return axios(error.config)
            }
        }
        return Promise.reject(error)
    }
)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // ── Rehydrate on mount ────────────────────────────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem('sas_user')
            if (stored) {
                const parsed = JSON.parse(stored)
                const token = typeof parsed?.token === 'string' ? parsed.token.trim() : ''

                if (token && token !== 'undefined' && token !== 'null') {
                    setUser(parsed)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                } else {
                    // Remove stale/malformed sessions instead of sending "Bearer undefined".
                    localStorage.removeItem('sas_user')
                    delete axios.defaults.headers.common['Authorization']
                    setUser(null)
                }
            } else {
                delete axios.defaults.headers.common['Authorization']
            }
        } catch {
            localStorage.removeItem('sas_user')
            delete axios.defaults.headers.common['Authorization']
            setUser(null)
        }
        setLoading(false)
    }, [])

    // ── Persist user + set auth header ───────────────────
    const persist = (data) => {
        const token = typeof data?.token === 'string' ? data.token.trim() : ''
        if (!token || token === 'undefined' || token === 'null') {
            throw new Error('The server did not return a valid session token. Please sign in again.')
        }

        const session = { ...data, token }
        localStorage.setItem('sas_user', JSON.stringify(session))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(session)
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
