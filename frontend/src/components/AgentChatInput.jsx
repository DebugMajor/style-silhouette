import { useRef, useState } from 'react'
import { ImagePlus, Send, X } from 'lucide-react'

/**
 * Chat input bar adapted from fashion-recommender's ChatInput.tsx.
 * Supports text + multiple image attachments.
 */
export default function AgentChatInput({ onSend, disabled }) {
    const [text, setText] = useState('')
    const [images, setImages] = useState([])   // array of data-URL strings
    const fileRef = useRef(null)
    const textareaRef = useRef(null)

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const readers = files.map(file =>
            new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.readAsDataURL(file)
            })
        )
        const dataUrls = await Promise.all(readers)
        setImages(prev => [...prev, ...dataUrls])
        e.target.value = ''
    }

    const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx))

    const handleSend = () => {
        const trimmed = text.trim()
        if (!trimmed && images.length === 0) return
        onSend({ content: trimmed, images })
        setText('')
        setImages([])
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Auto-resize textarea
    const handleInput = (e) => {
        setText(e.target.value)
        const ta = e.target
        ta.style.height = 'auto'
        ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }

    return (
        <div style={{
            borderTop: '1px solid var(--border)',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
        }}>
            {/* Image previews */}
            {images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <img
                                src={img}
                                alt={`Preview ${idx + 1}`}
                                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <button
                                onClick={() => removeImage(idx)}
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 18, height: 18,
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={10} color="#fff" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '8px 12px',
            }}>
                {/* Image attach button */}
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled}
                    title="Attach images"
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: '4px', flexShrink: 0,
                        display: 'flex', alignItems: 'center',
                    }}
                >
                    <ImagePlus size={18} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKey}
                    disabled={disabled}
                    placeholder="Ask about outfit ideas, request a try-on, or describe a style…"
                    rows={1}
                    style={{
                        flex: 1,
                        resize: 'none',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        fontFamily: 'inherit',
                        paddingTop: '3px',
                        overflowY: 'auto',
                    }}
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={disabled || (!text.trim() && images.length === 0)}
                    title="Send (Enter)"
                    style={{
                        background: 'var(--accent)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: disabled || (!text.trim() && images.length === 0) ? 'not-allowed' : 'pointer',
                        opacity: disabled || (!text.trim() && images.length === 0) ? 0.4 : 1,
                        flexShrink: 0,
                        transition: 'opacity .2s',
                    }}
                >
                    <Send size={15} color="#fff" />
                </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                Shift+Enter for new line · Attach images for visual queries · Powered by LangGraph Agent
            </div>
        </div>
    )
}
