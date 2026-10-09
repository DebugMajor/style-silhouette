import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'

/**
 * A single chat message bubble, adapted from the fashion-recommender Next.js ChatMessage component.
 * Supports text messages and optional image attachments.
 */
export default function ChatBubble({ message }) {
    const isUser = message.role === 'user'
    const contentRef = useRef(null)

    // Auto-scroll into view when new messages appear
    useEffect(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [])

    return (
        <div
            ref={contentRef}
            style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
                padding: '4px 0',
            }}
        >
            {/* Avatar */}
            <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: isUser ? 'var(--accent)' : 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {isUser
                    ? <User size={16} color="#fff" />
                    : <Bot size={16} color="var(--accent)" />
                }
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: '72%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: isUser ? 'flex-end' : 'flex-start',
            }}>
                {/* Image attachments */}
                {message.images && message.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {message.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Attachment ${idx + 1}`}
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Text content */}
                {message.content && (
                    <div style={{
                        background: isUser ? 'var(--accent)' : 'var(--bg-card)',
                        color: isUser ? '#fff' : 'var(--text-primary)',
                        border: `1px solid ${isUser ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}>
                        {message.content}
                    </div>
                )}

                {/* Loading dots for typing indicator */}
                {message.isTyping && (
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '18px 18px 18px 4px',
                        padding: '12px 18px',
                        display: 'flex',
                        gap: '5px',
                        alignItems: 'center',
                    }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
