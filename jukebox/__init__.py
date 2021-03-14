__version__ = "0.1dev"

from pathlib import Path

import json5

APP_ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = APP_ROOT / "jukebox.json5"
try:
    CONFIGS = json5.loads(CONFIG_FILE.read_text())
except FileNotFoundError:
    CONFIGS = {}
