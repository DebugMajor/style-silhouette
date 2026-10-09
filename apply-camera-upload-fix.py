from pathlib import Path
import sys

TARGET = Path("frontend/src/pages/Voice.jsx")
BACKUP = TARGET.with_name(TARGET.name + ".before-camera-upload-fix.bak")

if not TARGET.is_file():
    print("ERROR: frontend/src/pages/Voice.jsx was not found.")
    print("Run this script from the style-silhouette repository root.")
    sys.exit(1)

source = TARGET.read_text(encoding="utf-8")
original = source


def replace_region(text, start_marker, end_marker, replacement, label):
    if text.count(start_marker) != 1:
        raise RuntimeError(f"Could not uniquely locate {label} start marker (found {text.count(start_marker)}). No file was changed.")
    start = text.find(start_marker)
    end = text.find(end_marker, start + len(start_marker))
    if end < 0:
        raise RuntimeError(f"Could not locate {label} end marker. No file was changed.")
    return text[:start] + replacement + text[end:]

try:
    # Keep the video element mounted. The previous conditional rendered it only after
    # cameraOn became true, so getUserMedia had no video element to attach its stream to.
    start_camera = '''    const startCamera = async () => {
        setCameraError(null)
        let stream

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera access requires localhost or HTTPS.')
            }

            const video = videoRef.current
            const existingStream = video?.srcObject
            const hasLiveVideo = existingStream?.getVideoTracks().some(
                track => track.readyState === 'live'
            )

            if (video && hasLiveVideo) {
                setCapturedImage(null)
                setCameraOn(true)
                await video.play()
                return
            }

            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            })

            if (!video) {
                throw new Error('Camera preview is unavailable.')
            }

            video.srcObject = stream
            setCapturedImage(null)
            setCameraOn(true)
            await video.play()
        } catch (err) {
            stream?.getTracks().forEach(track => track.stop())

            if (videoRef.current?.srcObject === stream) {
                videoRef.current.srcObject = null
            }

            console.error('[Camera] Access or playback failed:', err)
            if (err.name === 'NotAllowedError') {
                setCameraError('Camera permission was denied. Allow camera access in your browser settings.')
            } else if (err.name === 'NotFoundError') {
                setCameraError('No camera was found on this device.')
            } else {
                setCameraError(err.message || 'Unable to start the camera.')
            }
            setCameraOn(false)
        }
    }

'''
    source = replace_region(
        source,
        "    const startCamera = async () => {",
        "    const stopCamera = () => {",
        start_camera,
        "startCamera function",
    )

    upload_handler = '''    const handleFileUpload = (e) => {
        const input = e.currentTarget
        const file = input.files?.[0]
        input.value = ''
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setCameraError('Please upload a JPG, PNG, or WebP image.')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setCameraError('Please upload an image smaller than 10 MB.')
            return
        }

        setCameraError(null)
        stopCamera()
        setCapturedImage(URL.createObjectURL(file))
        runAnalysisOnBlob(file)
    }

'''
    source = replace_region(
        source,
        "    const handleFileUpload = (e) => {",
        "    const captureAndAnalyze = () => {",
        upload_handler,
        "handleFileUpload function",
    )

    capture_handler = '''    const captureAndAnalyze = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
            setCameraError('Camera preview is not ready. Restart the camera and try again.')
            return
        }

        if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
            setCameraError('The camera is still starting. Wait a moment and try again.')
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            setCameraError('Unable to capture a camera frame in this browser.')
            return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (!blob) {
                setCameraError('Could not capture the image. Please try again.')
                return
            }
            setCameraError(null)
            setCapturedImage(canvas.toDataURL('image/jpeg', 0.9))
            runAnalysisOnBlob(blob)
        }, 'image/jpeg', 0.9)
    }

'''
    source = replace_region(
        source,
        "    const captureAndAnalyze = () => {",
        "    const runAnalysisOnBlob = async (imageBlob) => {",
        capture_handler,
        "captureAndAnalyze function",
    )

    # Avoid manually setting multipart Content-Type; the browser/Axios must add its boundary.
    old_request = '''            const res = await axios.post('/api/style-speaker/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
                }
            })'''
    new_request = '''            const res = await axios.post('/api/style-speaker/analyze', formData, {
                headers: getAuthHeaders()
            })'''
    if source.count(old_request) != 1:
        raise RuntimeError("Could not uniquely locate the style-analysis request. No file was changed.")
    source = source.replace(old_request, new_request, 1)

    old_catch = '''        } catch (err) {
            console.error('[Voice] Analysis failed:', err)
            const fallbackText = "I've inspected your outfit! The color combination looks balanced. Try pairing with neutral footwear."
            setCharacterText(fallbackText)
            fetchElevenLabsSpeech(fallbackText)
        } finally {'''
    new_catch = '''        } catch (err) {
            console.error('[Voice] Analysis failed:', err)
            const message = err.response?.data?.message || err.message || 'Unable to analyze the image.'
            setCameraError(`Analysis failed: ${message}`)
            const failureText = "I couldn't analyze your image. Please check the connection and try again."
            setCharacterText(failureText)
            setMessages(prev => [...prev, { sender: 'AI', text: failureText }])
        } finally {'''
    if source.count(old_catch) != 1:
        raise RuntimeError("Could not uniquely locate the analysis error handler. No file was changed.")
    source = source.replace(old_catch, new_catch, 1)

    preview_start = "                            {!cameraOn && !capturedImage ? ("
    preview_end = "\n                            <canvas ref={canvasRef} style={{ display: 'none' }} />"
    preview = '''                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: cameraOn && !capturedImage ? 'block' : 'none'
                                }}
                            />

                            {capturedImage ? (
                                <img
                                    src={capturedImage}
                                    alt="Captured or uploaded outfit"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : !cameraOn ? (
                                <div style={{ textAlign: 'center', padding: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Camera size={24} />
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        Camera Inactive
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        Start your camera to analyze your outfit in real-time
                                    </div>
                                    <button className="btn btn-primary" onClick={startCamera}>
                                        <Camera size={14} />
                                        <span>Start Camera</span>
                                    </button>
                                </div>
                            ) : null}'''
    source = replace_region(
        source,
        preview_start,
        preview_end,
        preview,
        "camera preview JSX",
    )

    # Restrict the picker to formats accepted by the API's image upload middleware.
    old_input = '<input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: \'none\' }} />'
    new_input = '<input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileUpload} style={{ display: \'none\' }} />'
    if source.count(old_input) != 1:
        raise RuntimeError("Could not uniquely locate the Upload input. No file was changed.")
    source = source.replace(old_input, new_input, 1)

except Exception as exc:
    print(f"ERROR: {exc}")
    print("The source file has not been written.")
    sys.exit(1)

if source == original:
    print("No changes were made; the file already appears to be patched.")
    sys.exit(0)

if not BACKUP.exists():
    BACKUP.write_text(original, encoding="utf-8")

TARGET.write_text(source, encoding="utf-8")
print("Camera and image-upload fixes applied successfully.")
print(f"Updated: {TARGET}")
print(f"Backup:  {BACKUP}")
print("Next: restart the Vite dev server, then test camera preview and image upload.")
