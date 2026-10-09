from pathlib import Path
import shutil
from datetime import datetime

TARGET = Path('ai-agent/src/backend/app/services/agent.py')
if not TARGET.exists():
    raise SystemExit(f'Could not find {TARGET}. Run this script from the style-silhouette repository root.')

source = TARGET.read_text(encoding='utf-8')
marker = 'def agent_node(state: State) -> dict:\n'
if marker not in source:
    raise SystemExit('Could not find agent_node() in services/agent.py; no files changed.')

fix_marker = '    # BaseSettings reads .env but does not export its values to os.environ; LiteLLM reads OPENAI_API_KEY from the process environment.\n    os.environ["OPENAI_API_KEY"] = settings.openai_api_key\n'
if fix_marker in source:
    print('Fix already appears to be installed; no changes made.')
    raise SystemExit(0)

if 'import os\n' not in source:
    # Insert standard-library import alongside the existing imports.
    source = source.replace('from langsmith import traceable, get_current_run_tree\n', 'import os\nfrom langsmith import traceable, get_current_run_tree\n', 1)

source = source.replace(marker, marker + fix_marker + '\n', 1)
backup = TARGET.with_name(TARGET.name + '.before-openai-env-fix.bak')
if backup.exists():
    backup = TARGET.with_name(TARGET.name + f'.before-openai-env-fix-{datetime.now():%Y%m%d-%H%M%S}.bak')
shutil.copy2(TARGET, backup)
TARGET.write_text(source, encoding='utf-8', newline='\n')
print(f'OpenAI environment fix installed in {TARGET}')
print(f'Backup created: {backup}')
