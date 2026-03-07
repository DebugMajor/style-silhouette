import { Camera, Search, Sparkles, Database } from "lucide-react"

function Roadmap() {

    const phases = [

        {
            title: "Phase 1",
            icon: <Camera size={28} />,
            desc: "Camera Capture & UI",
            details: [
                "Camera access using getUserMedia",
                "Image capture interface",
                "Landing page UI development"
            ]
        },

        {
            title: "Phase 2",
            icon: <Search size={28} />,
            desc: "Outfit Analysis System",
            details: [
                "Upload outfit images",
                "Basic outfit analysis logic",
                "Color combination detection"
            ]
        },

        {
            title: "Phase 3",
            icon: <Sparkles size={28} />,
            desc: "AI Styling Recommendation",
            details: [
                "Integrate AI styling model",
                "Generate outfit suggestions",
                "Recommend improvements"
            ]
        },

        {
            title: "Phase 4",
            icon: <Database size={28} />,
            desc: "Digital Wardrobe System",
            details: [
                "Store outfits in database",
                "Organize clothing items",
                "Smart wardrobe suggestions"
            ]
        }

    ]

    return (

        <section id="roadmap" className="section">

            <div className="container">

                <h2 className="section-title">
                    Development Roadmap
                </h2>

                <div className="roadmap-container">

                    {phases.map((phase, index) => (

                        <div className="roadmap-card" key={index}>

                            <div className="roadmap-icon">
                                {phase.icon}
                            </div>

                            <h3>{phase.title}</h3>

                            <p className="roadmap-desc">
                                {phase.desc}
                            </p>

                            <ul>

                                {phase.details.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}

                            </ul>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    )

}

export default Roadmap