import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
    Bot,
    Plus,
    Trash2,
    Sparkles,
    ChevronDown,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import AgentChatInput from '../components/AgentChatInput'

const API = '/api/agent'


function formatAgentError(err) {
    const body = err.response?.data
    const detail = body?.detail
    if (Array.isArray(detail)) {
        return detail.map(item => {
            const field = Array.isArray(item.loc) ? item.loc.filter(part => part !== 'body').join('.') : ''
            return field ? `${field}: ${item.msg || 'Invalid value'}` : (item.msg || 'Invalid request')
        }).join('; ')
    }
    if (typeof detail === 'string') return detail
    return body?.message || body?.error || err.message || 'Request failed.'
}

// Suggested prompts to help new users get started
const SUGGESTIONS = [
    { label: '✨ Outfit idea', prompt: 'Give me an outfit idea for a casual day out in summer.' },
    { label: '👗 Virtual Try-On', prompt: 'I want to try on a garment virtually. How do I do this?' },
    { label: '🎨 Color advice', prompt: 'What colors would work well together for a business casual look?' },
    { label: '🌐 Search trends', prompt: 'Search the internet for the latest fashion trends in 2025.' },
    { label: '👚 Wardrobe match', prompt: 'Help me find an outfit from my wardrobe for a dinner date.' },
]

export default function AIAgent() {
    const [sessionId, setSessionId] = useState(null)
    const [sessions, setSessions] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [agentDown, setAgentDown] = useState(false)
    const [showSessions, setShowSessions] = useState(false)
    const messagesEndRef = useRef(null)

    // ── Scroll to bottom when messages change ─────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── Load sessions list ─────────────────────────────────────
    const loadSessions = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/sessions`)
            setSessions(Array.isArray(data) ? data : [])
            setAgentDown(false)
        } catch (err) {
            if (err.response?.status === 503) setAgentDown(true)
            setSessions([])
        }
    }, [])

    useEffect(() => { loadSessions() }, [loadSessions])

    // ── Start a new session ────────────────────────────────────
    const startNewSession = () => {
        setSessionId(null)
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm your AI fashion agent. I can recommend outfits, search the web for trends, retrieve items from your wardrobe, and even help you try on garments virtually. What can I help you with today?",
        }])
    }

    // ── Load an existing session ───────────────────────────────
    const loadSession = async (id) => {
        setSessionId(id)
        setShowSessions(false)
        try {
            const { data } = await axios.get(`${API}/sessions/${id}`)
            const history = data?.messages || []
            setMessages(history.map((m, i) => ({
                id: `${id}-${i}`,
                role: m.role,
                content: m.content,
                images: m.images || [],
            })))
        } catch {
            startNewSession()
        }
    }

    // ── Delete a session ───────────────────────────────────────
    const deleteSession = async (id, e) => {
        e.stopPropagation()
        try {
            await axios.delete(`${API}/sessions/${id}`)
            if (sessionId === id) startNewSession()
            loadSessions()
        } catch { /* ignore */ }
    }

    // ── Send a message ─────────────────────────────────────────
    const handleSend = async ({ content, images }) => {
        if (loading) return

        // Add user message to UI immediately
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content,
            images,
        }
        // Add typing indicator
        const typingMsg = { id: 'typing', role: 'assistant', isTyping: true }
        setMessages(prev => [...prev, userMsg, typingMsg])
        setLoading(true)

        try {
            const payload = {
                query: content,
                session_id: sessionId,
                // The FastAPI ChatRequest expects image data URLs as strings.
                images,
            }
            const { data } = await axios.post(`${API}/chat`, payload)

            const agentMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data?.answer || data?.response || data?.message || 'Done!',
                images: data?.images || [],
            }

            // Update session ID if new session was created
            if (data?.session_id && !sessionId) {
                setSessionId(data.session_id)
                loadSessions()
            }

            setMessages(prev => [...prev.filter(m => m.id !== 'typing'), agentMsg])
            setAgentDown(false)
        } catch (err) {
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: err.response?.status === 503
                    ? '⚠️ The AI Agent service is not running. Start the Python agent on port 8000 and try again.'
                    : `❌ Error: ${formatAgentError(err)}`,
            }
            if (err.response?.status === 503) setAgentDown(true)
            setMessages(prev => [...prev.filter(m => m.id !== 'typing'), errorMsg])
        } finally {
            setLoading(false)
        }
    }

    // ── Init with welcome message ──────────────────────────────
    useEffect(() => {
        if (messages.length === 0) startNewSession()
    }, []) // eslint-disable-line

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden', position: 'relative' }}>

            {/* ── Sessions Sidebar ─────────────────────────────── */}
            <aside style={{
                width: showSessions ? 260 : 0,
                minWidth: showSessions ? 260 : 0,
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                borderRight: showSessions ? '1px solid var(--border)' : 'none',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>
                    Past Sessions
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {sessions.length === 0
                        ? <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '12px 8px' }}>No sessions yet.</div>
                        : sessions.map(s => (
                            <div
                                key={s.id || s._id}
                                onClick={() => loadSession(s.id || s._id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: sessionId === (s.id || s._id) ? 'var(--bg-card)' : 'transparent',
                                    marginBottom: '2px',
                                    transition: 'background .15s',
                                }}
                            >
                                <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.title || s.id || 'Session'}
                                </span>
                                <button
                                    onClick={e => deleteSession(s.id || s._id, e)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                                >
                                    <Trash2 size={13} color="var(--text-muted)" />
                                </button>
                            </div>
                        ))
                    }
                </div>
            </aside>

            {/* ── Main Chat Area ───────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bot size={18} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                AI Fashion Agent
                            </div>
                            <div style={{ fontSize: '0.72rem', color: agentDown ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: agentDown ? '#ef4444' : '#22c55e' }} />
                                {agentDown ? 'Agent offline — start Python server' : 'LangGraph · Multimodal RAG · Web Search'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShowSessions(s => !s)}
                            className="btn btn-secondary btn-sm"
                            title="View past sessions"
                        >
                            <ChevronDown size={14} />
                            Sessions
                        </button>
                        <button onClick={startNewSession} className="btn btn-secondary btn-sm" title="New conversation">
                            <Plus size={14} /> New Chat
                        </button>
                    </div>
                </div>

                {/* Agent offline warning */}
                {agentDown && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        borderBottom: '1px solid rgba(239,68,68,0.2)',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.82rem',
                        color: '#ef4444',
                    }}>
                        <AlertTriangle size={14} />
                        AI Agent is offline. Run <code style={{ background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 4 }}>cd ai-agent && uv run uvicorn src.backend.app.main:app --port 8000</code> to start it.
                        <button onClick={loadSessions} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <RefreshCw size={13} />
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    {messages.map(msg => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick suggestion chips — only show when conversation is empty (welcome msg only) */}
                {messages.length <= 1 && (
                    <div style={{
                        padding: '0 20px 14px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                    }}>
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s.label}
                                onClick={() => handleSend({ content: s.prompt, images: [] })}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '20px',
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all .15s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Sparkles size={11} color="var(--accent)" />
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <AgentChatInput onSend={handleSend} disabled={loading} />
            </div>
        </div>
    )
}
