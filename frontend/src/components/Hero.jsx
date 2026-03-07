import { useNavigate } from "react-router-dom"

function Hero() {

    const navigate = useNavigate()

    return (

        <section id="home" className="hero">

            <div className="hero-content">

                <h1>STYLE-A-SILHOUETTE</h1>

                <p>
                    AI Powered Outfit Intelligence
                </p>

                <div className="hero-buttons">

                    <a href="#features">
                        <button>Explore Features</button>
                    </a>

                    <button onClick={() => navigate("/camera")}>
                        Try Camera
                    </button>

                </div>

            </div>

        </section>

    )

}

export default Hero