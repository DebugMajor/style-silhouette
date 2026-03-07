import { Camera, Shirt, Mic, Sparkles } from "lucide-react"

function Features() {

    return (

        <section id="features" className="section">

            <h2 className="section-title">Core Features</h2>

            <div className="grid">

                <div className="card">

                    <Camera size={30} />

                    <h3>Camera Capture</h3>

                    <p>
                        Capture outfit images directly from your device camera.
                    </p>

                </div>

                <div className="card">

                    <Shirt size={30} />

                    <h3>Outfit Evaluation</h3>

                    <p>
                        Receive feedback about outfit combinations.
                    </p>

                </div>

                <div className="card">

                    <Mic size={30} />

                    <h3>Voice Styling</h3>

                    <p>
                        Future voice interaction for styling suggestions.
                    </p>

                </div>

                <div className="card">

                    <Sparkles size={30} />

                    <h3>Digital Wardrobe</h3>

                    <p>
                        Store and organize clothing digitally.
                    </p>

                </div>

            </div>

        </section>

    )

}

export default Features