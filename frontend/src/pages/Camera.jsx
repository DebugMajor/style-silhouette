import { useRef, useState } from "react"
import axios from "axios"

function Camera() {

    const videoRef = useRef(null)

    const [capturedImage, setCapturedImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)


    // START CAMERA

    const startCamera = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            })

            videoRef.current.srcObject = stream

        } catch (err) {

            console.log("Camera error:", err)

        }

    }


    // CAPTURE IMAGE

    const captureImage = () => {

        const canvas = document.createElement("canvas")

        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        const ctx = canvas.getContext("2d")

        ctx.drawImage(videoRef.current, 0, 0)

        const image = canvas.toDataURL("image/jpeg")

        setCapturedImage(image)

    }


    // ANALYZE OUTFIT

    const analyzeOutfit = async () => {

        if (!capturedImage) {
            alert("Capture image first")
            return
        }

        try {

            setLoading(true)

            const response = await axios.post(
                "http://localhost:5000/api/analyze-outfit",
                {
                    image: capturedImage,
                    userId: "demoUser"
                }
            )

            setResult(response.data)

            setLoading(false)

        } catch (error) {

            console.log(error)

            setLoading(false)

        }

    }



    return (

        <div className="camera-page">

            <h2>Camera Styling</h2>

            {/* CAMERA VIDEO */}

            <video
                ref={videoRef}
                autoPlay
                className="camera-video"
            />


            <div>

                <button
                    className="camera-btn"
                    onClick={startCamera}
                >

                    Start Camera

                </button>


                <button
                    className="camera-btn"
                    onClick={captureImage}
                >

                    Capture

                </button>

            </div>


            {/* IMAGE PREVIEW */}

            {capturedImage && (

                <div className="captured-image">

                    <img src={capturedImage} />

                    <button
                        className="camera-btn"
                        onClick={analyzeOutfit}
                    >

                        Analyze Outfit

                    </button>

                </div>

            )}



            {/* LOADING */}

            {loading && (

                <p>
                    AI is analyzing your outfit...
                </p>

            )}



            {/* RESULT */}

            {result && (

                <div className="analysis-result">

                    <h3>Detected Outfit</h3>

                    <p><b>Top:</b> {result.top}</p>
                    <p><b>Bottom:</b> {result.bottom}</p>
                    <p><b>Shoes:</b> {result.shoes}</p>

                    <h3>Suggestions</h3>

                    <ul>

                        {result.suggestions?.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}

                    </ul>

                    <p>

                        <b>Style Score:</b> {result.styleScore}/10

                    </p>

                </div>

            )}

        </div>

    )

}

export default Camera