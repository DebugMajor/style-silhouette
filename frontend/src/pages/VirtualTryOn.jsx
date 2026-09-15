import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Avatar3D from '../components/Avatar3D'
import {
    Camera,
    Check,
    Download,
    Layers,
    RefreshCw,
    Save,
    Sparkles,
    Upload,
    User,
    X
} from 'lucide-react'

const API_ROOT = '/api/virtual-tryon'

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export default function VirtualTryOn() {
    const navigate = useNavigate()
    const [mode, setMode] = useState('IDM-VTON')
    const [modelImage, setModelImage] = useState(null)
    const [clothingImage, setClothingImage] = useState(null)
    const [garmentName, setGarmentName] = useState('')
    const [category, setCategory] = useState('upper_body')
    const [resultImage, setResultImage] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)
    const [threeView, setThreeView] = useState('Front')
    const [history, setHistory] = useState([])

    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraStream, setCameraStream] = useState(null)
    const videoRef = useRef(null)

    const modelInputRef = useRef(null)
    const clothingInputRef = useRef(null)

    const message = (text, type = 'info') => setStatus({ text, type })

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [cameraStream])

    const loadHistory = async () => {
        try {
            const response = await axios.get(`${API_ROOT}/history`)
            setHistory(response.data?.data || [])
        } catch {
            setHistory([])
        }
    }

    useEffect(() => {
        loadHistory()
    }, [])

    const handleImageSelect = async (event, type) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            message('Please choose a JPG, PNG or WebP image.', 'error')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            message('Image must be 10 MB or smaller.', 'error')
            return
        }

        try {
            const dataUrl = await fileToDataUrl(file)

            if (type === 'model') {
                setModelImage(dataUrl)
            } else {
                setClothingImage(dataUrl)
                setGarmentName(file.name.replace(/\.[^/.]+$/, ''))
            }

            setResultImage(null)
            setStatus(null)
        } catch {
            message('Unable to read that image.', 'error')
        } finally {
            event.target.value = ''
        }
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 720 }, height: { ideal: 960 }, facingMode: 'user' }
            })

            setCameraStream(stream)
            setCameraOpen(true)

            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(() => {})
                }
            })
        } catch {
            message('Camera permission was denied or no camera is available.', 'error')
        }
    }

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop())
        }
        setCameraStream(null)
        setCameraOpen(false)
    }

    const captureCamera = () => {
        const video = videoRef.current
        if (!video) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 720
        canvas.height = video.videoHeight || 960
        const context = canvas.getContext('2d')

        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        setModelImage(canvas.toDataURL('image/png'))
        setResultImage(null)
        closeCamera()
        message('Model photo captured from camera.', 'success')
    }

    const generateTryOn = async () => {
        if (!modelImage) {
            message('Upload or capture a model photo first.', 'error')
            return
        }

        if (!clothingImage) {
            message('Upload a clothing photo first.', 'error')
            return
        }

        setProcessing(true)
        setResultImage(null)
        message('IDM-VTON is generating your try-on. This can take a little while.', 'info')

        try {
            const response = await axios.post(`${API_ROOT}/process`, {
                modelImage,
                clothingImage,
                category,
                garmentDescription: garmentName || 'fashion clothing'
            })

            if (!response.data?.success || !response.data?.resultImage) {
                throw new Error(response.data?.message || 'IDM-VTON did not return a result.')
            }

            setResultImage(response.data.resultImage)
            message('Virtual Try-On completed.', 'success')
            loadHistory()
        } catch (error) {
            message(
                error?.response?.data?.message ||
                error?.message ||
                'IDM-VTON failed to generate the try-on.',
                'error'
            )
        } finally {
            setProcessing(false)
        }
    }

    const downloadResult = () => {
        if (!resultImage) return
        const link = document.createElement('a')
        link.href = resultImage
        link.download = `style-silhouette-tryon-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
    }

    const saveResult = async () => {
        if (!resultImage || saving) return

        setSaving(true)

        try {
            await axios.post(`${API_ROOT}/save`, {
                title: garmentName ? `Try-On: ${garmentName}` : 'AI Virtual Try-On',
                baseImage: modelImage,
                clothingItems: [{
                    name: garmentName || 'Uploaded Garment',
                    category,
                    imageSrc: clothingImage
                }],
                resultImage
            })

            message('Try-On saved to your history.', 'success')
            loadHistory()
        } catch (error) {
            message(error?.response?.data?.message || 'Unable to save this try-on.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const clearSession = () => {
        setModelImage(null)
        setClothingImage(null)
        setGarmentName('')
        setResultImage(null)
        setStatus(null)
    }

    return (
        <main style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 28px 60px' }}>
            <header style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                            Virtual styling studio
                        </p>
                        <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-.03em' }}>
                            Virtual Try-On
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: 700 }}>
                            Upload your photo and a garment. IDM-VTON automatically renders the garment on the person.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className={`btn btn-sm ${mode === 'IDM-VTON' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('IDM-VTON')}
                        >
                            <Sparkles size={15} />
                            AI Photo Try-On
                        </button>
                        <button
                            className={`btn btn-sm ${mode === '3D' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('3D')}
                        >
                            <Layers size={15} />
                            3D Try-On
                        </button>
                    </div>
                </div>
            </header>

            {status && (
                <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ marginBottom: 20 }}>
                    {status.text}
                </div>
            )}

            {mode === 'IDM-VTON' ? (
                <>
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>Step 1</div>
                                    <h2 style={{ margin: '4px 0 0', fontSize: 18 }}>Model Photo</h2>
                                </div>
                                {modelImage && <span className="badge badge-success"><Check size={12} /> Ready</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => modelInputRef.current?.click()}>
                                    <Upload size={15} /> Upload Model
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={startCamera}>
                                    <Camera size={15} /> Camera
                                </button>
                            </div>

                            <input
                                ref={modelInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={event => handleImageSelect(event, 'model')}
                            />

                            <div style={{
                                minHeight: 360,
                                border: modelImage ? '1px solid var(--border)' : '1px dashed var(--border)',
                                borderRadius: 12,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {modelImage ? (
                                    <>
                                        <img src={modelImage} alt="Model preview" style={{ width: '100%', height: 360, objectFit: 'contain' }} />
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={{ position: 'absolute', right: 10, top: 10 }}
                                            onClick={() => setModelImage(null)}
                                            aria-label="Remove model image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>
                                        <User size={38} style={{ marginBottom: 10 }} />
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Upload a clear full-body photo</div>
                                        <div style={{ fontSize: 12, marginTop: 5 }}>Front-facing photos with good lighting work best.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>Step 2</div>
                                    <h2 style={{ margin: '4px 0 0', fontSize: 18 }}>Clothing Photo</h2>
                                </div>
                                {clothingImage && <span className="badge badge-success"><Check size={12} /> Ready</span>}
                            </div>

                            <button
                                className="btn btn-primary btn-sm"
                                style={{ marginBottom: 12 }}
                                onClick={() => clothingInputRef.current?.click()}
                            >
                                <Upload size={15} /> Upload Clothing
                            </button>

                            <input
                                ref={clothingInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={event => handleImageSelect(event, 'clothing')}
                            />

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>
                                    Garment type
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                                    {[
                                        ['upper_body', 'Upper'],
                                        ['lower_body', 'Lower'],
                                        ['dresses', 'Dress']
                                    ].map(([id, label]) => (
                                        <button
                                            key={id}
                                            className={`btn btn-sm ${category === id ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setCategory(id)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                minHeight: 360,
                                border: clothingImage ? '1px solid var(--border)' : '1px dashed var(--border)',
                                borderRadius: 12,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {clothingImage ? (
                                    <>
                                        <img src={clothingImage} alt="Clothing preview" style={{ width: '100%', height: 360, objectFit: 'contain' }} />
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={{ position: 'absolute', right: 10, top: 10 }}
                                            onClick={() => { setClothingImage(null); setGarmentName('') }}
                                            aria-label="Remove clothing image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>
                                        <Upload size={38} style={{ marginBottom: 10 }} />
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Upload one garment photo</div>
                                        <div style={{ fontSize: 12, marginTop: 5 }}>Use a clear image with the complete garment visible.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>Step 3</div>
                                <h2 style={{ margin: '4px 0 0', fontSize: 18 }}>AI Result</h2>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: 12 }}
                                onClick={generateTryOn}
                                disabled={processing || !modelImage || !clothingImage}
                            >
                                <Sparkles size={16} />
                                {processing ? 'Generating with IDM-VTON...' : 'Generate Virtual Try-On'}
                            </button>

                            <div style={{
                                minHeight: 360,
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {resultImage ? (
                                    <img src={resultImage} alt="IDM-VTON result" style={{ width: '100%', height: 360, objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>
                                        {processing ? (
                                            <>
                                                <div className="spinner" style={{ margin: '0 auto 14px' }} />
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI is generating your outfit</div>
                                                <div style={{ fontSize: 12, marginTop: 5 }}>The GPU worker may take a few minutes.</div>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={34} style={{ marginBottom: 10 }} />
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Your generated look appears here</div>
                                                <div style={{ fontSize: 12, marginTop: 5 }}>Both uploads are required before generation.</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {resultImage && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                                    <button className="btn btn-primary btn-sm" onClick={downloadResult}>
                                        <Download size={14} /> Download
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={saveResult} disabled={saving}>
                                        <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={clearSession}>
                                        <RefreshCw size={14} /> New Try-On
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {history.length > 0 && (
                        <section style={{ marginTop: 24 }}>
                            <div style={{ marginBottom: 12 }}>
                                <h2 style={{ margin: 0, fontSize: 18 }}>Recent Try-Ons</h2>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                                    Saved looks from your account.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                                {history.map(item => (
                                    <div className="card" key={item._id}>
                                        <img src={item.resultImage} alt={item.title || 'Saved try-on'} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 10 }} />
                                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            ) : (
                <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: 10, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 700 }}>3D Try-On</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Use your existing 3D avatar, or generate an AI avatar in AI Trend.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['Front', 'Back', 'Left', 'Right', 'Reset'].map(view => (
                                <button
                                    key={view}
                                    className={`btn btn-sm ${threeView === view ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setThreeView(view)}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Avatar3D activeView={threeView} />

                    <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/ai-trend')}>
                            Open AI Trend
                        </button>
                    </div>
                </section>
            )}

            {cameraOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(0,0,0,.72)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div className="card" style={{ width: 'min(700px, 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h2 style={{ margin: 0, fontSize: 18 }}>Capture Model Photo</h2>
                            <button className="btn btn-secondary btn-sm" onClick={closeCamera}><X size={14} /></button>
                        </div>

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                aspectRatio: '3/4',
                                objectFit: 'cover',
                                background: '#08080a',
                                borderRadius: 12
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                            <button className="btn btn-secondary" onClick={closeCamera}>Cancel</button>
                            <button className="btn btn-primary" onClick={captureCamera}><Camera size={15} /> Capture</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
