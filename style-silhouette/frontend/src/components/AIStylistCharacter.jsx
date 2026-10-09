import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const AIStylistCharacter = forwardRef(({ state = 'IDLE', activeText = '', onSpeechEnd }, ref) => {
    const mountRef = useRef(null)
    const [characterState, setCharacterState] = useState(state) // IDLE | LISTENING | THINKING | SPEAKING
    const [isSpeaking, setIsSpeaking] = useState(false)

    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const mouthMeshRef = useRef(null)
    const headGroupRef = useRef(null)
    const modelGroupRef = useRef(null)
    const mouthAnimId = useRef(null)

    // Sync state prop changes
    useEffect(() => {
        setCharacterState(state)
        if (state === 'SPEAKING') {
            setIsSpeaking(true)
        } else if (state !== 'SPEAKING' && !window.speechSynthesis?.speaking) {
            setIsSpeaking(false)
        }
    }, [state])

    // Speech Synthesis with Talking Lip-Sync Animation
    const speak = (textToSpeak) => {
        if (!textToSpeak || typeof window === 'undefined' || !window.speechSynthesis) return

        window.speechSynthesis.cancel() // Stop any previous speech

        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = 1.0
        utterance.pitch = 1.15 // Slightly higher pitch for female voice tone

        // Select female voice if available
        const voices = window.speechSynthesis.getVoices()
        const femaleVoice = voices.find(v => (
            v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Victoria')
        )) || voices.find(v => v.lang.startsWith('en'))

        if (femaleVoice) {
            utterance.voice = femaleVoice
        }

        utterance.onstart = () => {
            setCharacterState('SPEAKING')
            setIsSpeaking(true)
        }

        utterance.onend = () => {
            setIsSpeaking(false)
            setCharacterState('IDLE')
            if (onSpeechEnd) onSpeechEnd()
        }

        utterance.onerror = () => {
            setIsSpeaking(false)
            setCharacterState('IDLE')
        }

        window.speechSynthesis.speak(utterance)
    }

    // Expose speak method via ref
    useImperativeHandle(ref, () => ({
        speak,
        setState: (newState) => setCharacterState(newState)
    }))

    // 3D Scene Initialization
    useEffect(() => {
        const container = mountRef.current
        if (!container) return

        const width = container.clientWidth || 440
        const height = container.clientHeight || 520

        // 1. Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#040101')
        sceneRef.current = scene

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
        camera.position.set(0, 1.45, 2.6)
        cameraRef.current = camera

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.1
        container.appendChild(renderer.domElement)

        // 4. Orbit Controls (Targeted at Head/Chest height)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.target.set(0, 1.2, 0)
        controls.minDistance = 1.2
        controls.maxDistance = 4.5
        controls.maxPolarAngle = Math.PI / 2 + 0.05

        // 5. Fashion Studio Lighting Setup
        const hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x1f1115, 0.7)
        scene.add(hemiLight)

        const keyLight = new THREE.DirectionalLight(0xffe8d6, 1.1)
        keyLight.position.set(2.5, 3.5, 2.5)
        keyLight.castShadow = true
        scene.add(keyLight)

        const fillLight = new THREE.DirectionalLight(0xec4899, 0.4) // Subtle pink fashion fill
        fillLight.position.set(-2.5, 2.0, 1.5)
        scene.add(fillLight)

        const rimLight = new THREE.DirectionalLight(0xdc143c, 0.6) // Crimson studio rim light
        rimLight.position.set(0, 2.5, -2.5)
        scene.add(rimLight)

        // Ground reflection plane
        const floorGeo = new THREE.PlaneGeometry(10, 10)
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x050202, roughness: 0.8, metalness: 0.2 })
        const floor = new THREE.Mesh(floorGeo, floorMat)
        floor.rotation.x = -Math.PI / 2
        floor.position.y = 0
        scene.add(floor)

        // 6. Build Stylized 3D Female Character Geometry
        const characterGroup = new THREE.Group()
        modelGroupRef.current = characterGroup

        // Torso / Stylish Blazer (Crimson / Dark Velvet)
        const bodyGeo = new THREE.CylinderGeometry(0.32, 0.26, 1.1, 32)
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8b0020,
            roughness: 0.45,
            metalness: 0.1
        })
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.position.y = 0.65
        body.castShadow = true
        characterGroup.add(body)

        // Stylish V-Neck Accent
        const vNeckGeo = new THREE.BufferGeometry()
        const vNeckVertices = new Float32Array([
            -0.12, 1.15, 0.33,
             0.12, 1.15, 0.33,
             0.0,  0.8,  0.33
        ])
        vNeckGeo.setAttribute('position', new THREE.BufferAttribute(vNeckVertices, 3))
        const vNeckMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        const vNeck = new THREE.Mesh(vNeckGeo, vNeckMat)
        characterGroup.add(vNeck)

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.22, 16)
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0c5, roughness: 0.6 })
        const neck = new THREE.Mesh(neckGeo, skinMat)
        neck.position.y = 1.25
        characterGroup.add(neck)

        // Head Group
        const headGroup = new THREE.Group()
        headGroup.position.y = 1.48
        headGroupRef.current = headGroup

        // Head Mesh
        const headGeo = new THREE.SphereGeometry(0.22, 32, 32)
        headGeo.scale(0.9, 1.05, 0.95)
        const head = new THREE.Mesh(headGeo, skinMat)
        headGroup.add(head)

        // Hair (Stylish Bob / Updo)
        const hairGeo = new THREE.SphereGeometry(0.245, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65)
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f1410, roughness: 0.5 })
        const hair = new THREE.Mesh(hairGeo, hairMat)
        hair.position.set(0, 0.03, -0.01)
        headGroup.add(hair)

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.032, 16, 16)
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 })
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
        leftEye.position.set(-0.075, 0.04, 0.19)
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
        rightEye.position.set(0.075, 0.04, 0.19)
        headGroup.add(leftEye)
        headGroup.add(rightEye)

        // Glasses / Designer Eyewear Accent
        const frameGeo = new THREE.TorusGeometry(0.045, 0.006, 12, 24)
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xdc143c, metalness: 0.8 })
        const leftFrame = new THREE.Mesh(frameGeo, frameMat)
        leftFrame.position.set(-0.075, 0.04, 0.2)
        const rightFrame = new THREE.Mesh(frameGeo, frameMat)
        rightFrame.position.set(0.075, 0.04, 0.2)
        headGroup.add(leftFrame)
        headGroup.add(rightFrame)

        // Mouth (Lip Sync Animated Mesh)
        const mouthGeo = new THREE.BoxGeometry(0.07, 0.018, 0.02)
        const lipMat = new THREE.MeshStandardMaterial({ color: 0xdc143c, roughness: 0.3 })
        const mouth = new THREE.Mesh(mouthGeo, lipMat)
        mouth.position.set(0, -0.08, 0.205)
        mouthMeshRef.current = mouth
        headGroup.add(mouth)

        characterGroup.add(headGroup)
        scene.add(characterGroup)

        // 7. Animation Loop (Idle breathing, speaking lip sync, listening tilt)
        let clock = new THREE.Clock()
        let animFrameId

        const animate = () => {
            animFrameId = requestAnimationFrame(animate)
            const elapsedTime = clock.getElapsedTime()

            // Subtle body sway & breathing
            if (modelGroupRef.current) {
                modelGroupRef.current.position.y = Math.sin(elapsedTime * 1.8) * 0.015
            }

            // Head animation based on state
            if (headGroupRef.current) {
                if (characterState === 'LISTENING') {
                    headGroupRef.current.rotation.z = Math.sin(elapsedTime * 2) * 0.08 + 0.06 // Listening tilt
                    headGroupRef.current.rotation.y = Math.cos(elapsedTime * 1.5) * 0.05
                } else if (characterState === 'THINKING') {
                    headGroupRef.current.rotation.x = -0.12 // Looking slightly up thinking
                    headGroupRef.current.rotation.y = Math.sin(elapsedTime * 1.2) * 0.12
                } else if (characterState === 'SPEAKING' || isSpeaking) {
                    headGroupRef.current.rotation.y = Math.sin(elapsedTime * 3) * 0.06
                    headGroupRef.current.rotation.x = Math.cos(elapsedTime * 4) * 0.03
                } else {
                    // IDLE
                    headGroupRef.current.rotation.set(0, Math.sin(elapsedTime * 0.8) * 0.04, 0)
                }
            }

            // Lip sync mouth animation while speaking
            if (mouthMeshRef.current) {
                if (characterState === 'SPEAKING' || isSpeaking) {
                    // Procedural mouth open/close viseme modulation
                    const openFactor = Math.abs(Math.sin(elapsedTime * 14)) * 0.04 + 0.015
                    mouthMeshRef.current.scale.set(1.1, openFactor * 40, 1)
                } else {
                    mouthMeshRef.current.scale.set(1, 1, 1)
                }
            }

            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // 8. Resize Listener
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
    }, [characterState, isSpeaking])

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '480px',
            background: '#040101',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid rgba(220,20,60,0.2)'
        }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '480px' }} />

            {/* Character HUD State Badge */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(5, 2, 2, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(220,20,60,0.3)'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: (characterState === 'SPEAKING' || isSpeaking) ? '#10b981' :
                                characterState === 'THINKING' ? '#f59e0b' :
                                characterState === 'LISTENING' ? '#38bdf8' : 'var(--r)',
                    animation: (characterState === 'SPEAKING' || isSpeaking || characterState === 'LISTENING') ? 'pulse 1.2s ease-in-out infinite' : 'none'
                }} />

                <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--t1)' }}>
                    {characterState === 'SPEAKING' || isSpeaking ? 'AI STYLIST IS SPEAKING…' :
                     characterState === 'THINKING' ? 'ANALYZING YOUR STYLE…' :
                     characterState === 'LISTENING' ? 'LISTENING…' : 'REAL-TIME AI STYLIST'}
                </span>
            </div>

            {/* Live Speech Bubble / Subtitles */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(8, 3, 3, 0.88)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(220,20,60,0.25)',
                borderRadius: '4px',
                padding: '14px 18px',
                zIndex: 10
            }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '4px' }}>
                    CHARACTER SPEECH
                </div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1.5 }}>
                    {activeText || (
                        characterState === 'SPEAKING' ? 'AI Stylist is speaking...' :
                        characterState === 'THINKING' ? 'Let me analyze your style...' :
                        characterState === 'LISTENING' ? 'Listening to your voice...' :
                        '"Hi! I\'m your personal AI fashion stylist. Let me take a look at your outfit."'
                    )}
                </div>
            </div>
        </div>
    )
})

export default AIStylistCharacter
