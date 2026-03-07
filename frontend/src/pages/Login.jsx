import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock } from "lucide-react"
import { AuthContext } from "../context/AuthContext"

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const { login } = useContext(AuthContext)

    const handleLogin = async (e) => {

        e.preventDefault()

        try {

            const res = await fetch("http://localhost:5000/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Login failed")
            }

            /* SAVE TOKEN + UPDATE CONTEXT */

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
                    Login
                </h2>

                <p className="auth-subtitle">
                    Access your Style-A-Silhouette account
                </p>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleLogin} className="auth-form">

                    <div className="input-group">

                        <Mail size={18} />

                        <input
                            type="email"
                            placeholder="Email"
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
                        Login
                    </button>

                </form>

                <p className="auth-switch">

                    Don't have an account?
                    <Link to="/register"> Register</Link>

                </p>

            </div>

        </div>

    )

}

export default Login