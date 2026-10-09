from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.backend.app.dependencies import deps
from src.backend.app.config import settings
from qdrant_client import QdrantClient
from transformers import CLIPModel, CLIPProcessor
from src.backend.app.services.session import SessionManager
from src.backend.app.models.schemas import ChatRequest, SessionDataResponse
from src.backend.app.services.graph import invoke_graph
from src.backend.app.prompt_manager import PromptManager


import torch


@asynccontextmanager
async def lifespan(app: FastAPI):
    deps.qdrant_client = QdrantClient(url=settings.qdrant_url, check_compatibility=False)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    deps.clip_model = CLIPModel.from_pretrained(settings.clip_model_name).to(device)
    deps.clip_processor = CLIPProcessor.from_pretrained(settings.clip_model_name)
    deps.session_manager = SessionManager()
    deps.prompt_manager = PromptManager()

    yield

    deps.qdrant_client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_qdrant_client() -> QdrantClient:
    return deps.qdrant_client


def get_clip_model():
    return deps.clip_model, deps.clip_processor


from pydantic import BaseModel
from typing import Optional
from src.backend.app.utils.image_utils import get_image_from_source, bytes_to_base64_data_url
from src.backend.app.services.vton import virtual_try_on_agent

class VTONRequest(BaseModel):
    model_image: str
    clothing_image: str
    category: Optional[str] = "upper_body"
    garment_description: Optional[str] = "fashion garment"

vton_history_store = []


@app.post("/chat")
async def chat(
        request: ChatRequest,
        qdrant_client: QdrantClient = Depends(get_qdrant_client),
        clip: tuple = Depends(get_clip_model),
):
    return invoke_graph(request, qdrant_client, clip)


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    session_data = deps.session_manager.get_session_data(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return session_data


@app.post("/vton")
async def vton(req: VTONRequest):
    try:
        model_img = get_image_from_source(req.model_image)
        item_img = get_image_from_source(req.clothing_image)
        image_bytes, mime_type = virtual_try_on_agent(model_img, [item_img])
        result_url = bytes_to_base64_data_url(image_bytes, mime_type)
        vton_history_store.append(result_url)
        return {"success": True, "result_image": result_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vton/history")
async def vton_history():
    return {"success": True, "data": vton_history_store}

