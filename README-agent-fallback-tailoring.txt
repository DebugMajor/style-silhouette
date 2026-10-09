Style Silhouette — Question-Specific Agent Fallback

This patch changes only the local fallback in:
  ai-agent/src/backend/app/services/agent.py

It fixes intent-check ordering so a question about colours for a business-casual look receives colour advice rather than the generic summer outfit answer. It also adds more targeted fallback responses for shoe, trend, wardrobe, formalwear, and virtual try-on questions.

Apply from the repository root in Git Bash:
  python apply-agent-fallback-tailoring-fix.py

Then restart the Python agent in PowerShell:
  cd "E:\VS Learn\Project\MERN\style-silhouette\ai-agent"
  uv run uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000 --reload

This is offline rule-based guidance when Gemini/OpenAI is unavailable; it does not execute agent tools or call the model. The script backs up agent.py and never prints API keys.
