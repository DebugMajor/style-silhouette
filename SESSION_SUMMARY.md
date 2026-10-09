# Style Silhouette & Fashion Recommender AI Agent - Setup & Troubleshooting Guide

This guide summarizes all setup instructions, configuration updates, and issue resolutions implemented for the project. Share this file with any contributors working on the codebase.

---

## 🚀 Quick Start Guide for Contributors

### Prerequisites
- Node.js (v18+) & npm
- Python 3.12+
- Docker & Docker Compose
- `uv` (Python package manager)

---

## 🛠️ Step-by-Step Launch Instructions

### 1. Start Vector DB (Qdrant)
In PowerShell inside `ai-agent/`:
```powershell
docker-compose up -d
```

### 2. Start Python AI Agent (Port 8000)
In PowerShell inside `ai-agent/`:
```powershell
$env:Path = "C:\Users\neeraj\.local\bin;$env:Path"
uv sync
uv run uvicorn src.backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`

### 3. Start Node.js Express Backend (Port 5000)
In PowerShell inside `backend/`:
```powershell
npm start
```

### 4. Start React / Next.js Frontend
In PowerShell inside `frontend/` (or `ai-agent/src/frontend/`):
```powershell
npm run dev
```
- **Frontend App:** `http://localhost:5173` or `http://localhost:3000`

---

## ⚙️ Important Environment Variables

### `ai-agent/.env`
```env
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=...
LLM_MODEL=gpt-4o-mini
VTON_MODEL=gemini-2.5-flash
QDRANT_URL=http://localhost:6333
CLIP_MODEL_NAME=patrickjohncyh/fashion-clip
COLLECTION_NAME=ctl_sample_5
```

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=supersecretkey
AGENT_URL=http://localhost:8000
OPENAI_API_KEY=sk-proj-...
```

---

## 🔧 Major Bug Fixes & Improvements Resolved

1. **Windows PowerShell Command Chaining (`&&` error)**
   - **Issue:** PowerShell 5.1 throws parser error on `&&`.
   - **Fix:** Use `;` to separate commands (e.g. `cd ai-agent; docker-compose up -d`).

2. **`request entity too large` (HTTP 413) on Image Uploads**
   - **Issue:** Express `express.json()` defaulted to 100 KB limit, rejecting base64 photos.
   - **Fix:**
     - Added client-side image resizing/compression (max 1200px JPEG) in `VirtualTryOn.jsx`.
     - Increased Express payload limit to `100mb` in `backend/app.js`.
     - Added `fixRequestBody` to proxy middleware in `backend/routes/agentRoutes.js`.

3. **"Invalid Token" Auth Interruption**
   - **Issue:** Stale JWT in local storage blocked Virtual Try-On API requests.
   - **Fix:**
     - Added automatic guest fallback in `backend/middleware/authMiddleware.js`.
     - Added Axios 401 response interceptor in `frontend/src/context/AuthContext.jsx` to clear stale tokens and auto-retry requests.

4. **PyTorch CUDA Initialization Crash (`Found no NVIDIA driver`)**
   - **Issue:** `main.py` and `retrieval.py` had hardcoded `.cuda()` calls.
   - **Fix:** Updated device selection to `device = "cuda" if torch.cuda.is_available() else "cpu"`.

5. **FastAPI Virtual Try-On Routes**
   - **Fix:** Implemented `/vton` and `/vton/history` routes in `ai-agent/src/backend/app/main.py`.
