Style Silhouette — Sync captured/uploaded photo to right-side stylist panel

Apply from your repository root (the style-silhouette folder):

  python apply-right-image-sync.py

The script updates:
  frontend/src/pages/Voice.jsx
  frontend/src/components/AIStyleCharacter.jsx

It creates timestamped .bak backups before changing either file.
Once a photo is captured or uploaded, the right panel shows that same photo instead of the default AI stylist portrait. Before a photo is selected, the default portrait remains. The image is shown with contain-fit so the photo is not unnecessarily cropped.

Restart/reload the frontend after applying. This patch does not change the analysis API or backend.
