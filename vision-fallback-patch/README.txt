Style Silhouette - Vision Provider Quota Fallback

Purpose
- Keeps the current Gemini/OpenAI image-analysis implementation when it succeeds.
- If both providers fail due to quota, credits, rate limits, or another provider error, returns a structured, clearly labelled fallback response so the UI can continue.
- It does NOT pretend the image was visually analyzed while providers are unavailable.

Apply
1. Extract this ZIP to the repository root (the folder containing backend/ and frontend/).
2. Open Git Bash at the repository root.
3. Run: python apply-vision-quota-fallback.py
4. Restart the Node backend with Ctrl+C, then: cd backend && npm start
   (If using PowerShell, use separate commands: cd backend; npm start)
5. Retry image analysis. The result will say analysisMode=local_fallback if providers are unavailable.

The script makes a timestamped backup and stops without changing files if it cannot safely find the expected function.

Quota note
- Gemini's error says this Google project's free-tier daily request quota for gemini-3.8-flash is exhausted until the indicated retry time.
- OpenAI's API account has no credits. Code cannot restore either quota.
- A different API key in the SAME Google Cloud project normally shares that project's quota. Another project/account must be one you own or are authorized to use and must have available quota.
- Rotate any Google API key that was exposed in logs or chat, then store replacements only in backend/.env or ai-agent/.env as appropriate. Do not commit real keys.
