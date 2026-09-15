import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, TrendingUp, Mic } from 'lucide-react'
import AITrend from './AITrend'
import Voice from './Voice'

export default function Suggestions() {
    const [searchParams, setSearchParams] = useSearchParams()
    
    const getTabFromParam = (param) => {
        if (param === 'ai-trend' || param === 'trend') return 'trend'
        if (param === 'speaker' || param === 'voice') return 'speaker'
        return 'style'
    }

    const [activeTab, setActiveTab] = useState(getTabFromParam(searchParams.get('tab')))

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab) {
            setActiveTab(getTabFromParam(tab))
        }
    }, [searchParams])

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey)
        if (tabKey === 'trend') {
            setSearchParams({ tab: 'ai-trend' })
        } else if (tabKey === 'speaker') {
            setSearchParams({ tab: 'speaker' })
        } else {
            setSearchParams({})
        }
    }

    return (
        <div style={{ padding: '32px 36px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header with Feature Switcher */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        AI Studio
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', margin: 0, fontSize: '0.9rem' }}>
                        Your intelligent fashion workspace.
                    </p>
                </div>

                {/* Sub-Feature Navigation Pills */}
                <div style={{
                    display: 'flex', gap: '6px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    padding: '4px', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => handleTabChange('style')}
                        className={`btn btn-sm ${activeTab === 'style' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        <Sparkles size={14} />
                        <span>AI Style</span>
                    </button>

                    <button
                        onClick={() => handleTabChange('trend')}
                        className={`btn btn-sm ${activeTab === 'trend' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        <TrendingUp size={14} />
                        <span>AI Trends</span>
                    </button>

                    <button
                        onClick={() => handleTabChange('speaker')}
                        className={`btn btn-sm ${activeTab === 'speaker' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        <Mic size={14} />
                        <span>AI Stylist</span>
                    </button>
                </div>
            </div>

            {/* Feature 1: Style Analysis Overview */}
            {activeTab === 'style' && (
                <div className="card" style={{ padding: '48px 32px', textAlign: 'center', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Sparkles size={24} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        AI Style Analysis
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                        Analyze your outfit and receive personalized styling recommendations, color harmony scores, and wardrobe combination tips.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleTabChange('trend')} className="btn btn-secondary">
                            <span>Open Trend Studio</span>
                        </button>
                        <button onClick={() => handleTabChange('speaker')} className="btn btn-primary">
                            <span>Talk to AI Stylist</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Feature 2: AI Trend Studio */}
            {activeTab === 'trend' && (
                <div>
                    <AITrend hideHeader={true} />
                </div>
            )}

            {/* Feature 3: AI Style Speaker */}
            {activeTab === 'speaker' && (
                <div>
                    <Voice />
                </div>
            )}
        </div>
    )
}
