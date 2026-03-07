import { Camera, Brain, Shirt, Database } from "lucide-react"

function About() {

    return (

        <section id="about" className="section">

            <div className="container">

                <h2 className="section-title">
                    About Style-A-Silhouette
                </h2>

                <p className="about-intro">

                    Style-A-Silhouette is a camera-based smart styling assistant designed to
                    help users evaluate their outfits instantly. By combining modern web
                    technologies with intelligent analysis, the platform aims to act as a
                    personal digital stylist that helps users make better fashion decisions.

                </p>

                {/* WHAT IT DOES */}

                <div className="about-block">

                    <h3>What Does It Do?</h3>

                    <p>

                        Users capture an image of their outfit using their device camera or
                        upload an existing photo. The system analyzes the outfit and provides
                        feedback on styling choices, color combinations, and overall appearance.

                        Future versions will incorporate AI models capable of identifying
                        clothing items and suggesting improvements to create more balanced and
                        stylish outfits.

                    </p>

                </div>

                {/* WHY PROJECT */}

                <div className="about-block">

                    <h3>Why This Project Was Built</h3>

                    <p>

                        Choosing the right outfit can often be difficult and subjective.
                        Many people struggle to decide whether their clothing combinations
                        work well together.

                        Style-A-Silhouette explores how artificial intelligence and
                        computer vision can assist users in making confident styling decisions.
                        The goal is to create a system that functions like a personal
                        fashion assistant available anytime.

                    </p>

                </div>

                {/* HOW IT WORKS */}

                <div className="about-block">

                    <h3>How It Works</h3>

                    <div className="grid">

                        <div className="card">

                            <Camera size={28} />

                            <h4>Capture</h4>

                            <p>
                                Use your device camera to capture your outfit instantly.
                            </p>

                        </div>

                        <div className="card">

                            <Brain size={28} />

                            <h4>Analyze</h4>

                            <p>
                                The system processes the image and evaluates styling elements.
                            </p>

                        </div>

                        <div className="card">

                            <Shirt size={28} />

                            <h4>Suggest</h4>

                            <p>
                                Receive recommendations to improve outfit combinations.
                            </p>

                        </div>

                        <div className="card">

                            <Database size={28} />

                            <h4>Store</h4>

                            <p>
                                Future versions will allow users to maintain a digital wardrobe.
                            </p>

                        </div>

                    </div>

                </div>

                {/* FUTURE */}

                <div className="about-block">

                    <h3>Future Vision</h3>

                    <p>

                        The long-term goal of Style-A-Silhouette is to evolve into a complete
                        AI-powered fashion assistant capable of:

                        • detecting clothing types automatically
                        • recommending matching outfits
                        • organizing a digital wardrobe
                        • suggesting clothing combinations based on weather and occasion

                        By integrating machine learning and computer vision technologies,
                        the platform aims to transform the way people interact with their
                        personal style.

                    </p>

                </div>

            </div>

        </section>

    )

}

export default About