import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function Avatar3D({ activeView = 'Front', selectedClothing = null, customModelUrl = null }) {
    const mountRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)
    const [isAiAvatar, setIsAiAvatar] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const controlsRef = useRef(null)
    const fbxModelRef = useRef(null)

    useEffect(() => {
        const container = mountRef.current
        if (!container) return

        setLoading(true)
        setErrorMsg(null)
        setIsAiAvatar(false)

        const width = container.clientWidth || 440
        const height = container.clientHeight || 560

        // 1. Scene Setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#020617')
        sceneRef.current = scene

        // 2. Camera Setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        camera.position.set(0, 1.1, 3.2)
        cameraRef.current = camera

        // 3. Renderer Setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.95
        container.appendChild(renderer.domElement)

        // 4. Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.target.set(0, 0.9, 0)
        controls.minDistance = 1.0
        controls.maxDistance = 8.0
        controls.maxPolarAngle = Math.PI / 2 + 0.1
        controlsRef.current = controls

        // 5. Realistic Studio Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.45)
        scene.add(hemiLight)

        const keyLight = new THREE.DirectionalLight(0xfffaed, 0.7)
        keyLight.position.set(2.5, 4, 3)
        keyLight.castShadow = true
        keyLight.shadow.mapSize.width = 2048
        keyLight.shadow.mapSize.height = 2048
        keyLight.shadow.bias = -0.0001
        scene.add(keyLight)

        const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.3)
        fillLight.position.set(-3, 2.5, -1)
        scene.add(fillLight)

        const rimLight = new THREE.DirectionalLight(0xffebd5, 0.2)
        rimLight.position.set(0, 3, -3)
        scene.add(rimLight)

        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.ShadowMaterial({ opacity: 0.2 })
        )
        shadowPlane.rotation.x = -Math.PI / 2
        shadowPlane.position.y = 0
        shadowPlane.receiveShadow = true
        scene.add(shadowPlane)

        // Check if an AI Avatar model URL is available
        const activeAiAvatar = customModelUrl || localStorage.getItem('ai_avatar_model_url')

        const loadDefaultFBX = () => {
            setIsAiAvatar(false)

            const textureLoader = new THREE.TextureLoader()

            const loadColorTex = (url) => {
                const t = textureLoader.load(url)
                t.colorSpace = THREE.SRGBColorSpace
                t.flipY = true
                return t
            }

            const loadDataTex = (url) => {
                const t = textureLoader.load(url)
                t.colorSpace = THREE.NoColorSpace
                t.flipY = true
                return t
            }

            const bodyBaseTex = loadColorTex('/models/avatar/textures/body_basecolor.png')
            const eyeBaseTex = loadColorTex('/models/avatar/textures/Eye_green_BaseColor.png')
            const hairBaseTex = loadColorTex('/models/avatar/textures/hair_basecolor.jpg')
            const dressBaseTex = loadColorTex('/models/avatar/textures/dress_basecolor.png')
            const shirtBaseTex = loadColorTex('/models/avatar/textures/shirt_basecolor.png')
            const braBaseTex = loadColorTex('/models/avatar/textures/bra_basecolor.png')
            const sockBaseTex = loadColorTex('/models/avatar/textures/sexy_sock_basecolor.png')

            const bodyNormalTex = loadDataTex('/models/avatar/textures/body_normal.png')
            const bodyRoughTex = loadDataTex('/models/avatar/textures/body_roughness.png')
            const dressNormalTex = loadDataTex('/models/avatar/textures/dress_Normal.png')
            const dressRoughTex = loadDataTex('/models/avatar/textures/dress_Roughness.png')
            const shirtNormalTex = loadDataTex('/models/avatar/textures/shirt_normal.png')
            const braNormalTex = loadDataTex('/models/avatar/textures/bra_normal.png')
            const sockNormalTex = loadDataTex('/models/avatar/textures/sexy_sock_normal.png')
            const sockRoughTex = loadDataTex('/models/avatar/textures/sexy_sock_roughness.png')

            const hairAlphaTex = loadDataTex('/models/avatar/textures/hair_alpha.png')
            const dressAlphaTex = loadDataTex('/models/avatar/textures/dress_alpha.png')
            const braAlphaTex = loadDataTex('/models/avatar/textures/bra_alpha.png')
            const lashAlphaTex = loadDataTex('/models/avatar/textures/eyelashes_basecolor_opacity.png')

            const fbxLoader = new FBXLoader()
            const modelUrl = '/models/avatar/The%20Girl%20.fbx'

            fbxLoader.load(
                modelUrl,
                (fbx) => {
                    const box = new THREE.Box3().setFromObject(fbx)
                    const size = box.getSize(new THREE.Vector3())
                    const center = box.getCenter(new THREE.Vector3())

                    const targetHeight = 1.7
                    const scale = size.y > 0 ? targetHeight / size.y : 0.01
                    fbx.scale.setScalar(scale)

                    box.setFromObject(fbx)
                    box.getCenter(center)
                    fbx.position.x = -center.x
                    fbx.position.y = -box.min.y
                    fbx.position.z = -center.z

                    fbx.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true

                            const name = (child.name || '').toLowerCase()
                            const matName = (child.material?.name || '').toLowerCase()

                            let mat = new THREE.MeshStandardMaterial({
                                color: new THREE.Color(0xffffff),
                                roughness: 0.65,
                                metalness: 0.0,
                                emissive: new THREE.Color(0x000000),
                            })

                            if (name.includes('eye') || matName.includes('eye')) {
                                mat.map = eyeBaseTex
                                mat.roughness = 0.15
                                mat.metalness = 0.05
                            } else if (name.includes('lash') || matName.includes('lash')) {
                                mat.map = lashAlphaTex
                                mat.alphaMap = lashAlphaTex
                                mat.transparent = true
                                mat.alphaTest = 0.2
                                mat.side = THREE.DoubleSide
                                mat.roughness = 0.8
                            } else if (name.includes('hair') || matName.includes('hair')) {
                                mat.map = hairBaseTex
                                mat.alphaMap = hairAlphaTex
                                mat.transparent = true
                                mat.alphaTest = 0.25
                                mat.side = THREE.DoubleSide
                                mat.roughness = 0.75
                            } else if (name.includes('dress') || matName.includes('dress')) {
                                mat.map = dressBaseTex
                                mat.normalMap = dressNormalTex
                                mat.roughnessMap = dressRoughTex
                                mat.alphaMap = dressAlphaTex
                                mat.transparent = true
                                mat.alphaTest = 0.15
                                mat.side = THREE.DoubleSide
                                mat.roughness = 0.6
                            } else if (name.includes('shirt') || matName.includes('shirt')) {
                                mat.map = shirtBaseTex
                                mat.normalMap = shirtNormalTex
                                mat.roughness = 0.65
                            } else if (name.includes('bra') || matName.includes('bra') || name.includes('pant')) {
                                mat.map = braBaseTex
                                mat.normalMap = braNormalTex
                                mat.alphaMap = braAlphaTex
                                mat.transparent = true
                                mat.alphaTest = 0.2
                                mat.side = THREE.DoubleSide
                                mat.roughness = 0.65
                            } else if (name.includes('sock') || matName.includes('sock')) {
                                mat.map = sockBaseTex
                                mat.normalMap = sockNormalTex
                                mat.roughnessMap = sockRoughTex
                                mat.roughness = 0.7
                            } else {
                                mat.map = bodyBaseTex
                                mat.normalMap = bodyNormalTex
                                mat.normalScale = new THREE.Vector2(0.8, 0.8)
                                mat.roughnessMap = bodyRoughTex
                                mat.roughness = 0.65
                                mat.metalness = 0.0
                            }

                            child.material = mat
                        }
                    })

                    scene.add(fbx)
                    fbxModelRef.current = fbx
                    setLoading(false)
                },
                (progress) => {},
                (err) => {
                    console.error('FBX Avatar Loading Error:', err)
                    setErrorMsg('3D model could not be loaded.')
                    setLoading(false)
                }
            )
        }

        if (activeAiAvatar) {
            const gltfLoader = new GLTFLoader()
            const resolvedUrl = activeAiAvatar.startsWith('http') ? activeAiAvatar : `http://localhost:5000${activeAiAvatar}`

            gltfLoader.load(
                resolvedUrl,
                (gltf) => {
                    const model = gltf.scene || gltf.scenes[0]
                    const box = new THREE.Box3().setFromObject(model)
                    const size = box.getSize(new THREE.Vector3())
                    const center = box.getCenter(new THREE.Vector3())

                    const targetHeight = 1.7
                    const scale = size.y > 0 ? targetHeight / size.y : 0.01
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
                    fbxModelRef.current = model
                    setIsAiAvatar(true)
                    setLoading(false)
                },
                (progress) => {},
                (err) => {
                    console.warn('AI GLTF Avatar Load Error, falling back to default FBX model:', err)
                    loadDefaultFBX()
                }
            )
        } else {
            loadDefaultFBX()
        }

        // Animation Loop
        let animationFrameId
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // Resize Listener
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
            cancelAnimationFrame(animationFrameId)
            renderer.dispose()
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
        }
    }, [reloadKey, customModelUrl])

    // Handle Camera Preset Views
    useEffect(() => {
        if (!cameraRef.current || !controlsRef.current) return
        const camera = cameraRef.current
        const controls = controlsRef.current

        switch (activeView) {
            case 'Front':
                camera.position.set(0, 1.1, 3.2)
                controls.target.set(0, 0.9, 0)
                break
            case 'Back':
                camera.position.set(0, 1.1, -3.2)
                controls.target.set(0, 0.9, 0)
                break
            case 'Left':
                camera.position.set(-3.2, 1.1, 0)
                controls.target.set(0, 0.9, 0)
                break
            case 'Right':
                camera.position.set(3.2, 1.1, 0)
                controls.target.set(0, 0.9, 0)
                break
            case 'Reset':
                camera.position.set(0, 1.1, 3.2)
                controls.target.set(0, 0.9, 0)
                break
            default:
                break
        }
        controls.update()
    }, [activeView])

    const handleSwitchToDefault = () => {
        localStorage.removeItem('ai_avatar_model_url')
        setReloadKey(prev => prev + 1)
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', background: '#020617', borderRadius: '8px', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '520px' }} />

            {/* AI Avatar Badge & Reset Button */}
            {isAiAvatar && (
                <div style={{
                    position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(5, 2, 2, 0.75)', backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(220,20,60,0.3)'
                }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t1)' }}>
                        ✦ AI Avatar Active
                    </span>
                    <button
                        onClick={handleSwitchToDefault}
                        style={{
                            background: 'none', border: 'none', color: 'var(--r)',
                            fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                            textDecoration: 'underline', padding: 0
                        }}
                    >
                        Use Default
                    </button>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(6px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#38bdf8'
                }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px', animation: 'spin 1s linear infinite' }}>🌀</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                        {isAiAvatar ? 'Loading AI 3D Avatar...' : 'Loading 3D Human Avatar...'}
                    </div>
                </div>
            )}

            {/* Error Message Fallback */}
            {errorMsg && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.92)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>{errorMsg}</div>
                </div>
            )}
        </div>
    )
}
