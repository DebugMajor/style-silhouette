import { useEffect, useRef, useState } from "react";
import "./Camera.css";

function CameraFrame() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [captured, setCaptured] = useState(null);
  const [styleSuggestion, setStyleSuggestion] = useState("");

  useEffect(() => {
    startCamera();

    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    setCaptured(imageData);

    // mock AI style suggestion
    const suggestions = [
      "Try a slim-fit blazer with neutral trousers.",
      "Dark denim with white sneakers will suit you.",
      "Layer a casual jacket for a sharper silhouette.",
      "Earth tone shirts would enhance your look."
    ];

    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setStyleSuggestion(random);

    speak(random);
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="camera-container">

      {!captured && (
        <>
          <div className="camera-wrapper">

            <video ref={videoRef} autoPlay playsInline />

            {/* Frame overlay */}
            <div className="frame-overlay"></div>

          </div>

          <button className="capture-btn" onClick={captureImage}>
            Capture Style
          </button>
        </>
      )}

      {captured && (
        <div className="result">

          <img src={captured} alt="captured" />

          <h3>Style Suggestion</h3>

          <p>{styleSuggestion}</p>

          <button onClick={() => setCaptured(null)}>
            Retake
          </button>

        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

    </div>
  );
}

export default CameraFrame;