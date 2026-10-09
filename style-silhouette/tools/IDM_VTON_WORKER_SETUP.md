# IDM-VTON Worker Setup

The project uses the provided Colab notebook as a GPU worker and the Express backend as the application-facing API.

## 1. Start the worker

Open `tools/IDM_VTON_Worker.ipynb` in Google Colab with a CUDA GPU runtime. Run the cells in order. The final cell launches the patched official IDM-VTON Gradio demo with `share=True`.

Copy the public `https://....gradio.live` URL printed by Colab.

## 2. Configure the backend

Create `backend/.env` from `backend/.env.example` and set:

```env
IDM_VTON_WORKER_URL=https://YOUR-WORKER.gradio.live
```

Do not commit `backend/.env`.

## 3. Install backend dependencies

From `backend/` run:

```bash
npm install
```

The backend uses `@gradio/client` to call the named `/tryon` endpoint exposed by the worker. The client uploads the model and garment images and waits for the queued Gradio job to return the generated result.

## 4. Run the application

Start the backend:

```bash
npm start
```

Start the frontend from `frontend/` using the existing Vite command configured in the project.

## 5. Virtual Try-On flow

1. Open **Virtual Try-On**.
2. Upload a **Model Photo** or capture one with the camera.
3. Upload a **Clothing Photo**.
4. Choose **Upper**, **Lower**, or **Dress**.
5. Click **Generate Virtual Try-On**.
6. The backend calls the Colab IDM-VTON worker.
7. The actual IDM-VTON output is shown in the result panel.
8. Download or save the generated result.

## Important

There is intentionally no synthetic/fake clothing-composite fallback anymore. If the IDM-VTON worker is unavailable or misconfigured, the UI shows an error instead of claiming that a fake result is an AI result.

The Digital Wardrobe remains a separate feature; Virtual Try-On now uses direct model/clothing uploads for IDM-VTON.
