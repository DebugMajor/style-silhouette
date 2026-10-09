from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
SIDEBAR = ROOT / "frontend" / "src" / "components" / "Sidebar.jsx"
TRYON = ROOT / "frontend" / "src" / "pages" / "VirtualTryOn.jsx"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def backup(path: Path) -> None:
    backup_path = path.with_suffix(path.suffix + ".before-remove-3d-studio.bak")
    if not backup_path.exists():
        shutil.copy2(path, backup_path)
        print(f"Backup: {backup_path.relative_to(ROOT)}")


def read_required(path: Path) -> str:
    if not path.is_file():
        fail(f"Could not find {path.relative_to(ROOT)}. Run this script from your style-silhouette project root.")
    return path.read_text(encoding="utf-8")


# ---- Sidebar: remove the duplicate 3D Studio nav item ----
sidebar = read_required(SIDEBAR)
sidebar_changed = sidebar
sidebar_changed = sidebar_changed.replace("    Box,\n", "")
sidebar_item = "                { icon: Box, label: '3D Studio', to: '/dashboard/virtual-try-on?mode=3d' },\n"
sidebar_changed = sidebar_changed.replace(sidebar_item, "")
if sidebar_changed == sidebar and "3D Studio" in sidebar:
    fail("Found a 3D Studio item, but its structure differs from the expected version. No files have been changed yet.")

# ---- VirtualTryOn: remove the 3D tab/view, preserve photo try-on ----
tryon = read_required(TRYON)
tryon_changed = tryon

simple_replacements = [
    ("import { useNavigate } from 'react-router-dom'\n", ""),
    ("import Avatar3D from '../components/Avatar3D'\n", ""),
    ("    Layers,\n", ""),
    ("    const navigate = useNavigate()\n", ""),
    ("    const [mode, setMode] = useState('IDM-VTON')\n", ""),
    ("    const [threeView, setThreeView] = useState('Front')\n", ""),
]
for old, new in simple_replacements:
    tryon_changed = tryon_changed.replace(old, new)

mode_buttons = """                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className={`btn btn-sm ${mode === 'IDM-VTON' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('IDM-VTON')}
                        >
                            <Sparkles size={15} />
                            AI Photo Try-On
                        </button>
                        <button
                            className={`btn btn-sm ${mode === '3D' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('3D')}
                        >
                            <Layers size={15} />
                            3D Try-On
                        </button>
                    </div>
"""
if mode_buttons not in tryon_changed and "3D Try-On" in tryon_changed:
    fail("Found the 3D Try-On toggle, but its structure differs from the expected version. No files have been changed yet.")
tryon_changed = tryon_changed.replace(mode_buttons, "")

conditional_start = "            {mode === 'IDM-VTON' ? (\n"
if conditional_start in tryon_changed:
    tryon_changed = tryon_changed.replace(conditional_start, "", 1)
    # The remaining JSX fragment already wraps the photo try-on. Remove only its 3D alternate branch.
    branch_start_token = "                </>\n            ) : (\n                <section className=\"card\" style={{ padding: 0, overflow: 'hidden' }}>"
    start_index = tryon_changed.find(branch_start_token)
    camera_token = "            {cameraOpen && ("
    end_index = tryon_changed.find(camera_token, start_index + 1) if start_index != -1 else -1
    if start_index == -1 or end_index == -1:
        fail("Could not safely locate the 3D alternate view in VirtualTryOn.jsx. No files have been changed yet.")
    # Keep the closing fragment for the retained photo try-on branch; discard the full 3D view and ternary close.
    tryon_changed = tryon_changed[:start_index] + "                </>\n\n" + tryon_changed[end_index:]
else:
    if "3D Try-On" in tryon_changed or "<Avatar3D" in tryon_changed:
        fail("VirtualTryOn.jsx contains a 3D view but its conditional structure is unexpected. No files have been changed yet.")

# Remove an unnecessary fragment wrapper only if the source version was already partly edited?
# Keep fragment: it validly wraps the photo try-on content and camera modal is rendered after it.

if "3D Try-On" in tryon_changed or "<Avatar3D" in tryon_changed or "setMode('3D')" in tryon_changed:
    fail("The 3D try-on view could not be fully removed. No files have been changed yet.")
if "Box," in sidebar_changed or "3D Studio" in sidebar_changed:
    fail("The sidebar 3D Studio entry could not be fully removed. No files have been changed yet.")

# All checks passed. Back up and write only changed files.
if sidebar_changed != sidebar:
    backup(SIDEBAR)
    SIDEBAR.write_text(sidebar_changed, encoding="utf-8", newline="\n")
    print("Updated frontend/src/components/Sidebar.jsx")
else:
    print("Sidebar already has no 3D Studio entry.")

if tryon_changed != tryon:
    backup(TRYON)
    TRYON.write_text(tryon_changed, encoding="utf-8", newline="\n")
    print("Updated frontend/src/pages/VirtualTryOn.jsx")
else:
    print("VirtualTryOn.jsx already has no 3D Try-On view.")

print("\nDone. The duplicate 3D Studio/3D Try-On UI has been removed.")
print("The existing AI Photo Try-On, camera/upload, result adjustment, downloads, saves, and history are preserved.")
