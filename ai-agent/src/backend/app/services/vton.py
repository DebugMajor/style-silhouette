
import os
from io import BytesIO

from langsmith import traceable, get_current_run_tree
from PIL import Image, ImageDraw
from jinja2 import Template
from google import genai

from src.backend.app.config import settings
from src.backend.app.dependencies import deps
from src.backend.app.models.schemas import ImageSource
from src.backend.app.utils.image_utils import (
    bytes_to_base64_data_url,
    get_image_from_source,
)


def _remove_dark_background(image: Image.Image) -> Image.Image:
    """Make connected black background regions transparent."""
    image = image.convert("RGBA")
    width, height = image.size

    corners = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
    ]

    for point in corners:
        r, g, b, a = image.getpixel(point)

        # Remove only dark backgrounds connected to image corners.
        if a > 0 and r < 55 and g < 55 and b < 55:
            ImageDraw.floodfill(
                image,
                point,
                (0, 0, 0, 0),
                thresh=35,
            )

    return image


def _local_try_on(
    model_image: Image.Image,
    item_images: list[Image.Image],
) -> tuple[bytes, str]:
    """Create a better-proportioned local try-on composite."""

    if not item_images:
        raise ValueError("Please upload a clothing image.")

    base = model_image.convert("RGBA")
    garment = _remove_dark_background(item_images[0])

    # Crop transparent margins around the garment.
    bbox = garment.getbbox()
    if bbox:
        garment = garment.crop(bbox)

    bw, bh = base.size

    # Fit within a smaller torso-sized area without distorting
    # the garment's original aspect ratio.
    max_width = max(1, int(bw * 0.40))
    max_height = max(1, int(bh * 0.31))

    garment.thumbnail(
        (max_width, max_height),
        Image.Resampling.LANCZOS,
    )

    # Center the garment and position it nearer the shoulders.
    pos_x = (bw - garment.width) // 2
    pos_y = int(bh * 0.20)

    # Keep the composite within the model photo.
    pos_x = max(0, min(pos_x, bw - garment.width))
    pos_y = max(0, min(pos_y, bh - garment.height))

    result = base.copy()
    result.alpha_composite(garment, (pos_x, pos_y))

    output = BytesIO()
    result.convert("RGB").save(
        output,
        format="JPEG",
        quality=92,
    )

    return output.getvalue(), "image/jpeg"


@traceable(
    name="vton_agent",
    run_type="llm",
    metadata={
        "ls_provider": "google",
        "ls_model_name": settings.vton_model,
    },
)
def virtual_try_on_agent(
    model_image: Image.Image,
    item_images: list[Image.Image],
) -> tuple[bytes, str]:

    # Set VTON_LOCAL_ONLY=true to avoid calling Gemini.
    local_only = os.getenv(
        "VTON_LOCAL_ONLY", "false"
    ).strip().lower() in ("1", "true", "yes")

    google_key = (
        getattr(settings, "google_api_key", None)
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )

    if not item_images:
        raise ValueError("Please upload a clothing image.")

    if not local_only and google_key:
        try:
            prompt_template = deps.prompt_manager.get_prompt("vton")
            prompt = Template(prompt_template).render()

            client = genai.Client(api_key=google_key)

            response = client.models.generate_content(
                model=settings.vton_model,
                contents=[model_image, *item_images, prompt],
            )

            image_part = next(
                (
                    part
                    for part in response.parts
                    if getattr(part, "inline_data", None) is not None
                ),
                None,
            )

            if image_part is None:
                raise RuntimeError(
                    "Gemini returned no image in its response."
                )

            image_result = image_part.as_image()

            if not image_result or not image_result.image_bytes:
                raise RuntimeError("Gemini returned an empty image.")

            current_run = get_current_run_tree()
            usage = getattr(response, "usage_metadata", None)

            if current_run and usage:
                current_run.metadata["usage_metadata"] = {
                    "input_tokens": usage.prompt_token_count,
                    "output_tokens": usage.candidates_token_count,
                    "total_tokens": usage.total_token_count,
                }

            return (
                image_result.image_bytes,
                image_result.mime_type,
            )

        except Exception as exc:
            print(
                f"[Gemini VTON Warning] {exc}. "
                "Falling back to local image composite."
            )

    else:
        print("[VTON] Using local image-composite mode.")

    return _local_try_on(model_image, item_images)


def create_virtual_try_on_image(session_id: str):

    def get_virtual_try_on_image(item_image_ids: list[str]) -> str:
        """Generate a try-on image and return its stored image ID."""

        model_image_source = deps.session_manager.get_model_source(
            session_id
        )

        if model_image_source is None:
            return "[ERROR] User has not uploaded a model photo yet."

        item_image_sources = [
            deps.session_manager.get_image_source(
                session_id, item_image_id
            )
            for item_image_id in item_image_ids
        ]

        model_image = get_image_from_source(
            model_image_source.path,
            model_image_source.bbox,
        )

        item_images = [
            get_image_from_source(
                item_image_source.path,
                item_image_source.bbox,
            )
            for item_image_source in item_image_sources
        ]

        image_bytes, mime_type = virtual_try_on_agent(
            model_image,
            item_images,
        )

        virtual_try_on_image = bytes_to_base64_data_url(
            image_bytes,
            mime_type,
        )

        return deps.session_manager.store_image_source(
            session_id,
            ImageSource(path=virtual_try_on_image, bbox=None),
        )

    return get_virtual_try_on_image
