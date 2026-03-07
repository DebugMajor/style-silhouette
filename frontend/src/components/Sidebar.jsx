import { useNavigate } from "react-router-dom"
import { Camera, Shirt, Sparkles, Upload, Mic } from "lucide-react"

function Sidebar() {

    const navigate = useNavigate()

    return (

        <div className="sidebar">

            <h3 className="sidebar-title">
                Dashboard
            </h3>

            <div className="sidebar-links">

                <button onClick={() => navigate("/dashboard/camera")}>
                    <Camera size={18} />
                    Camera Styling
                </button>

                <button onClick={() => navigate("/dashboard/wardrobe")}>
                    <Shirt size={18} />
                    Digital Wardrobe
                </button>

                <button onClick={() => navigate("/dashboard/suggestions")}>
                    <Sparkles size={18} />
                    AI Suggestions
                </button>

                <button onClick={() => navigate("/dashboard/upload")}>
                    <Upload size={18} />
                    Upload Outfit
                </button>

                <button onClick={() => navigate("/dashboard/voice")}>
                    <Mic size={18} />
                    Voice Styling
                </button>

            </div>

        </div>

    )

}

export default Sidebar