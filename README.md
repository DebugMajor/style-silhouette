🚀 Style-A-Silhouette
📷 Camera-Based Smart Styling & Digital Wardrobe System


🌟 Project Overview

Style-A-Silhouette is a smart styling assistance platform that uses camera input + intelligent feedback to help users evaluate outfit choices.

In Phase 1, the system:

Captures user image via camera

Uploads image to backend

Generates styling suggestion

Converts suggestion into voice feedback

🎯 Problem Statement

Many users:

👕 Own many clothes but can’t decide outfits
🧠 Forget wardrobe items
🎨 Lack styling feedback
👗 Can’t visualize outfit combinations

This project solves wardrobe decision fatigue using camera + feedback + future AI.

🧱 System Architecture
User Camera (Browser)
        ↓
React Frontend (UI + Capture + Voice)
        ↓
Node.js + Express Backend (Upload + Response)
        ↓
Future → AI / Computer Vision / Cloud Storage

🛠 Tech Stack
🎨 Frontend

⚛ React (Vite)

🟨 JavaScript (ES6+)

📷 Browser Camera API (getUserMedia)

🔊 Web Speech API (Text → Speech)

🔗 Axios (API communication)

⚙ Backend

🟢 Node.js

🚂 Express.js

📤 Multer (Image Upload Handling)

🌐 CORS (Frontend ↔ Backend Communication)

☁ Future Tech (Planned)

🍃 MongoDB Atlas — Wardrobe storage

☁ Cloudinary / AWS S3 — Image storage

🧠 Python + OpenCV — Computer Vision

🤖 MediaPipe / TensorFlow — AI Modeling

📂 Project Structure
style-silhouette/
│
├ frontend/
│ ├ src/
│ │ ├ components/
│ │ │ ├ CameraCapture.js
│ │ │ └ VoiceOutput.js
│ │ ├ pages/
│ │ │ └ HomePage.js
│ │ ├ services/
│ │ │ └ api.js
│ │ └ App.js
│
├ backend/
│ ├ routes/
│ │ └ cameraRoutes.js
│ ├ controllers/
│ │ └ cameraController.js
│ ├ services/
│ │ └ messageService.js
│ └ server.js
│
└ README.md

👥 Team Development Workflow

This project follows Feature Branch Workflow

main → Stable production code
develop → Integration branch
feature/* → Individual development branches

🔀 Example Branches
feature/camera-module
feature/frontend-ui
feature/backend-api

🚀 Getting Started
📌 Prerequisites

Install:

Node.js

Git

npm

📌 Frontend Setup
cd frontend
npm install
npm run dev


🌐 Runs on:

http://localhost:5173

📌 Backend Setup
cd backend
npm install
nodemon server.js


🌐 Runs on:

http://localhost:5000

🔄 Phase 1 Data Flow
📷 Open Camera
↓
📸 Capture Image
↓
⬆ Upload To Backend
↓
🧠 Backend Generates Message
↓
🔊 Speech API Speaks Feedback

🧠 Future Roadmap
🟢 Phase 2

Digital Wardrobe System

Cloud Image Storage

Outfit History Tracking

🔵 Phase 3

Clothing Detection (Computer Vision)

Color Analysis

Outfit Classification

🟣 Phase 4

2D Virtual Try-On

Pose Detection

AI Style Learning

💼 Industry Use Cases

🛍 Fashion Tech Platforms
🪞 Smart Mirror Systems
🛒 E-Commerce Styling Assistants
🤖 AI Personal Assistants
🏬 Retail Technology

🏆 Innovation Highlights

✨ Camera + Voice Feedback Integration
⚙ Scalable Microservice-Ready Backend
🧱 Modular MERN Architecture
🧠 AI-Ready Design

📜 License

Educational / Research Use Only

🤝 Contributors

👨‍💻 Shashwat Dhondyal

👩‍💻 Tejaswini Rath

👨‍💻 Sanjay Suthar

👨‍💻 Narayan Hari Singh

⭐ Project Vision

To evolve from a camera styling assistant into a full smart wardrobe ecosystem powered by:

☁ Cloud Computing
🧠 Computer Vision
🤖 AI Personalization