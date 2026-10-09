from pathlib import Path
from datetime import datetime
import shutil
import sys

root = Path.cwd()
target = root / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'
if not target.exists():
    print('ERROR: Run this script from the style-silhouette project root. File not found:', target)
    sys.exit(1)

text = target.read_text(encoding='utf-8')
old = "from 'react'import axios from 'axios'"
new = "from 'react'\nimport axios from 'axios'"
if old not in text:
    if "from 'react'\nimport axios from 'axios'" in text or "from 'react'\r\nimport axios from 'axios'" in text:
        print('No fix needed: the React and Axios imports are already separated.')
        sys.exit(0)
    print("ERROR: Expected malformed import wasn't found. No files changed.")
    print('Check the import block at the top of frontend/src/pages/VirtualTryOn.jsx.')
    sys.exit(1)

stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
backup = target.with_name(target.name + f'.{stamp}.bak')
shutil.copy2(target, backup)
target.write_text(text.replace(old, new, 1), encoding='utf-8', newline='')
print('Fixed malformed React/Axios imports in:', target)
print('Backup created:', backup)
