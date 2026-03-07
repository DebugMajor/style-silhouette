Style-A-Silhouette
Camera-Based Smart Styling & Digital Wardrobe Assistant
Project Overview

Style-A-Silhouette is a smart styling assistant that helps users evaluate and improve their outfit choices using camera input and intelligent feedback.

In Phase 1, the system captures a user’s image through the device camera, sends it to the backend, generates styling suggestions, and provides voice feedback to the user.

The long-term vision is to build a complete AI-powered wardrobe system that can analyze clothing, recommend outfits, and help users manage their wardrobe digitally.

Problem Statement

Many people face common wardrobe problems:

Owning many clothes but struggling to choose an outfit

Forgetting what items they already have in their wardrobe

Lacking feedback on outfit combinations

Difficulty visualizing how outfits look together

Style-A-Silhouette aims to solve this problem by combining camera input, intelligent feedback, and future AI capabilities to assist users in making better styling decisions.

System Architecture
User Camera (Browser)
        ↓
React Frontend (UI + Capture + Voice)
        ↓
Node.js + Express Backend (Upload + Processing)
        ↓
Future Integration
AI / Computer Vision / Cloud Storage
Tech Stack
Frontend

React (Vite) — Frontend framework

JavaScript (ES6+)

Browser Camera API (getUserMedia) — Capture user images

Web Speech API — Convert text feedback into speech

Axios — Communication with backend APIs

Backend

Node.js — Server runtime

Express.js — Backend framework

Multer — Image upload handling

CORS — Enables frontend ↔ backend communication

Future Technologies (Planned)

MongoDB Atlas — Digital wardrobe database

Cloudinary / AWS S3 — Image storage

Python + OpenCV — Computer vision

MediaPipe / TensorFlow — AI model integration

Project Structure
style-silhouette/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.js
│   │   │   └── VoiceOutput.js
│   │   ├── pages/
│   │   │   └── HomePage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│
├── backend/
│   ├── routes/
│   │   └── cameraRoutes.js
│   ├── controllers/
│   │   └── cameraController.js
│   ├── services/
│   │   └── messageService.js
│   └── server.js
│
└── README.md
Team Development Workflow

The project follows a Feature Branch Workflow to maintain organized development.

Branch Structure

main → Stable production code

develop → Integration branch for testing features

feature/ → Individual feature development

Example Feature Branches
feature/camera-module
feature/frontend-ui
feature/backend-api
Getting Started
Prerequisites

Install the following tools:

Node.js

Git

npm

Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
Backend Setup
cd backend
npm install
nodemon server.js

Backend runs on:

http://localhost:5000
Phase 1 Workflow
Open Camera
      ↓
Capture Image
      ↓
Upload Image to Backend
      ↓
Backend Generates Styling Suggestion
      ↓
Speech API Provides Voice Feedback
Future Development Roadmap
Phase 2 — Digital Wardrobe

Wardrobe item storage

Cloud image storage

Outfit history tracking

Phase 3 — Computer Vision

Clothing detection

Color analysis

Outfit classification

Phase 4 — AI Styling System

2D virtual try-on

Pose detection

AI-based style recommendations

Industry Use Cases

This system can be used in several fashion-tech applications:

Fashion technology platforms

Smart mirror systems

E-commerce styling assistants

AI personal assistants

Retail technology solutions

Key Highlights

Camera + voice feedback integration

Modular and scalable backend design

Clean MERN-style architecture

AI-ready system for future expansion

License

This project is developed for educational and research purposes.

Contributors

Shashwat Dhondyal

Tejaswini Rath

Sanjay Suthar

Narayan Hari Singh

Project Vision

The long-term goal of Style-A-Silhouette is to evolve into a complete smart wardrobe ecosystem powered by:

Cloud computing

Computer vision

AI-driven personalization

Helping users make smarter and more confident fashion choices.
