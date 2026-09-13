"""Central configuration for the Volatility Web backend."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MEMORY_DIR = BASE_DIR / "memory"
OUTPUT_DIR = BASE_DIR / "output"
VOLATILITY_DIR = BASE_DIR / "volatility3"
VOL_PY = VOLATILITY_DIR / "vol.py"

MEMORY_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

MAX_UPLOAD_BYTES = 8 * 1024 * 1024 * 1024
ALLOWED_EXTENSIONS = {".raw", ".mem", ".dmp", ".vmem", ".img", ".dd"}
CHUNK_SIZE = 1024 * 1024

DEFAULT_TIMEOUT_SECONDS = 600