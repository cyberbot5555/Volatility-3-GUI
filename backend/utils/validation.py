"""Validation helpers: filename sanitisation, path safety, size checks."""
import re
from pathlib import Path

from config import ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES, MEMORY_DIR

# Only these characters are allowed in filenames.
SAFE_NAME = re.compile(r"^[A-Za-z0-9._\- ]+$")


def sanitise_filename(name: str) -> str:
    """Reject path separators and any characters outside the safe set."""
    if not name:
        raise ValueError("Filename is empty.")
    name = Path(name).name                                   # strip any directory part
    if not SAFE_NAME.match(name):
        raise ValueError("Filename contains illegal characters.")
    if name.startswith("."):
        raise ValueError("Filename may not start with a dot.")
    return name


def validate_extension(name: str) -> None:
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file extension '{ext}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )


def resolve_image_path(name: str) -> Path:
    """Return an absolute path inside MEMORY_DIR, or raise."""
    safe = sanitise_filename(name)
    target = (MEMORY_DIR / safe).resolve()
    base = MEMORY_DIR.resolve()
    if base not in target.parents and target != base:
        raise ValueError("Path traversal detected.")
    if not target.is_file():
        raise FileNotFoundError(f"Memory image '{safe}' was not found.")
    return target


def check_size(path: Path) -> None:
    if path.stat().st_size > MAX_UPLOAD_BYTES:
        raise ValueError(
            f"File exceeds maximum allowed size "
            f"({MAX_UPLOAD_BYTES // (1024**3)} GB)."
        )