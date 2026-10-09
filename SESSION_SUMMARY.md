# Style Silhouette & Fashion Recommender AI Agent
## Setup and Troubleshooting Guide

This guide summarizes the local setup steps, configuration examples, and issue resolutions for contributors working on the project. It intentionally contains **no real API keys or production secrets**.

## Quick start

### Prerequisites

- Node.js 18 or later and npm
- Python 3.12 or later
- Docker Desktop with Docker Compose
- `uv` (Python package manager)

## Launch the project

Run each service in its own terminal. Commands below assume Windows PowerShell and that each terminal starts in the specified project directory.

### 1. Start Qdrant (vector database)

From `ai-agent/`:

```powershell
docker compose up -d
```

If your Docker installation only supports the legacy command, use `docker-compose up -d` instead.

### 2. Start the Python AI agent (port 8000)

From `ai-agent/`:

```powershell
# Optional: add uv's usual per-user install directory to PATH for this terminal.
$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
uv sync
uv run uvicorn src.backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

- API base URL: <http://localhost:8000>
- Swagger API docs: <http://localhost:8000/docs>

If `uv` is already on your PATH, the first two commands are unnecessary.

### 3. Start the Node.js Express backend (port 5000)

From `backend/`:

```powershell
npm install
npm start
```

### 4. Start the frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

For the Vite frontend, the expected local URL is <http://localhost:5173>. Use the URL printed by the development server if it differs. The separate `ai-agent/` Python service is not the frontend.

## Environment configuration

Create local `.env` files from the relevant example files and fill in credentials on your own machine. **Do not commit `.env` files, real credentials, or copied terminal output containing secrets.** Keep `.env.example` files limited to blank values or safe placeholders.

### `ai-agent/.env`

```env
OPENAI_API_KEY=
GOOGLE_API_KEY=
LANGSMITH_API_KEY=
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=fashion-recommender
LLM_MODEL=gpt-4o-mini
VTON_MODEL=gemini-2.5-flash
QDRANT_URL=http://localhost:6333
CLIP_MODEL_NAME=patrickjohncyh/fashion-clip
COLLECTION_NAME=ctl_sample_5
```

### `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/style_silhouette
JWT_SECRET=replace_with_a_long_random_secret
AGENT_URL=http://localhost:8000
OPENAI_API_KEY=
TRIPO_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
AI_VISION_API_KEY=
TTS_API_KEY=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

These are examples, not verified production values. Use the model names, database URI, and variables required by the checked-out code and your own environment. If the project uses MongoDB Atlas, put your Atlas connection string in your local `backend/.env`; do not put it in this shared guide.

## Major fixes and troubleshooting notes

### 1. PowerShell command chaining

**Issue:** Windows PowerShell 5.1 can reject `&&` when used to chain commands.

**Workaround:** Run commands on separate lines, or use `;` where appropriate. For example:

```powershell
Set-Location ai-agent
docker compose up -d
```

### 2. `request entity too large` (HTTP 413) during image upload

**Issue:** Express's default JSON body-size limit can be too small for base64-encoded photos.

**Changes noted for this project:**

- Added client-side image resizing/compression (JPEG, maximum dimension 1200 px) in `VirtualTryOn.jsx`.
- Increased the Express payload limit to `100mb` in `backend/app.js`.
- Added `fixRequestBody` to proxy middleware in `backend/routes/agentRoutes.js`.

**Caution:** Large body limits increase memory and abuse risk. Keep client-side resizing enabled and avoid raising limits further without a need.

### 3. Invalid-token authentication interruption

**Issue:** A stale JWT stored in the browser can cause protected API requests to return `401`.

**Changes noted for this project:**

- Added guest fallback handling in `backend/middleware/authMiddleware.js`.
- Added an Axios `401` response interceptor in `frontend/src/context/AuthContext.jsx` to clear stale tokens and retry requests.

Verify the behavior against the current code before relying on guest access for protected operations.

### 4. PyTorch CUDA initialization crash (`Found no NVIDIA driver`)

**Issue:** Hardcoded `.cuda()` calls can fail on machines without a compatible NVIDIA driver.

**Fix:** Select CUDA only when it is available; otherwise use CPU. For example:

```python
device = "cuda" if torch.cuda.is_available() else "cpu"
```

Make sure tensors and models are moved to the same selected device.

### 5. FastAPI virtual try-on routes

**Change noted for this project:** `/vton` and `/vton/history` routes were added in `ai-agent/src/backend/app/main.py`.

If the virtual try-on endpoint fails, check the Python agent logs, confirm Qdrant is running when required, verify local environment variables, and inspect the actual HTTP response. A local compositing fallback may produce an approximate overlay rather than realistic garment fitting; this is different from a model-based virtual try-on result.

## Before sharing or pushing changes

- Keep `backend/.env`, `ai-agent/.env`, and other local secret files out of Git.
- Use placeholders in `.env.example` files; never paste API keys into documentation.
- If a credential was committed or shared, revoke or rotate it with its provider. Removing it from the latest file alone does not remove it from earlier Git history.
- Review the staged changes before committing:

```powershell
git status
git diff --cached
```
