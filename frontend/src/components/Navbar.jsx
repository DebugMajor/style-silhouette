import { Link, useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function Navbar() {

    const { user, logout } = useContext(AuthContext)

    const navigate = useNavigate()
    const location = useLocation()

    /* SCROLL LOGIC */

    const goToSection = (id) => {

        if (location.pathname !== "/") {
            navigate("/")

            setTimeout(() => {
                const element = document.getElementById(id)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }, 200)

        } else {

            const element = document.getElementById(id)

            if (element) {
                element.scrollIntoView({ behavior: "smooth" })
            }

        }

    }

    /* TRY APP */

    const handleTryApp = () => {

        if (user) {
            navigate("/dashboard")
        } else {
            navigate("/login")
        }

    }

    return (

        <nav className="navbar">

            <div
                className="logo"
                onClick={() => navigate("/")}
            >
                STYLE-A-SILHOUETTE
            </div>

            <div className="nav-links">

                <Link to="/">Home</Link>

                <button onClick={() => goToSection("about")}>
                    About
                </button>

                <button onClick={() => goToSection("features")}>
                    Features
                </button>

                <button onClick={() => goToSection("roadmap")}>
                    Roadmap
                </button>

                <button onClick={() => goToSection("team")}>
                    Team
                </button>

                <button className="try-btn" onClick={handleTryApp}>
                    Try App
                </button>

                {/* NOT LOGGED IN */}

                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {/* LOGGED IN */}

                {user && (
                    <button
                        className="logout-btn"
                        onClick={() => {
                            logout()
                            navigate("/")
                        }}
                    >
                        Logout
                    </button>
                )}

            </div>

        </nav>

    )

}

export default Navbar