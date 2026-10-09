from pathlib import Path
import re
import shutil
import sys

ROOT = Path.cwd()
EXPECTED = [
    ROOT / "frontend/src/pages/AIAgent.jsx",
    ROOT / "ai-agent/src/backend/app/main.py",
    ROOT / "ai-agent/src/backend/app/services/agent.py",
]
missing = [str(p.relative_to(ROOT)) for p in EXPECTED if not p.is_file()]
if missing:
    print("ERROR: Run this script from the style-silhouette repository root.")
    print("Missing file(s): " + ", ".join(missing))
    sys.exit(1)


def backup(path: Path) -> None:
    base = path.with_name(path.name + ".before-agent-chat-fix-v2.bak")
    target = base
    index = 2
    while target.exists():
        target = path.with_name(path.name + f".before-agent-chat-fix-v2-{index}.bak")
        index += 1
    shutil.copy2(path, target)
    print(f"Backup: {target.relative_to(ROOT)}")


def write_if_changed(path: Path, original: str, updated: str) -> None:
    if original == updated:
        print(f"Already fixed: {path.relative_to(ROOT)}")
        return
    backup(path)
    path.write_text(updated, encoding="utf-8", newline="")
    print(f"Updated: {path.relative_to(ROOT)}")

# 1) Frontend request contract: FastAPI expects `query` and `images: list[str]`,
# not `message` and list-of-objects. The response uses `answer`.
path = EXPECTED[0]
text = path.read_text(encoding="utf-8")
original = text
payload_pattern = re.compile(
    r"const payload\s*=\s*\{\s*"
    r"message:\s*content,\s*"
    r"session_id:\s*sessionId,\s*"
    r"images:\s*images\.map\(dataUrl\s*=>\s*\(\{\s*path:\s*dataUrl\s*\}\)\),?\s*"
    r"\}",
    re.S,
)
payload_replacement = """const payload = {
                query: content || (images.length ? 'Please analyze the attached image(s) and provide fashion advice.' : ''),
                session_id: sessionId,
                images,
            }"""
text, count = payload_pattern.subn(payload_replacement, text, count=1)
if count == 0 and not re.search(r"const payload\s*=\s*\{\s*query:\s*content", text):
    raise SystemExit("Could not locate AIAgent.jsx chat payload. No files were modified after this point; check your local file version.")
text = text.replace(
    "content: data?.response || data?.message || 'Done!',",
    "content: data?.answer || data?.response || data?.message || 'Done!',",
)
# Preserve detailed FastAPI validation / HTTP errors where returned.
text = text.replace(
    "content: err.response?.status === 503\n                    ? '⚠️ The AI Agent service is not running. Start the Python agent on port 8000 and try again.'\n                    : `❌ Error: ${err.response?.data?.message || err.message}`,",
    "content: err.response?.status === 503\n                    ? '⚠️ The AI Agent service is not running. Start the Python agent on port 8000 and try again.'\n                    : `❌ Error: ${err.response?.data?.detail || err.response?.data?.message || err.message}`,",
)
write_if_changed(path, original, text)

# 2) Add plural session endpoints expected by the React client.
path = EXPECTED[1]
text = path.read_text(encoding="utf-8")
original = text
if '@app.get("/sessions")' not in text:
    marker = '@app.post("/vton")'
    if marker not in text:
        raise SystemExit("Could not locate insertion point in main.py for session routes.")
    addition = '''@app.get("/sessions")
async def list_sessions():
    """List in-memory chat sessions for the AI Agent UI."""
    manager = deps.session_manager
    if manager is None:
        raise HTTPException(status_code=503, detail="AI Agent is still starting up.")

    result = []
    for session_id, session in manager._sessions.items():
        first_user_message = next(
            (message.content for message in session.message_history if message.role == "user"),
            "New conversation",
        )
        title = " ".join((first_user_message or "New conversation").split())
        result.append({"id": session_id, "session_id": session_id, "title": title[:64]})
    return result


@app.get("/sessions/{session_id}")
async def get_session_plural(session_id: str):
    """Return message history using the plural URL used by the frontend."""
    manager = deps.session_manager
    if manager is None:
        raise HTTPException(status_code=503, detail="AI Agent is still starting up.")
    session_data = manager.get_session_data(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_data


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete an in-memory chat session."""
    manager = deps.session_manager
    if manager is None:
        raise HTTPException(status_code=503, detail="AI Agent is still starting up.")
    if session_id not in manager._sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    manager.cleanup_session(session_id)
    return {"success": True, "session_id": session_id}


'''
    text = text.replace(marker, addition + marker, 1)
write_if_changed(path, original, text)

# 3) Remove a developer-specific absolute path that throws FileNotFoundError on Windows.
path = EXPECTED[2]
text = path.read_text(encoding="utf-8")
original = text
old_block = '''    # prompt_template = deps.prompt_manager.get_prompt("agent")
    # FOR DEBUGGING ONLY
    import yaml
    agent_prompt_path = "/home/farrosalferro/projects/fashion_recommender/prompts/agent.yaml"
    with open(agent_prompt_path, "r") as file:
        prompt_template = yaml.safe_load(file)["prompt"]
'''
new_block = '''    # Use the project-local prompt manager instead of a developer-specific path.
    prompt_template = deps.prompt_manager.get_prompt("agent") if deps.prompt_manager else ""
    if not prompt_template or prompt_template == "Generate virtual try-on for agent":
        prompt_template = """You are a helpful AI fashion assistant.
Use the available tools when they are needed to answer the user's request.
Available tools: {{ available_tools | tojson }}
Return an answer, set final_answer to true when complete, and use tool_calls only for tools listed above.
"""
'''
if old_block in text:
    text = text.replace(old_block, new_block, 1)
elif "agent_prompt_path = \"/home/farrosalferro/projects/fashion_recommender/prompts/agent.yaml\"" in text:
    # Fallback replacement tolerating whitespace/line-ending differences.
    pattern = re.compile(
        r"\s*# prompt_template = deps\.prompt_manager\.get_prompt\(\"agent\"\)\s*"
        r"# FOR DEBUGGING ONLY\s*import yaml\s*"
        r"agent_prompt_path = \"/home/farrosalferro/projects/fashion_recommender/prompts/agent\.yaml\"\s*"
        r"with open\(agent_prompt_path, \"r\"\) as file:\s*"
        r"prompt_template = yaml\.safe_load\(file\)\[\"prompt\"\]\s*",
        re.S,
    )
    text, count = pattern.subn("\n" + new_block, text, count=1)
    if count == 0:
        raise SystemExit("Could not replace developer-specific prompt path in agent.py.")
elif "prompt_manager.get_prompt(\"agent\")" not in text:
    raise SystemExit("agent.py has an unfamiliar prompt loader; refusing to overwrite it.")
write_if_changed(path, original, text)

print("\nPatch applied. Review the Python agent terminal if chat still returns an error.")
print("Ensure ai-agent/.env contains a valid OPENAI_API_KEY (or the provider key configured for LLM_MODEL). Do not share keys in chat.")
