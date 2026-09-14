import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
        <div style={{ padding: '36px 40px', position: 'relative', zIndex: 1, maxWidth: '1350px', margin: '0 auto' }}>
            {/* Header with Integrated Feature Switcher */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div className="ol-r">AI STYLING ECOSYSTEM</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '34px', fontWeight: 700, fontStyle: 'italic', marginTop: '6px' }}>
                        <span style={{ color: 'var(--r)' }}>AI Suggestions</span> Studio
                    </div>
                </div>

                {/* Sub-Feature Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(8,3,3,.85)',
                    border: '1px solid var(--b)',
                    padding: '4px',
                    borderRadius: '24px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => handleTabChange('style')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            background: activeTab === 'style' ? 'linear-gradient(135deg, var(--rd), var(--r))' : 'transparent',
                            border: activeTab === 'style' ? '1px solid var(--r)' : '1px solid transparent',
                            color: activeTab === 'style' ? '#ffffff' : 'var(--t2)',
                            fontFamily: 'var(--fg)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ✦ AI Style Suggestions
                    </button>

                    <button
                        onClick={() => handleTabChange('trend')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            background: activeTab === 'trend' ? 'linear-gradient(135deg, var(--rd), var(--r))' : 'transparent',
                            border: activeTab === 'trend' ? '1px solid var(--r)' : '1px solid transparent',
                            color: activeTab === 'trend' ? '#ffffff' : 'var(--t2)',
                            fontFamily: 'var(--fg)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ⚡ AI Trend Studio (Photo → 3D Avatar)
                    </button>

                    <button
                        onClick={() => handleTabChange('speaker')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            background: activeTab === 'speaker' ? 'linear-gradient(135deg, var(--rd), var(--r))' : 'transparent',
                            border: activeTab === 'speaker' ? '1px solid var(--r)' : '1px solid transparent',
                            color: activeTab === 'speaker' ? '#ffffff' : 'var(--t2)',
                            fontFamily: 'var(--fg)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🎙️ AI Style Speaker (Real-Time AI Stylist)
                    </button>
                </div>
            </div>

            {/* Feature 1: AI Style Suggestions (Existing functionality) */}
            {activeTab === 'style' && (
                <div style={{ padding: '40px', background: 'rgba(8,3,3,.8)', border: '1px solid var(--b)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px', color: 'var(--r)' }}>✦</div>
                        <div style={{ fontFamily: 'var(--fp)', fontSize: '22px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '8px' }}>
                            AI Style Suggestions
                        </div>
                        <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                            Receive intelligent outfit combinations, color recommendations, and styling tips personalized to your wardrobe.
                        </p>
                        <div className="ol">Feature active & expanding in Phase 2</div>
                    </div>
                </div>
            )}

            {/* Feature 2: AI Trend Studio (Photo → AI 3D Avatar) */}
            {activeTab === 'trend' && (
                <div>
                    <AITrend hideHeader={true} />
                </div>
            )}

            {/* Feature 3: AI Style Speaker (Real-Time 3D AI Fashion Stylist) */}
            {activeTab === 'speaker' && (
                <div>
                    <Voice />
                </div>
            )}
        </div>
    )
}
