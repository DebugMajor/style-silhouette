import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Camera from './pages/Camera'
import Upload from './pages/Upload'
import Wardrobe from './pages/Wardrobe'
import Suggestions from './pages/Suggestions'
import Voice from './pages/Voice'

/* ── Lerp cursor controller ─────────────────────────────── */
function CursorController() {
    useEffect(() => {
        const cur = document.getElementById('cursor')
        const ring = document.getElementById('cursor-ring')
        if (!cur || !ring) return

        let mx = 0, my = 0, rx = 0, ry = 0, rafId

        const onMove = (e) => {
            mx = e.clientX; my = e.clientY
            cur.style.left = mx + 'px'
            cur.style.top = my + 'px'
        }

        const lerp = () => {
            rx += (mx - rx) * 0.12
            ry += (my - ry) * 0.12
            ring.style.left = rx + 'px'
            ring.style.top = ry + 'px'
            rafId = requestAnimationFrame(lerp)
        }

        document.addEventListener('mousemove', onMove)
        rafId = requestAnimationFrame(lerp)
        return () => {
            document.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(rafId)
        }
    }, [])
    return null
}

/* ── Protected route guard ──────────────────────────────── */
function PrivateRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/login" replace />
}

/* ── Public-only route (redirect logged-in users) ───────── */
function PublicRoute({ children }) {
    const { user } = useAuth()
    return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
    return (
        <BrowserRouter>
            <CursorController />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />

                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute><Register /></PublicRoute>
                } />

                {/* Protected — nested dashboard */}
                <Route path="/dashboard" element={
                    <PrivateRoute><DashboardLayout /></PrivateRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="camera" element={<Camera />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="wardrobe" element={<Wardrobe />} />
                    <Route path="suggestions" element={<Suggestions />} />
                    <Route path="voice" element={<Voice />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
