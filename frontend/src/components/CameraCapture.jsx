import { useRef, useState } from "react"
import axios from "axios"

function CameraCapture() {

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const [image, setImage] = useState(null)
    const [message, setMessage] = useState("")

    const startCamera = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream

    }

    const speak = (text) => {

        const speech = new SpeechSynthesisUtterance(text)
        speech.lang = "en-US"
        window.speechSynthesis.speak(speech)

    }

    const capture = () => {

        const video = videoRef.current
        const canvas = canvasRef.current

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

    }

    return (

        <div className="card">

            <button className="btn" onClick={startCamera}>
                Start Camera
            </button>

            <button className="btn" onClick={capture}>
                Capture Outfit
            </button>

            <br /><br />

            <video ref={videoRef} autoPlay width="400" />

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {image && (

                <div>

                    <h3>Captured Image</h3>

                    <img src={image} width="400" />

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