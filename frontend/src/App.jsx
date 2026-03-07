import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"
import DashboardLayout from "./layouts/DashboardLayout"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Camera from "./pages/Camera"
import Wardrobe from "./pages/Wardrobe"
import Suggestions from "./pages/Suggestions"
import Upload from "./pages/Upload"
import Voice from "./pages/Voice"

function App() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* PUBLIC ROUTES */}

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


                {/* DASHBOARD ROUTES */}

                <Route path="/dashboard" element={<DashboardLayout />}>

                    <Route path="camera" element={<Camera />} />
                    <Route path="wardrobe" element={<Wardrobe />} />
                    <Route path="suggestions" element={<Suggestions />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="voice" element={<Voice />} />

                </Route>

            </Routes>

        </BrowserRouter>

    )

}

export default App