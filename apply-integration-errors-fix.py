#!/usr/bin/env python3
"""Safely patch Style Silhouette integration errors. Run from repository root."""

from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
BACKUP_SUFFIX = ".before-integration-errors-fix.bak"


def plan_transform(rel_path, edits):
    path = ROOT / rel_path
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {rel_path}")

    original = path.read_text(encoding="utf-8-sig")
    updated = original
    changed_descriptions = []

    for description, old, new, already_marker in edits:
        if old in updated:
            updated = updated.replace(old, new, 1)
            changed_descriptions.append(description)
        elif already_marker and already_marker in updated:
            print(f"  Already applied: {description}")
        else:
            raise RuntimeError(
                f"Could not safely patch {rel_path}: expected section not found ({description})."
            )

    return path, original, updated, changed_descriptions


AUTH_REHYDRATE_OLD = """            if (stored) {
                const parsed = JSON.parse(stored)
                setUser(parsed)
                axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
            }
        } catch {
            localStorage.removeItem('sas_user')
        }
"""
AUTH_REHYDRATE_NEW = """            if (stored) {
                const parsed = JSON.parse(stored)
                const token = typeof parsed?.token === 'string' ? parsed.token.trim() : ''

                if (token && token !== 'undefined' && token !== 'null') {
                    setUser(parsed)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                } else {
                    // Remove stale/malformed sessions instead of sending "Bearer undefined".
                    localStorage.removeItem('sas_user')
                    delete axios.defaults.headers.common['Authorization']
                    setUser(null)
                }
            } else {
                delete axios.defaults.headers.common['Authorization']
            }
        } catch {
            localStorage.removeItem('sas_user')
            delete axios.defaults.headers.common['Authorization']
            setUser(null)
        }
"""

AUTH_PERSIST_OLD = """    const persist = (data) => {
        localStorage.setItem('sas_user', JSON.stringify(data))
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data)
    }
"""
AUTH_PERSIST_NEW = """    const persist = (data) => {
        const token = typeof data?.token === 'string' ? data.token.trim() : ''
        if (!token || token === 'undefined' || token === 'null') {
            throw new Error('The server did not return a valid session token. Please sign in again.')
        }

        const session = { ...data, token }
        localStorage.setItem('sas_user', JSON.stringify(session))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(session)
    }
"""

AI_TREND_AUTH_OLD = """            if (parsed.token) {
                return { Authorization: `Bearer ${parsed.token}` }
            }
"""
AI_TREND_AUTH_NEW = """            const token = typeof parsed?.token === 'string' ? parsed.token.trim() : ''
            if (token && token !== 'undefined' && token !== 'null') {
                return { Authorization: `Bearer ${token}` }
            }
"""
AI_TREND_MULTIPART_OLD = """                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
                }
"""
AI_TREND_MULTIPART_NEW = """                // Let Axios set the multipart boundary automatically.
                headers: {
                    ...getAuthHeaders()
                }
"""

TRIPO_HELPER = r"""
function getTripoErrorMessage(response, json, operation) {
    const code = Number(json?.code)
    if (response.status === 401 || code === 1002) {
        return `${operation}: Tripo rejected TRIPO_API_KEY (HTTP ${response.status}, code 1002). `
            + 'Create a fresh API key in the Tripo Console (use the API key, not the Client ID), '
            + 'put its value in backend/.env as TRIPO_API_KEY=... without a "Bearer " prefix, '
            + 'then restart the backend. Revoke any key previously shared or exposed.'
    }

    const message = json?.message || json?.msg
    const suggestion = json?.suggestion ? ` Suggestion: ${json.suggestion}` : ''
    if (message) return `${operation}: ${message}.${suggestion}`
    return `${operation}: Tripo request failed with HTTP ${response.status}.${suggestion}`
}

"""

TRIPO_LOG_OLD = """        const keyPrefix = process.env.TRIPO_API_KEY ? process.env.TRIPO_API_KEY.trim().substring(0, 4) + '...' : 'MISSING'
        console.log(`[TRIPO DIAGNOSTIC] Key Present: ${hasKey}, Prefix: ${keyPrefix}`)
"""
TRIPO_LOG_NEW = """        console.log(`[TRIPO DIAGNOSTIC] Key Present: ${hasKey}`)
"""

TRIPO_TEST_OLD = """            message: json.message || json.msg || 'Tripo authentication failed'
"""
TRIPO_TEST_NEW = """            message: getTripoErrorMessage(response, json, 'Tripo authentication check failed')
"""

TRIPO_UPLOAD_OLD = """        throw new Error(json.message || json.msg || `Tripo image upload failed with status ${response.status}`)
"""
TRIPO_UPLOAD_NEW = """        throw new Error(getTripoErrorMessage(response, json, 'Tripo image upload failed'))
"""

