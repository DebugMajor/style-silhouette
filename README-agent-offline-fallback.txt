Style Silhouette — AI Agent Offline Fallback

Apply from the repository root (style-silhouette):

  python apply-agent-offline-fallback.py

The script backs up ai-agent/src/backend/app/services/agent.py before changing it.
If Gemini/OpenAI throws a quota or provider error, the chat endpoint returns a visibly labelled general styling suggestion rather than HTTP 500. These fallback suggestions are local/static and do not run retrieval, web search, or virtual try-on tools.

After applying, restart the Python server:

  cd ai-agent
  uv run uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000 --reload

Security: The error log supplied with this issue included a Google API key in the request URL. Revoke/rotate that key in Google AI Studio and update ai-agent/.env. Do not commit .env files.
