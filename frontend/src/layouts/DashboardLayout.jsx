import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* Ambient orb — top right */}
            <div
                className="orb"
                style={{ width: '500px', height: '500px', background: 'rgba(160,8,32,.15)', top: '-150px', right: '-100px', position: 'fixed', zIndex: 0 }}
            />

            <Sidebar />

            <main style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'auto' }}>
                <Outlet />
            </main>
        </div>
    )
}
