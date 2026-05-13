from pathlib import Path
import re

FILES_TO_CHECK = [
    Path("lightbulb_index.html"),
    Path("home_logged_in.html"),
    Path("index.html"),
]

DYNAMIC_PREFIXES = [
    "e-name-",
    "e-start-",
    "e-end-",
    "e-amt-",
    "e-yrs-",
    "e-fof-",
    "e-note-",
]

for path in FILES_TO_CHECK:
    if not path.exists():
        continue

    text = path.read_text()

    html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', text))
    js_ids = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', text)

    missing = []

    for id_value in sorted(set(js_ids)):
        if any(id_value.startswith(prefix) for prefix in DYNAMIC_PREFIXES):
            continue

        if id_value not in html_ids:
            missing.append(id_value)

    print(f"\n=== {path} ===")
    print(f"Static HTML ids found: {len(html_ids)}")
    print(f"Unique getElementById references found: {len(set(js_ids))}")

    if missing:
        print("Potential missing HTML ids:")
        for item in missing:
            print(f"- {item}")
    else:
        print("No missing static ids found.")
