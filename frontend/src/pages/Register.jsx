import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Mail, Lock } from "lucide-react"
import { AuthContext } from "../context/AuthContext"

function Register() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const { login } = useContext(AuthContext)

    const handleRegister = async (e) => {

        e.preventDefault()

        try {

            const res = await fetch("http://localhost:5000/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })

            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

            /* SAVE TOKEN */

            login(data.token)

            /* REDIRECT */

            navigate("/camera")

        } catch (err) {

            setError(err.message)

        }

    }

    return (

        <div className="auth-page">

            <div className="auth-card">

                <h2 className="auth-title">
                    Create Account
                </h2>

                <p className="auth-subtitle">
                    Join Style-A-Silhouette
                </p>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleRegister} className="auth-form">

                    <div className="input-group">

                        <User size={18} />

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <Mail size={18} />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <Lock size={18} />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                    </div>

                    <button className="auth-btn">
                        Create Account
                    </button>

                </form>

                <p className="auth-switch">

                    Already have an account?
                    <Link to="/login"> Login</Link>

                </p>

            </div>

        </div>

    )

}

export default Register