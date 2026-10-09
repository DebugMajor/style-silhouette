from pathlib import Path
import os
import shutil
import tempfile
from datetime import datetime

ROOT = Path.cwd()
agent_dir = ROOT / 'ai-agent'
env_path = agent_dir / '.env'
agent_path = agent_dir / 'src' / 'backend' / 'app' / 'services' / 'agent.py'

if not env_path.is_file() or not agent_path.is_file():
    raise SystemExit(
        'Run this script from your style-silhouette repository root. '
        'Expected ai-agent/.env and ai-agent/src/backend/app/services/agent.py.'
    )

# Keep the real environment file out of the repository while retaining a local backup.
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
env_backup = Path(tempfile.gettempdir()) / f'style-silhouette-ai-agent-env-{stamp}.bak'
shutil.copy2(env_path, env_backup)
shutil.copy2(agent_path, agent_path.with_name(agent_path.name + '.before-gemini-fix.bak'))

# Switch the LLM to Gemini Flash; preserve all other environment settings and secrets.
lines = env_path.read_text(encoding='utf-8-sig').splitlines()
result = []
model_written = False
for line in lines:
    if line.strip().upper().startswith('LLM_MODEL='):
        if not model_written:
            result.append('LLM_MODEL=gemini/gemini-3.8-flash')
            model_written = True
        # Drop duplicate LLM_MODEL entries so the setting is unambiguous.
    else:
        result.append(line)
if not model_written:
    if result and result[-1].strip():
        result.append('')
    result.append('LLM_MODEL=gemini/gemini-3.8-flash')
env_path.write_text('\n'.join(result) + '\n', encoding='utf-8')

source = agent_path.read_text(encoding='utf-8-sig')
if '\nimport os\n' not in '\n' + source:
    # Add os import beside the imports at the top.
    marker = 'from langsmith import traceable, get_current_run_tree\n'
    if marker not in source:
        raise SystemExit('Could not find expected imports in agent.py; .env was updated, but agent.py needs manual review.')
    source = source.replace(marker, marker + 'import os\n', 1)

needle = '    client = instructor.from_litellm(completion)'
insert = '''    # Pydantic reads .env into settings but does not export values to LiteLLM's process env.\n    # Set both supported Gemini key names from the loaded settings without logging the secret.\n    if settings.google_api_key:\n        os.environ["GEMINI_API_KEY"] = settings.google_api_key\n        os.environ["GOOGLE_API_KEY"] = settings.google_api_key\n\n'''
if insert.strip() not in source:
    if needle not in source:
        raise SystemExit('Could not find LiteLLM client creation in agent.py; .env was updated, but agent.py needs manual review.')
    source = source.replace(needle, insert + needle, 1)
agent_path.write_text(source, encoding='utf-8')

print('Gemini agent configuration applied.')
print('LLM_MODEL set to gemini/gemini-3.8-flash in ai-agent/.env')
print('Gemini API key is read from the existing settings.google_api_key value; it was not printed.')
print(f'Environment backup saved outside the repository: {env_backup}')
print(f'Code backup saved at: {agent_path.with_name(agent_path.name + ".before-gemini-fix.bak")}')
print('Next: restart Uvicorn from the ai-agent directory and test the AI Agent chat.')
