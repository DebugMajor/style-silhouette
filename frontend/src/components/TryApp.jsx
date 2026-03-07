import { Link } from "react-router-dom"

function TryApp() {

    return (

        <section className="section">

            <h2 className="section-title">
                Try Style-A-Silhouette
            </h2>

            <div className="grid">

                <div className="card">

                    <h3>Capture Image</h3>

                    <p>
                        Use the device camera to analyze your outfit.
                    </p>

                    <Link to="/camera">
                        <button>Open Camera</button>
                    </Link>

                </div>

                <div className="card">

                    <h3>Upload Image</h3>

                    <p>
                        Upload a picture of your outfit.
                    </p>

                    <button>Upload</button>

                </div>

                <div className="card">

                    <h3>Voice Styling</h3>

                    <p>
                        Ask the AI styling assistant.
                    </p>

                    <button>Start Voice</button>

                </div>

            </div>

        </section>

    )

}

export default TryApp