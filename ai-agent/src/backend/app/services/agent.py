import os
from langsmith import traceable, get_current_run_tree
from src.backend.app.models.schemas import AgentResponse, State
from jinja2 import Template
import instructor
import logging
from litellm import completion
from langchain_core.messages import convert_to_openai_messages, AIMessage
from src.backend.app.utils.utils import format_ai_message
from src.backend.app.config import settings
from src.backend.app.dependencies import deps




def _offline_style_fallback(state: State) -> str:
    """Return concise local guidance tailored to the latest user question."""
    query = ""
    # Search backward for the latest user message, ignoring assistant/tool messages.
    for message in reversed(state.messages or []):
        if isinstance(message, dict):
            role = message.get("role", "")
            content = message.get("content", "")
        else:
            role = getattr(message, "type", getattr(message, "role", ""))
            content = getattr(message, "content", "")
        if role in ("user", "human"):
            if isinstance(content, list):
                content = " ".join(
                    str(part.get("text", "")) if isinstance(part, dict) else str(part)
                    for part in content
                )
            query = str(content)
            break

    q = query.lower()

    # Specific intents must be checked before broad terms such as "casual".
    if any(term in q for term in ("try on", "try-on", "virtual try", "virtually")):
        advice = (
            "To try on a garment virtually, open the Virtual Try-On page, add a clear photo of yourself, "
            "choose or upload a garment, and start the try-on. This is a navigation guide; the live AI "
            "try-on service is not being called while the agent is offline."
        )
    elif any(term in q for term in (
        "color", "colour", "colors", "colours", "palette", "what goes with", "work well together",
        "match", "matching", "combination of colours", "combination of colors"
    )):
        if any(term in q for term in ("business", "office", "work", "formal")):
            advice = (
                "For business-casual colours, start with navy, charcoal, beige, white, or light blue. "
                "A navy trouser with a white or light-blue shirt is a reliable combination; add brown shoes "
                "and a matching belt. Keep to two or three main colours, with olive or burgundy as a subtle accent."
            )
        else:
            advice = (
                "Build the outfit around one neutral (navy, grey, beige, black, or white), then add one "
                "complementary colour. For an easy combination, try navy with white and light blue, beige with "
                "olive and white, or charcoal with burgundy. Keep the palette to two or three main colours."
            )
    elif any(term in q for term in ("shoe", "shoes", "footwear", "sneaker", "boots", "loafers")):
        if any(term in q for term in ("formal", "business", "office", "interview")):
            advice = (
                "For business-casual outfits, brown or black loafers and simple leather derbies are dependable. "
                "Brown pairs especially well with navy, beige, and olive; black looks sharper with charcoal or black. "
                "Choose clean, minimal shoes and match the belt colour when practical."
            )
        else:
            advice = (
                "Clean white or off-white sneakers pair easily with jeans, chinos, and summer outfits. "
                "For a smarter look, try brown loafers; for rain or colder weather, choose simple boots. "
                "Match shoe formality to the occasion and keep them clean."
            )
    elif any(term in q for term in ("trend", "latest", "search the web", "what's in", "what is in")):
        advice = (
            "I can't retrieve live trend results while the AI service is unavailable. As a general starting point, "
            "try relaxed tailoring, versatile neutral basics, and one accent piece that fits your personal style. "
            "Treat this as general guidance rather than a live trend report."
        )
    elif any(term in q for term in ("wardrobe", "closet", "what should i wear", "from my clothes")):
        advice = (
            "Start with one item you want to wear, then build around it: choose a complementary top or bottom, "
            "keep the colours coordinated, and select shoes for the occasion. I can't inspect your saved wardrobe "
            "while the live AI service is unavailable."
        )
    elif any(term in q for term in ("formal", "office", "interview", "business casual", "business-casual")):
        advice = (
            "For a business-casual look, pair a well-fitted Oxford shirt or fine-knit polo with navy or charcoal "
            "chinos, clean loafers, and a simple belt. A lightweight blazer adds polish when needed. Prioritize fit "
            "and keep accessories understated."
        )
    elif any(term in q for term in ("summer", "casual", "day out", "weekend")):
        advice = (
            "For a casual summer look, try a breathable cotton or linen T-shirt or relaxed short-sleeve shirt, "
            "straight-fit chinos or jeans, and clean white sneakers. Keep the outfit to two or three colours; "
            "neutral bottoms make the combination easy to coordinate."
        )
    else:
        advice = (
            "A reliable outfit formula is one statement piece, two complementary basics, and shoes suited to the "
            "occasion. Prioritize fit, breathable fabrics, and a palette of two or three colours. Tell me the "
            "occasion, weather, or garment you want help with for a more specific suggestion."
        )

    return (
        "The live AI model is temporarily unavailable because of an API quota or provider compatibility limit. "
        "Here is a local styling suggestion tailored to your question instead:\n\n" + advice
    )
@traceable(
    name="agent_node",
    run_type="llm",
    metadata={
        "ls_provider": "openai",
        "ls_model_name": settings.llm_model
    },
)
def agent_node(state: State) -> dict:
    # BaseSettings reads .env but does not export its values to os.environ; LiteLLM reads OPENAI_API_KEY from the process environment.
    os.environ["OPENAI_API_KEY"] = settings.openai_api_key


    # Load the prompt through the project's prompt manager so this works on Windows and other contributors' machines.
    prompt_template = deps.prompt_manager.get_prompt("agent")
    if not prompt_template:
        raise RuntimeError("Agent prompt is empty. Check ai-agent/prompts/agent.yaml.")

    template = Template(prompt_template)

    prompt = template.render(available_tools=state.available_tools)

    conversations = []
    messages = state.messages

    for message in messages:
        conversations.append(convert_to_openai_messages(message))

    # Pydantic reads .env into settings but does not export values to LiteLLM's process env.
    # Set both supported Gemini key names from the loaded settings without logging the secret.
    if settings.google_api_key:
        os.environ["GEMINI_API_KEY"] = settings.google_api_key
        os.environ["GOOGLE_API_KEY"] = settings.google_api_key

    try:
        client = instructor.from_litellm(completion)
        response, raw_response = client.chat.completions.create_with_completion(
            model=settings.llm_model,
            response_model=AgentResponse,
            messages=[{
                "role": "system",
                "content": prompt
            }, *conversations],
        )

    except Exception as exc:
        # Provider exceptions can include API keys in request URLs; log only the exception class.
        logging.getLogger(__name__).warning(
            "LLM call failed (%s); using local fallback after model error", type(exc).__name__
        )
        fallback_answer = _offline_style_fallback(state)
        return {
            "messages": [AIMessage(content=fallback_answer)],
            "tool_calls": [],
            "iteration": state.iteration + 1,
            "answer": fallback_answer,
            "final_answer": True,
            "images": state.images,
        }

    ai_message = format_ai_message(response)
    for image in (response.images or []):
        state.images.append(image)

    current_run = get_current_run_tree()

    if current_run:
        current_run.metadata["usage_metadata"] = {
            "input_tokens": raw_response.usage.prompt_tokens,
            "output_tokens": raw_response.usage.completion_tokens,
            "total_tokens": raw_response.usage.total_tokens
        }

    return {
        "messages": [ai_message],
        "tool_calls": response.tool_calls,
        "iteration": state.iteration + 1,
        "answer": response.answer,
        "final_answer": response.final_answer,
        "images": state.images
    }
