import { useRef, useState } from "react";

function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      alert("Camera permission required");
    }
  };

  const speakMessage = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob);

      try {
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        setMessage(data.message);
        speakMessage(data.message);

      } catch (error) {
        console.error("Upload failed:", error);
      }
    });

    const imageData = canvas.toDataURL("image/png");
    setImage(imageData);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture</button>

      <br /><br />

      <video ref={videoRef} autoPlay width="400" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {image && (
        <div>
          <h3>Captured Image:</h3>
          <img src={image} width="400" alt="Captured" />
        </div>
      )}

      {message && (
        <h2 style={{ marginTop: "20px", color: "green" }}>
          {message}
        </h2>
      )}
    </div>
  );
}

export default CameraCapture;