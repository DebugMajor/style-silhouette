import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AI3DViewer from '../components/AI3DViewer'
import { Camera, Sparkles, RefreshCw, Shirt, Upload, AlertCircle, CheckCircle, Zap } from 'lucide-react'

const GUIDELINES = [
    'Use a full-body photo',
    'Face and body should be clearly visible',
    'Good lighting',
    'Simple background',
    'Front-facing photo recommended'
]

function getAuthHeaders() {
    try {
        const stored = localStorage.getItem('sas_user')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.token) {
                return { Authorization: `Bearer ${parsed.token}` }
            }
        }
    } catch {}
    return {}
}

export default function AITrend({ hideHeader = false }) {
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)

    const [testAuthResult, setTestAuthResult] = useState(null)
    const [testingAuth, setTestingAuth] = useState(false)

    const [isGenerating, setIsGenerating] = useState(false)
    const [stageText, setStageText] = useState('')
    const [progress, setProgress] = useState(0)

    const [generatedModel, setGeneratedModel] = useState(null)
    const pollTimerRef = useRef(null)
    const timeoutTimerRef = useRef(null)

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)
        }
    }, [previewUrl])

    const handleTestAuth = async () => {
        setTestingAuth(true)
        setTestAuthResult(null)
        try {
            const res = await axios.get('/api/ai-trend/test-auth', {
                headers: getAuthHeaders()
            })
            if (res.data?.authenticated) {
                setTestAuthResult({
                    success: true,
                    message: 'Tripo Connected'
                })
            } else {
                setTestAuthResult({
                    success: false,
                    message: `Tripo Auth Failed (${res.data?.message || 'Unauthorized'})`
                })
            }
        } catch (err) {
            console.error('[AITrend] Test auth failed:', err)
            const serverMsg = err.response?.data?.message || err.message
            setTestAuthResult({
                success: false,
                message: `Tripo Auth Failed (${serverMsg})`
            })
        } finally {
            setTestingAuth(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setErrorMsg(null)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        const ext = file.name.split('.').pop().toLowerCase()
        if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            setErrorMsg('Please upload a valid image file (JPG, PNG, or WebP).')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('Image size exceeds 10MB limit.')
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setGeneratedModel(null)
    }

    const handleGenerate = async () => {
        if (!selectedFile) {
            setErrorMsg('Please upload a full-body image.')
            return
        }

        setErrorMsg(null)
        setIsGenerating(true)
        setStageText('Uploading photo...')
        setProgress(5)

        const formData = new FormData()
        formData.append('image', selectedFile)

        try {
            const uploadRes = await axios.post('/api/ai-trend/generate-3d', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
                }
            })

            if (!uploadRes.data?.success || !uploadRes.data?.taskId) {
                throw new Error(uploadRes.data?.message || 'Unable to upload your image.')
            }

            const taskId = uploadRes.data.taskId
            setStageText('Creating AI 3D task...')
            setProgress(15)

            startPolling(taskId)
        } catch (err) {
            console.error('[AITrend] Generation trigger failed:', err)
            setIsGenerating(false)
            setErrorMsg(err.response?.data?.message || err.message || 'AI generation failed. Please try another image.')
        }
    }

    const startPolling = (taskId) => {
        const TIMEOUT_MS = 5 * 60 * 1000

        timeoutTimerRef.current = setTimeout(() => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            setIsGenerating(false)
            setErrorMsg('3D model processing timed out. Please try again.')
        }, TIMEOUT_MS)

        pollTimerRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/api/ai-trend/status/${taskId}`, {
                    headers: getAuthHeaders()
                })
                const data = res.data

                if (!data) return

                const currentProgress = data.progress || 20
                setProgress(Math.max(15, currentProgress))

                if (data.status === 'queued') {
                    setStageText('Task queued in AI queue...')
                } else if (data.status === 'running') {
                    if (currentProgress < 50) {
                        setStageText('Generating 3D avatar...')
                    } else if (currentProgress < 85) {
                        setStageText('Preparing 3D model...')
                    } else {
                        setStageText('Loading 3D avatar...')
                    }
                } else if (data.status === 'success' && data.model?.url) {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
                    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)

                    setStageText('Preparing 3D model...')
                    setProgress(100)

                    setTimeout(() => {
                        setIsGenerating(false)
                        setGeneratedModel(data.model)
                    }, 600)
                } else if (data.status === 'failed' || data.status === 'banned') {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
                    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)

                    setIsGenerating(false)
                    setErrorMsg(data.message || 'AI generation failed. Please try another image.')
                }
            } catch (pollErr) {
                console.warn('[AITrend] Polling error:', pollErr.message)
            }
        }, 3500)
    }

    const handleUseInTryOn = () => {
        if (!generatedModel?.url) return
        localStorage.setItem('ai_avatar_model_url', generatedModel.url)
        localStorage.setItem('ai_avatar_timestamp', Date.now().toString())
        navigate('/dashboard/virtual-try-on')
    }

    const handleReset = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setGeneratedModel(null)
        setErrorMsg(null)
        setIsGenerating(false)
    }

    return (
        <div style={{ padding: hideHeader ? '0' : '32px 36px', maxWidth: '1280px', margin: '0 auto' }}>
            {!hideHeader && (
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title" style={{ margin: 0 }}>Trend Studio</h1>
                        <p className="page-subtitle" style={{ marginTop: '4px', margin: 0 }}>
                            Transform full-body photos into realistic interactive AI 3D avatars.
                        </p>
                    </div>

                    <button onClick={handleTestAuth} disabled={testingAuth} className="btn btn-secondary btn-sm">
                        <Zap size={14} />
                        <span>{testingAuth ? 'Testing...' : 'Test Tripo Engine'}</span>
                    </button>
                </div>
            )}

            <div className="card">
                {errorMsg && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        <span style={{ flex: 1 }}>{errorMsg}</span>
                        <button onClick={() => setErrorMsg(null)} style={{ color: 'inherit' }}>✕</button>
                    </div>
                )}

                {generatedModel ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                    AI Generated 3D Avatar
                                </h2>
                                <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <CheckCircle size={12} />
                                    <span>Generation Complete</span>
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleReset} className="btn btn-secondary btn-sm">
                                    <RefreshCw size={14} />
                                    <span>Generate Again</span>
                                </button>
                                <button onClick={handleUseInTryOn} className="btn btn-primary btn-sm">
                                    <Shirt size={14} />
                                    <span>Use in Virtual Try-On</span>
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '560px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                            <AI3DViewer modelUrl={generatedModel.url} />
                        </div>
                    </div>
                ) : isGenerating ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', marginBottom: '20px' }} />
                        
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {stageText}
                        </h3>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px', lineHeight: 1.5 }}>
                            Constructing high-fidelity 3D avatar geometry and textures.
                        </p>

                        <div style={{ width: '100%', maxWidth: '360px', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{progress}%</span>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr 340px', gap: '32px' }}>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                                Upload Full-Body Photo
                            </div>

                            {!previewUrl ? (
                                <label style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    height: '320px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'var(--transition)'
                                }}>
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                                        <Upload size={24} />
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Select Photo</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>JPG, PNG, or WebP (Max 10MB)</span>
                                </label>
                            ) : (
                                <div style={{ position: 'relative', height: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                        Change Photo
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={!selectedFile}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '20px', padding: '12px' }}
                            >
                                <Sparkles size={16} />
                                <span>Generate 3D Avatar</span>
                            </button>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Photo Guidelines</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {GUIDELINES.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            <CheckCircle size={14} color="var(--accent)" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', marginTop: '20px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PRO TIP</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                                    Well-lit full body photos with clear background separation generate the highest quality 3D avatars.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
