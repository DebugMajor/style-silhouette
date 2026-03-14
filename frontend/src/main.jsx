import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            {/* Persistent global elements from SAS_Ultra */}
            <div id="cursor" />
            <div id="cursor-ring" />
            <div id="grid-bg" />
            <App />
        </AuthProvider>
    </StrictMode>
)
