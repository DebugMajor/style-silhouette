#!/usr/bin/env python3
"""Patch Style Silhouette's frontend/backend AI Agent API contract."""
from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
FILES = [
    "frontend/src/pages/AIAgent.jsx",
    "ai-agent/src/backend/app/main.py",
    "ai-agent/src/backend/app/services/session.py",
    "ai-agent/src/backend/app/services/agent.py",
    "backend/app.js",
]
missing = [f for f in FILES if not (ROOT / f).is_file()]
if missing:
    print("ERROR: Run this script from the style-silhouette repository root.")
    print("Missing files:", ", ".join(sorted(missing)))
    sys.exit(1)

changes = {}

# Frontend: match the Pydantic ChatRequest/ChatResponse contract (query, images, answer).
f = "frontend/src/pages/AIAgent.jsx"
t = (ROOT / f).read_text(encoding="utf-8")
replacements = [
    ("""            const payload = {
                message: content,
                session_id: sessionId,
                images: images.map(dataUrl => ({ path: dataUrl })),
            }
""", """            const payload = {
                query: content,
                session_id: sessionId,
                // The FastAPI ChatRequest expects image data URLs as strings.
                images,
            }
""", "chat request payload"),
    ("""                content: data?.response || data?.message || 'Done!',
""", """                content: data?.answer || data?.response || data?.message || 'Done!',
""", "chat response parsing"),
    ("""                content: err.response?.status === 503
                    ? '⚠️ The AI Agent service is not running. Start the Python agent on port 8000 and try again.'
                    : `❌ Error: ${err.response?.data?.message || err.message}`,
""", """                content: err.response?.status === 503
                    ? '⚠️ The AI Agent service is not running. Start the Python agent on port 8000 and try again.'
                    : `❌ Error: ${formatAgentError(err)}`,
""", "readable API errors"),
]
for old, new, label in replacements:
    if new in t:
        continue
    if old not in t:
        raise RuntimeError(f"Could not find expected code for {label} in {f}; no files were changed.")
    t = t.replace(old, new, 1)
if "function formatAgentError(err)" not in t:
    marker = "const API = '/api/agent'\n"
    if marker not in t:
        raise RuntimeError(f"Could not find API marker in {f}; no files were changed.")
    helper = '''

function formatAgentError(err) {
    const body = err.response?.data
    const detail = body?.detail
    if (Array.isArray(detail)) {
        return detail.map(item => {
            const field = Array.isArray(item.loc) ? item.loc.filter(part => part !== 'body').join('.') : ''
            return field ? `${field}: ${item.msg || 'Invalid value'}` : (item.msg || 'Invalid request')
        }).join('; ')
    }
    if (typeof detail === 'string') return detail
    return body?.message || body?.error || err.message || 'Request failed.'
}
'''
    t = t.replace(marker, marker + helper, 1)
changes[f] = t

# Session manager: expose summaries for the frontend's Sessions control.
f = "ai-agent/src/backend/app/services/session.py"
t = (ROOT / f).read_text(encoding="utf-8")
if "    def list_sessions(self)" not in t:
    marker = "    def cleanup_session(self, session_id: str):\n"
    method = '''    def list_sessions(self) -> list[dict[str, str]]:
        """Return concise session summaries for the frontend."""
        summaries = []
        for session_id, session in reversed(list(self._sessions.items())):
            first_user_message = next(
                (message.content for message in session.message_history if message.role == "user"),
                "New conversation",
            )
            title = " ".join(first_user_message.split())[:64] or "New conversation"
            summaries.append({"id": session_id, "title": title})
        return summaries

'''
    if marker not in t:
        raise RuntimeError(f"Could not find cleanup_session marker in {f}; no files were changed.")
    t = t.replace(marker, method + marker, 1)
changes[f] = t

# FastAPI endpoints and CORS compatibility.
f = "ai-agent/src/backend/app/main.py"
t = (ROOT / f).read_text(encoding="utf-8")
old_origins = 'allow_origins=["http://localhost:3000"],'
new_origins = 'allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],'
if new_origins not in t:
    if old_origins not in t:
        raise RuntimeError(f"Could not find CORS origin setting in {f}; no files were changed.")
    t = t.replace(old_origins, new_origins, 1)
if '@app.get("/sessions")' not in t:
    t += '''

# Compatibility endpoints used by the React AI Agent page.
@app.get("/sessions")
async def list_sessions():
    return deps.session_manager.list_sessions()


@app.get("/sessions/{session_id}")
async def get_session_plural(session_id: str):
    session_data = deps.session_manager.get_session_data(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_data


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if deps.session_manager.get_session_data(session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")
    deps.session_manager.cleanup_session(session_id)
    return {"success": True, "session_id": session_id}
'''
changes[f] = t

# Agent prompt currently references a developer-specific absolute Linux path.
f = "ai-agent/src/backend/app/services/agent.py"
t = (ROOT / f).read_text(encoding="utf-8")
old = '''    # prompt_template = deps.prompt_manager.get_prompt("agent")
    # FOR DEBUGGING ONLY
    import yaml
    agent_prompt_path = "/home/farrosalferro/projects/fashion_recommender/prompts/agent.yaml"
    with open(agent_prompt_path, "r") as file:
        prompt_template = yaml.safe_load(file)["prompt"]
'''
new = '''    # Load the prompt through the project's prompt manager so this works on Windows and other contributors' machines.
    prompt_template = deps.prompt_manager.get_prompt("agent")
    if not prompt_template:
        raise RuntimeError("Agent prompt is empty. Check ai-agent/prompts/agent.yaml.")
'''
if new not in t:
    if old not in t:
        raise RuntimeError(f"Could not find hard-coded prompt path in {f}; no files were changed.")
    t = t.replace(old, new, 1)
changes[f] = t

# Node backend CORS: allow Vite on localhost and 127.0.0.1 (plus port 3000).
f = "backend/app.js"
t = (ROOT / f).read_text(encoding="utf-8")
old = "    origin: process.env.CLIENT_URL || 'http://localhost:5173',"
new = "    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],"
if new not in t:
    if old not in t:
        raise RuntimeError(f"Could not find CORS origin setting in {f}; no files were changed.")
    t = t.replace(old, new, 1)
changes[f] = t

# Apply only after all replacements succeeded; keep backups alongside originals.
for relative, content in changes.items():
    target = ROOT / relative
    backup = target.with_suffix(target.suffix + ".before-agent-chat-fix.bak")
    if not backup.exists():
        shutil.copy2(target, backup)
    target.write_text(content, encoding="utf-8", newline="\n")

print("AI Agent API compatibility fix applied.")
print("Backups created with suffix .before-agent-chat-fix.bak")
print("Fixed: chat schema (query/images/answer), plural session routes, prompt path, and local CORS origins.")
print("Note: Tripo's insufficient-credit response is a separate external billing limitation; this patch does not bypass it.")
