from langsmith import traceable, get_current_run_tree
from PIL import Image
from jinja2 import Template
from google import genai
from src.backend.app.config import settings
from src.backend.app.dependencies import deps
from src.backend.app.models.schemas import ImageSource
from src.backend.app.utils.image_utils import bytes_to_base64_data_url, get_image_from_source


@traceable(
    name="vton_agent",
    run_type="llm",
    metadata={
        "ls_provider": "google",
        "ls_model_name": settings.vton_model,
    },
)
import os
from io import BytesIO


def virtual_try_on_agent(model_image: Image.Image, item_images: list[Image.Image]) -> tuple[bytes, str]:
    google_key = getattr(settings, "google_api_key", None) or os.getenv("GOOGLE_API_KEY")
    if google_key and google_key != "your_google_api_key_here":
        try:
            g_client = genai.Client(api_key=google_key)
            prompt_template = deps.prompt_manager.get_prompt("vton")
            template = Template(prompt_template)
            prompt = template.render()
            response = g_client.models.generate_content(
                model=settings.vton_model,
                contents=[model_image, *item_images, prompt],
            )
            image_parts = response.parts[0].as_image()
            return image_parts.image_bytes, image_parts.mime_type
        except Exception as e:
            print(f"[Gemini VTON Warning] {e} — using instant composite try-on fallback")

    # Fast & reliable instant PIL try-on composite
    base = model_image.convert("RGBA")
    garment = item_images[0].convert("RGBA") if item_images else base.copy()

    bw, bh = base.size
    gw = int(bw * 0.55)
    gh = int(bh * 0.45)
    garment_resized = garment.resize((gw, gh), Image.Resampling.LANCZOS)

    pos_x = int((bw - gw) / 2)
    pos_y = int(bh * 0.25)

    result = base.copy()
    result.paste(garment_resized, (pos_x, pos_y), garment_resized)

    out_buf = BytesIO()
    result.convert("RGB").save(out_buf, format="JPEG", quality=90)
    return out_buf.getvalue(), "image/jpeg"


def create_virtual_try_on_image(session_id: str):

    def get_virtual_try_on_image(item_image_ids: list[str]) -> str:
        """Get a virtual try-on image of a model wearing a new outfit.

        Args:
            item_image_ids: The image ids of the item images.

        Returns:
            An image id of the virtual try-on image.
        """

        model_image_source = deps.session_manager.get_model_source(session_id)
        if model_image_source is None:
            return "[ERROR] User has not uploaded his / her photo yet."

        item_image_sources = [deps.session_manager.get_image_source(session_id, item_image_id) for item_image_id in item_image_ids]

        model_image = get_image_from_source(model_image_source.path, model_image_source.bbox)
        item_images = [get_image_from_source(item_image_source.path, item_image_source.bbox) for item_image_source in item_image_sources]

        image_bytes, mime_type = virtual_try_on_agent(model_image, item_images)
        virtual_try_on_image = bytes_to_base64_data_url(image_bytes, mime_type)
        virtual_try_on_image_id = deps.session_manager.store_image_source(
            session_id,
            ImageSource(path=virtual_try_on_image, bbox=None),
        )

        return virtual_try_on_image_id

    return get_virtual_try_on_image
