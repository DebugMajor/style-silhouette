import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const AIStyleCharacter = forwardRef(({ state = 'IDLE', activeText = '', onSpeechEnd }, ref) => {
    const [characterState, setCharacterState] = useState(state) // IDLE | LISTENING | THINKING | SPEAKING | PAUSED
    const [audioUrl, setAudioUrl] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(1.0)
    const [noticeMsg, setNoticeMsg] = useState(null)

    const audioRef = useRef(null)

    // Sync state prop changes
    useEffect(() => {
        setCharacterState(state)
    }, [state])

    // Update volume on audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    // Handle ElevenLabs audio stream or Web Speech fallback
    const playAudioStream = (audioBlob, textPrompt) => {
        setNoticeMsg(null)

        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }

        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob)
            setAudioUrl(url)
            const audio = new Audio(url)
            audio.volume = volume
            audioRef.current = audio

            audio.onplay = () => {
                setIsPlaying(true)
                setCharacterState('SPEAKING')
            }

            audio.onpause = () => {
                setIsPlaying(false)
                setCharacterState('PAUSED')
            }

            audio.onended = () => {
                setIsPlaying(false)
                setCharacterState('IDLE')
                if (onSpeechEnd) onSpeechEnd()
            }

            audio.onerror = (err) => {
                console.warn('[AIStyleCharacter] Audio playback error:', err)
                fallbackWebSpeech(textPrompt)
            }

            audio.play().catch(() => {
                fallbackWebSpeech(textPrompt)
            })
        } else {
            fallbackWebSpeech(textPrompt)
        }
    }

    const fallbackWebSpeech = (textPrompt) => {
        if (!textPrompt || typeof window === 'undefined' || !window.speechSynthesis) {
            setNoticeMsg('Voice is temporarily unavailable.')
            setCharacterState('IDLE')
            return
        }

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(textPrompt)
        utterance.rate = 1.0
        utterance.pitch = 1.1

        const voices = window.speechSynthesis.getVoices()
        const femaleVoice = voices.find(v => (
            v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')
        )) || voices.find(v => v.lang.startsWith('en'))

        if (femaleVoice) utterance.voice = femaleVoice

        utterance.onstart = () => {
            setIsPlaying(true)
            setCharacterState('SPEAKING')
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setCharacterState('IDLE')
            if (onSpeechEnd) onSpeechEnd()
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setNoticeMsg('Voice is temporarily unavailable.')
            setCharacterState('IDLE')
        }

        window.speechSynthesis.speak(utterance)
    }

    // Controls
    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
        } else if (window.speechSynthesis?.speaking) {
            if (isPlaying) {
                window.speechSynthesis.pause()
                setIsPlaying(false)
                setCharacterState('PAUSED')
            } else {
                window.speechSynthesis.resume()
                setIsPlaying(true)
                setCharacterState('SPEAKING')
            }
        }
    }

    const handleReplay = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
        }
    }

    // Expose control methods via ref
    useImperativeHandle(ref, () => ({
        playAudioStream,
        fallbackWebSpeech,
        setState: (s) => setCharacterState(s)
    }))

    return (
        <div style={{
            background: 'rgba(8, 3, 3, 0.88)',
            border: '1px solid rgba(220, 20, 60, 0.25)',
            borderRadius: '4px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '520px'
        }}>
            {/* HUD Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--r)' }}>
                    AI STYLE STYLIST
                </span>

                {/* Status Indicator Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: 'rgba(5, 2, 2, 0.8)',
                    border: '1px solid rgba(220,20,60,0.3)',
                    fontFamily: 'var(--fm)',
                    fontSize: '9px',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: 'var(--t1)'
                }}>
                    <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: characterState === 'SPEAKING' ? '#10b981' :
                                    characterState === 'THINKING' ? '#f59e0b' :
                                    characterState === 'LISTENING' ? '#38bdf8' :
                                    characterState === 'PAUSED' ? '#a855f7' : 'var(--r)',
                        animation: (characterState === 'SPEAKING' || characterState === 'THINKING' || characterState === 'LISTENING') ? 'pulse 1.2s ease-in-out infinite' : 'none'
                    }} />
                    <span>
                        {characterState === 'SPEAKING' ? 'SPEAKING…' :
                         characterState === 'THINKING' ? 'THINKING…' :
                         characterState === 'LISTENING' ? 'LISTENING…' :
                         characterState === 'PAUSED' ? 'PAUSED' : 'AI STYLIST ONLINE'}
                    </span>
                </div>
            </div>

            {/* AI Character Image Container with Animated Glow & Floating */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '320px',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '8px 0',
                transition: 'all 0.4s ease'
            }}>
                {/* Glowing Aura Rings on Speaking/Thinking */}
                <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '12px',
                    background: characterState === 'SPEAKING' ? 'radial-gradient(circle, rgba(220,20,60,0.3) 0%, rgba(236,72,153,0.15) 50%, transparent 80%)' :
                                characterState === 'THINKING' ? 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 75%)' :
                                characterState === 'LISTENING' ? 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 75%)' : 'none',
                    animation: characterState === 'SPEAKING' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    pointerEvents: 'none'
                }} />

                {/* Character Image */}
                <img
                    src="/assets/ai-stylist.png"
                    alt="AI Fashion Stylist"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        filter: characterState === 'SPEAKING' ? 'drop-shadow(0 0 16px rgba(220,20,60,0.5))' : 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
                        transform: characterState === 'SPEAKING' ? 'scale(1.02) translateY(-4px)' :
                                   characterState === 'THINKING' ? 'translateY(-2px)' : 'translateY(0)',
                        transition: 'all 0.3s ease'
                    }}
                />

                {/* Audio Waveform Equalizer Bars Overlay during Speaking */}
                {characterState === 'SPEAKING' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'flex-end',
                        height: '24px',
                        background: 'rgba(5,2,2,0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(220,20,60,0.3)'
                    }}>
                        {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '3px',
                                    height: `${h * 18}px`,
                                    background: 'var(--r)',
                                    borderRadius: '2px',
                                    animation: `pulse ${0.6 + (i % 3) * 0.2}s ease-in-out infinite alternate`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Speech Bubble / Subtitles */}
            <div style={{
                width: '100%',
                background: 'rgba(5, 2, 2, 0.75)',
                border: '1px solid rgba(220,20,60,0.2)',
                borderRadius: '4px',
                padding: '12px 16px',
                marginBottom: '16px'
            }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '4px' }}>
                    AI STYLIST SPEECH
                </div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '13px', fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1.4 }}>
                    {activeText || '"Hi! I\'m your personal fashion stylist. Show me your outfit on camera!"'}
                </div>
                {noticeMsg && (
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: '#f59e0b', marginTop: '6px' }}>
                        ⚠️ {noticeMsg}
                    </div>
                )}
            </div>

            {/* Audio Controls Bar */}
            <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                background: 'rgba(255,255,255,0.03)',
                padding: '10px 14px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handlePlayPause}
                        style={{
                            padding: '6px 14px',
                            background: isPlaying ? 'rgba(220,20,60,0.2)' : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${isPlaying ? 'var(--r)' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: '4px',
                            color: '#fff',
                            fontFamily: 'var(--fg)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>

                    <button
                        onClick={handleReplay}
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '4px',
                            color: 'var(--t2)',
                            fontFamily: 'var(--fg)',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Replay
                    </button>
                </div>

                {/* Volume Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--t2)' }}>🔊</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{ width: '70px', accentColor: 'var(--r)', cursor: 'pointer' }}
                    />
                </div>
            </div>
        </div>
    )
})

export default AIStyleCharacter
