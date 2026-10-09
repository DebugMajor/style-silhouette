import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import CustomCursor from './components/CustomCursor'
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
import VirtualTryOn from './pages/VirtualTryOn'
import AITrend from './pages/AITrend'

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
            <CustomCursor />
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
                    <Route path="virtual-try-on" element={<VirtualTryOn />} />
                    <Route path="ai-trend" element={<Navigate to="/dashboard/suggestions?tab=ai-trend" replace />} />
                </Route>

                <Route path="/ai-trend" element={<Navigate to="/dashboard/suggestions?tab=ai-trend" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
