import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function AI3DViewer({ modelUrl, initialView = 'Front' }) {
    const mountRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [errorMsg, setErrorMsg] = useState(null)
    const [activeView, setActiveView] = useState(initialView)

    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const controlsRef = useRef(null)
    const loadedModelRef = useRef(null)

    // Full URL resolution (handles relative backend uploads)
    const resolvedUrl = modelUrl ? (
        modelUrl.startsWith('http') ? modelUrl : `http://localhost:5000${modelUrl}`
    ) : null

    useEffect(() => {
        const container = mountRef.current
        if (!container || !resolvedUrl) return

        setLoading(true)
        setErrorMsg(null)
        setProgress(0)

        const width = container.clientWidth || 480
        const height = container.clientHeight || 580

        // 1. Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#030712')
        sceneRef.current = scene

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        camera.position.set(0, 1.1, 3.4)
        cameraRef.current = camera

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        container.appendChild(renderer.domElement)

        // 4. Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.target.set(0, 0.9, 0)
        controls.minDistance = 1.0
        controls.maxDistance = 8.0
        controls.maxPolarAngle = Math.PI / 2 + 0.1
        controlsRef.current = controls

        // 5. Realistic Neutral Studio Lighting Setup
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 0.6)
        scene.add(hemiLight)

        const keyLight = new THREE.DirectionalLight(0xfff8ee, 0.9)
        keyLight.position.set(3, 4, 3)
        keyLight.castShadow = true
        keyLight.shadow.mapSize.width = 2048
        keyLight.shadow.mapSize.height = 2048
        scene.add(keyLight)

        const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.45)
        fillLight.position.set(-3, 2.5, 2)
        scene.add(fillLight)

        const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.35)
        rimLight.position.set(0, 3.5, -3)
        scene.add(rimLight)

        // Subtle shadow floor grid
        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 12),
            new THREE.ShadowMaterial({ opacity: 0.25 })
        )
        shadowPlane.rotation.x = -Math.PI / 2
        shadowPlane.position.y = 0
        shadowPlane.receiveShadow = true
        scene.add(shadowPlane)

        // 6. Load GLTF / GLB Model
        const loader = new GLTFLoader()

        loader.load(
            resolvedUrl,
            (gltf) => {
                const model = gltf.scene || gltf.scenes[0]

                // Fit and center model in viewport
                const box = new THREE.Box3().setFromObject(model)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                const targetHeight = 1.75
                const scale = size.y > 0 ? targetHeight / size.y : 1.0
                model.scale.setScalar(scale)

                box.setFromObject(model)
                box.getCenter(center)
                model.position.x = -center.x
                model.position.y = -box.min.y
                model.position.z = -center.z

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                        if (child.material) {
                            child.material.side = THREE.DoubleSide
                        }
                    }
                })

                scene.add(model)
                loadedModelRef.current = model
                setLoading(false)
            },
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percent = Math.round((xhr.loaded / xhr.total) * 100)
                    setProgress(percent)
                }
            },
            (err) => {
                console.error('[AI3DViewer] Model Load Error:', err)
                setErrorMsg('Unable to load the generated 3D model.')
                setLoading(false)
            }
        )

        // 7. Animation Loop
        let animFrameId
        const animate = () => {
            animFrameId = requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // 8. Resize Handler
        const handleResize = () => {
            if (!container) return
            const w = container.clientWidth
            const h = container.clientHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animFrameId)
            renderer.dispose()
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
        }
    }, [resolvedUrl])

    // View Angle Presets
    const setView = (viewName) => {
        setActiveView(viewName)
        if (!cameraRef.current || !controlsRef.current) return
        const camera = cameraRef.current
        const controls = controlsRef.current

        switch (viewName) {
            case 'Front':
                camera.position.set(0, 1.1, 3.4)
                controls.target.set(0, 0.9, 0)
                break
            case 'Back':
                camera.position.set(0, 1.1, -3.4)
                controls.target.set(0, 0.9, 0)
                break
            case 'Left':
                camera.position.set(-3.4, 1.1, 0)
                controls.target.set(0, 0.9, 0)
                break
            case 'Right':
                camera.position.set(3.4, 1.1, 0)
                controls.target.set(0, 0.9, 0)
                break
            case 'Reset':
                camera.position.set(0, 1.1, 3.4)
                controls.target.set(0, 0.9, 0)
                break
            default:
                break
        }
        controls.update()
    }

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '540px',
            background: '#030712',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(220,20,60,.15)'
        }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '540px' }} />

            {/* View Control Buttons */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(5, 2, 2, 0.75)',
                backdropFilter: 'blur(12px)',
                padding: '6px 12px',
                borderRadius: '24px',
                border: '1px solid rgba(220,20,60,0.2)',
                zIndex: 10
            }}>
                {['Front', 'Back', 'Left', 'Right', 'Reset'].map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        style={{
                            padding: '5px 12px',
                            borderRadius: '16px',
                            background: activeView === v ? 'linear-gradient(135deg, var(--rd), var(--r))' : 'rgba(255,255,255,0.05)',
                            border: activeView === v ? '1px solid var(--r)' : '1px solid rgba(255,255,255,0.1)',
                            color: activeView === v ? '#ffffff' : 'var(--t2)',
                            fontFamily: 'var(--fg)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all .2s'
                        }}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(3,7,18,0.88)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    zIndex: 20
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1.2s linear infinite' }}>✨</div>
                    <div style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>
                        Loading 3D Avatar...
                    </div>
                    {progress > 0 && (
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--r)', marginTop: '6px' }}>
                            {progress}% downloaded
                        </div>
                    )}
                </div>
            )}

            {/* Error Overlay */}
            {errorMsg && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(3,7,18,0.92)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    zIndex: 20
                }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                    <div style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
                        {errorMsg}
                    </div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--t3)', maxWidth: '300px' }}>
                        Please try generating the model again or upload a different image.
                    </div>
                </div>
            )}
        </div>
    )
}
