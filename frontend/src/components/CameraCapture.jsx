import { useRef, useState, useEffect } from "react"
import axios from "axios"

function CameraCapture() {

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const [image, setImage] = useState(null)
    const [message, setMessage] = useState("")
    const [cameraOn, setCameraOn] = useState(false)

    // START CAMERA
    const startCamera = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ video: true })

            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }

            setCameraOn(true)

        } catch (err) {

            console.log("Camera error:", err)

        }

    }

    // STOP CAMERA
    const stopCamera = () => {

        if (videoRef.current && videoRef.current.srcObject) {

            const tracks = videoRef.current.srcObject.getTracks()

            tracks.forEach(track => track.stop())

            videoRef.current.srcObject = null

        }

        setCameraOn(false)

    }

    // CLEANUP WHEN LEAVING PAGE
    useEffect(() => {

        return () => {

            if (videoRef.current && videoRef.current.srcObject) {

                const tracks = videoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())

            }

        }

    }, [])

    // TEXT TO SPEECH
    const speak = (text) => {

        const speech = new SpeechSynthesisUtterance(text)
        speech.lang = "en-US"
        window.speechSynthesis.speak(speech)

    }

    // CAPTURE IMAGE
    const capture = () => {

        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")
        ctx.drawImage(video, 0, 0)

        canvas.toBlob(async (blob) => {

            const formData = new FormData()
            formData.append("image", blob)

            try {

                const res = await axios.post(
                    "http://localhost:5000/api/ai/analyze",
                    formData
                )

                setMessage(res.data.result)
                speak(res.data.result)

            } catch (err) {

                console.log(err)

            }

        })

        setImage(canvas.toDataURL())

        // stop camera after capture
        stopCamera()

    }

    return (

        <div className="card">

            <h3>
                Camera Status: {cameraOn ? "ON 🟢" : "OFF 🔴"}
            </h3>

            <button className="btn" onClick={startCamera}>
                Start Camera
            </button>

            <button className="btn" onClick={stopCamera}>
                Stop Camera
            </button>

            <button className="btn" onClick={capture} disabled={!cameraOn}>
                Capture Outfit
            </button>

            <br /><br />

            <video ref={videoRef} autoPlay width="400" />

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {image && (

                <div>

                    <h3>Captured Image</h3>

                    <img src={image} width="400" alt="captured" />

                </div>

            )}

            {message && (

                <h2 style={{ marginTop: "20px", color: "#ff0055" }}>
                    {message}
                </h2>

            )}

        </div>

    )

}

export default CameraCapture