TRIPO_TASK_OLD = """        throw new Error(json.message || json.msg || `Tripo task creation failed with status ${response.status}`)
"""
TRIPO_TASK_NEW = """        throw new Error(getTripoErrorMessage(response, json, 'Tripo task creation failed'))
"""

TRIPO_STATUS_OLD = """        throw new Error(json.message || `Tripo status check failed with HTTP ${response.status}`)
"""
TRIPO_STATUS_NEW = """        throw new Error(getTripoErrorMessage(response, json, 'Tripo status check failed'))
"""

TTS_MODEL_OLD = """            model_id: 'eleven_monolingual_v1',
"""
TTS_MODEL_NEW = """            model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5',
"""

ENV_TTS_OLD = """ELEVENLABS_VOICE_ID=
AI_VISION_API_KEY=
"""
ENV_TTS_NEW = """ELEVENLABS_VOICE_ID=
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
AI_VISION_API_KEY=
"""


def main():
    if not (ROOT / "backend").is_dir() or not (ROOT / "frontend").is_dir():
        print("ERROR: Run this script from the style-silhouette repository root.", file=sys.stderr)
        print("Expected to see both backend/ and frontend/ folders here.", file=sys.stderr)
        return 2

    edits_by_file = [
        (
            "frontend/src/context/AuthContext.jsx",
            [
                ("guard stored session token", AUTH_REHYDRATE_OLD, AUTH_REHYDRATE_NEW,
                 "// Remove stale/malformed sessions instead of sending"),
                ("validate token received on login/register", AUTH_PERSIST_OLD, AUTH_PERSIST_NEW,
                 "The server did not return a valid session token."),
            ],
        ),
        (
            "frontend/src/pages/AITrend.jsx",
            [
                ("guard page-specific token header", AI_TREND_AUTH_OLD, AI_TREND_AUTH_NEW,
                 "const token = typeof parsed?.token === 'string'"),
                ("allow Axios to set multipart boundary", AI_TREND_MULTIPART_OLD, AI_TREND_MULTIPART_NEW,
                 "Let Axios set the multipart boundary automatically."),
            ],
        ),
        (
            "backend/services/textToSpeechService.js",
            [
                ("switch to supported ElevenLabs TTS model", TTS_MODEL_OLD, TTS_MODEL_NEW,
                 "process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5'"),
            ],
        ),
        (
            "backend/services/tripoService.js",
            [
                ("add actionable Tripo authentication error",
                 "/**\n * Diagnostic endpoint calling GET /user/balance to verify Tripo API key\n */\n",
                 TRIPO_HELPER + "/**\n * Diagnostic endpoint calling GET /user/balance to verify Tripo API key\n */\n",
                 "function getTripoErrorMessage("),
                ("improve Tripo auth diagnostic", TRIPO_TEST_OLD, TRIPO_TEST_NEW,
                 "getTripoErrorMessage(response, json, 'Tripo authentication check failed')"),
                ("improve Tripo upload auth error", TRIPO_UPLOAD_OLD, TRIPO_UPLOAD_NEW,
                 "getTripoErrorMessage(response, json, 'Tripo image upload failed')"),
                ("improve Tripo task auth error", TRIPO_TASK_OLD, TRIPO_TASK_NEW,
                 "getTripoErrorMessage(response, json, 'Tripo task creation failed')"),
                ("improve Tripo status auth error", TRIPO_STATUS_OLD, TRIPO_STATUS_NEW,
                 "getTripoErrorMessage(response, json, 'Tripo status check failed')"),
            ],
        ),
        (
            "backend/controllers/aiTrendController.js",
            [
                ("avoid logging any part of the Tripo key", TRIPO_LOG_OLD, TRIPO_LOG_NEW,
                 "console.log(`[TRIPO DIAGNOSTIC] Key Present: ${hasKey}`)"),
            ],
        ),
        (
            "backend/.env.example",
            [
                ("document supported ElevenLabs model setting", ENV_TTS_OLD, ENV_TTS_NEW,
                 "ELEVENLABS_MODEL_ID=eleven_flash_v2_5"),
            ],
        ),
    ]

    plans = []
    try:
        for rel_path, edits in edits_by_file:
            plans.append(plan_transform(rel_path, edits))
    except Exception as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        print("No project files have been changed by this run.", file=sys.stderr)
        return 1

    for path, original, updated, descriptions in plans:
        if updated == original:
            print(f"  No change needed: {path.relative_to(ROOT)}")
            continue
        backup = path.with_name(path.name + BACKUP_SUFFIX)
        if not backup.exists():
            shutil.copy2(path, backup)
            print(f"  Backup: {backup.relative_to(ROOT)}")
        path.write_text(updated, encoding="utf-8", newline="\n")
        print(f"  Patched: {path.relative_to(ROOT)} ({', '.join(descriptions)})")

    print("\nPatch applied.")
    print("IMPORTANT: Tripo HTTP 401 / code 1002 still requires a valid TRIPO_API_KEY in backend/.env.")
    print("Do not paste API keys into chat or commit them.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
