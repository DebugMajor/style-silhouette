#!/usr/bin/env python3
"""Improve intent matching in the Style Silhouette local AI-agent fallback."""
from pathlib import Path
import re
import shutil
import sys

TARGET = Path("ai-agent/src/backend/app/services/agent.py")
if not TARGET.exists():
    print(f"ERROR: {TARGET} not found. Run this script from the style-silhouette project root.")
    sys.exit(1)

source = TARGET.read_text(encoding="utf-8")
if "def _offline_style_fallback(state: State) -> str:" not in source:
    print("ERROR: Offline fallback is not installed yet. Apply the earlier agent-offline-fallback patch first.")
    sys.exit(1)

helper = r'''def _offline_style_fallback(state: State) -> str:
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
'''

pattern = re.compile(r"def _offline_style_fallback\(state: State\) -> str:\n.*?(?=\n@traceable\()", re.S)
match = pattern.search(source)
if not match:
    print("ERROR: Could not locate the fallback function boundary. No file changed.")
    sys.exit(1)

backup = TARGET.with_name(TARGET.name + ".before-fallback-tailoring.bak")
if backup.exists():
    backup = TARGET.with_name(TARGET.name + ".before-fallback-tailoring-2.bak")
updated = source[:match.start()] + helper.rstrip() + source[match.end():]
shutil.copy2(TARGET, backup)
TARGET.write_text(updated, encoding="utf-8", newline="\n")
print(f"Updated question-specific fallback in {TARGET}")
print(f"Backup: {backup}")
print("No API keys were read or printed.")
