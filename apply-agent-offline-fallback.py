#!/usr/bin/env python3
"""Apply a transparent local-response fallback to the Style Silhouette AI agent."""
from pathlib import Path
import shutil
import sys

TARGET = Path("ai-agent/src/backend/app/services/agent.py")
if not TARGET.exists():
    print(f"ERROR: {TARGET} not found. Run this script from the style-silhouette project root.")
    sys.exit(1)

source = TARGET.read_text(encoding="utf-8")
backup = TARGET.with_name(TARGET.name + ".before-offline-fallback.bak")
if "def _offline_style_fallback" in source and "local fallback after model error" in source:
    print("Offline fallback is already installed; no changes made.")
    sys.exit(0)

# Add AIMessage and logging imports without disturbing other imports.
old_import = "from langchain_core.messages import convert_to_openai_messages"
if old_import not in source:
    print("ERROR: Could not locate expected LangChain messages import in agent.py.")
    sys.exit(1)
source = source.replace(old_import, old_import + ", AIMessage", 1)
if "import logging\n" not in source:
    if "import instructor\n" not in source:
        print("ERROR: Could not locate instructor import in agent.py.")
        sys.exit(1)
    source = source.replace("import instructor\n", "import instructor\nimport logging\n", 1)

helper = r'''

def _offline_style_fallback(state: State) -> str:
    # Deterministic fallback used only when the LLM provider fails.
    query = ""
    # The last item may be a tool result, so find the most recent user message.
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
    if any(term in q for term in ("try on", "try-on", "virtual try", "virtually")):
        advice = (
            "To use Virtual Try-On, open the Virtual Try-On page, upload a clear photo of yourself, "
            "select or upload a garment, and start the try-on. The live AI agent is unavailable right now, "
            "so this is a navigation tip rather than an executed try-on."
        )
    elif any(term in q for term in ("summer", "casual", "day out", "weekend")):
        advice = (
            "For a casual summer look, try a breathable cotton or linen T-shirt or relaxed short-sleeve shirt, "
            "straight-fit chinos or jeans, and clean white sneakers. Keep the outfit to two or three colours; "
            "neutral bottoms make the combination easy to coordinate."
        )
    elif any(term in q for term in ("formal", "office", "interview", "business")):
        advice = (
            "For a smart formal look, pair a well-fitted Oxford shirt with navy or charcoal trousers and "
            "clean loafers or derby shoes. Keep accessories minimal and make sure the shoulders and trouser hem fit well."
        )
    elif any(term in q for term in ("shoe", "shoes", "footwear", "sneaker")):
        advice = (
            "White minimalist sneakers work well with jeans and chinos; brown loafers are a stronger choice "
            "for smart-casual outfits. Match the formality of the shoes to the occasion and keep them clean."
        )
    elif any(term in q for term in ("colour", "color", "palette", "match")):
        advice = (
            "Start with one neutral base such as navy, grey, beige, black, or white, then add one accent colour. "
            "Using two neutrals and one accent is an easy way to keep an outfit coordinated."
        )
    elif any(term in q for term in ("trend", "latest", "search the web", "what's in")):
        advice = (
            "I can't retrieve live trend results while the AI service is unavailable. For a dependable starting point, "
            "look for relaxed tailoring, versatile neutral basics, and one accent piece that suits your personal style."
        )
    elif any(term in q for term in ("wardrobe", "closet", "what should i wear")):
        advice = (
            "Choose one item you want to wear first, then build around it: a neutral top, a compatible pair of trousers, "
            "and shoes suitable for the occasion. I can't inspect your saved wardrobe while the AI service is unavailable."
        )
    else:
        advice = (
            "A reliable outfit formula is one statement piece, two complementary basics, and shoes suited to the occasion. "
            "Prioritize fit, breathable fabrics, and a palette of two or three colours. Tell me the occasion and weather "
            "for a more specific suggestion when the live AI service is available."
        )

    return (
        "The live AI model is temporarily unavailable because of an API quota or provider compatibility limit. "
        "Here is a general styling suggestion instead:\n\n" + advice
    )

'''
marker = "@traceable("
if marker not in source:
    print("ERROR: Could not locate agent_node decorator in agent.py.")
    sys.exit(1)
source = source.replace(marker, helper + marker, 1)

# Wrap the LLM call, while preserving any existing parameters from other patches.
start_token = "    client = instructor.from_litellm(completion)\n"
end_token = "    ai_message = format_ai_message(response)\n"
start = source.find(start_token)
end = source.find(end_token, start)
if start < 0 or end < 0:
    print("ERROR: Could not locate model-call block. No file changed; send the current agent.py for a tailored patch.")
    sys.exit(1)
block = source[start:end]
wrapped = "    try:\n" + "".join("    " + line if line.strip() else line for line in block.splitlines(keepends=True))
wrapped += '''    except Exception as exc:
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

'''
source = source[:start] + wrapped + source[end:]

shutil.copy2(TARGET, backup)
TARGET.write_text(source, encoding="utf-8", newline="\n")
print(f"Applied local fallback to {TARGET}")
print(f"Backup: {backup}")
print("On LLM quota/provider failure, chat returns a clearly labelled general suggestion instead of HTTP 500.")
