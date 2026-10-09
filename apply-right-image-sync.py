from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path.cwd()
voice_path = ROOT / "frontend" / "src" / "pages" / "Voice.jsx"
character_path = ROOT / "frontend" / "src" / "components" / "AIStyleCharacter.jsx"

for path in (voice_path, character_path):
    if not path.is_file():
        print(f"ERROR: Could not find {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}")
        print("Run this script from your style-silhouette repository root.")
        sys.exit(1)

voice = voice_path.read_text(encoding="utf-8")
character = character_path.read_text(encoding="utf-8")

old_voice = '''                    <AIStyleCharacter
                        ref={characterRef}
                        state={characterState}
                        activeText={characterText}
                    />'''
new_voice = '''                    <AIStyleCharacter
                        ref={characterRef}
                        state={characterState}
                        activeText={characterText}
                        imageSrc={capturedImage}
                    />'''

old_signature = "const AIStyleCharacter = forwardRef(({ state = 'IDLE', activeText = '', onSpeechEnd }, ref) => {"
new_signature = "const AIStyleCharacter = forwardRef(({ state = 'IDLE', activeText = '', onSpeechEnd, imageSrc = null }, ref) => {"
old_img = '''                <img
                    src="/assets/ai-stylist.png"
                    alt="AI Fashion Stylist"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover','''
new_img = '''                <img
                    src={imageSrc || "/assets/ai-stylist.png"}
                    alt={imageSrc ? "Your captured outfit" : "AI Fashion Stylist"}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: imageSrc ? 'contain' : 'cover',
                        background: imageSrc ? 'rgba(0, 0, 0, 0.35)' : 'transparent','''

changes = [
    (voice_path, voice, [(old_voice, new_voice)]),
    (character_path, character, [(old_signature, new_signature), (old_img, new_img)]),
]
for path, content, replacements in changes:
    updated = content
    for old, new in replacements:
        if old not in updated:
            # Idempotency: accept files where this exact change is already present.
            if new in updated:
                continue
            print(f"ERROR: Expected code section was not found in {path.relative_to(ROOT)}. No files were changed.")
            sys.exit(2)
        updated = updated.replace(old, new, 1)
    if updated == content:
        print(f"Already patched: {path.relative_to(ROOT)}")
        continue
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = path.with_name(path.name + f".before-right-image-sync-{stamp}.bak")
    shutil.copy2(path, backup)
    path.write_text(updated, encoding="utf-8", newline="\n")
    print(f"Updated: {path.relative_to(ROOT)}")
    print(f"Backup:  {backup.relative_to(ROOT)}")

print("\nDone. After saving, restart/reload the frontend. Captured or uploaded images will also appear in the right panel.")
