"""Safe subprocess execution of Volatility 3."""
import subprocess
import sys
from pathlib import Path

from config import DEFAULT_TIMEOUT_SECONDS, VOL_PY
from volatility.plugins import get_plugin


class VolatilityError(RuntimeError):
    """Raised when Volatility fails to run or returns a non-zero exit code."""


def build_command(image_path: Path, plugin_id: str) -> list[str]:
    cfg = get_plugin(plugin_id)
    # Argument list -> never a shell string, never shell=True.
    return [
        sys.executable,
        str(VOL_PY),
        "-f", str(image_path),
        "-r", "json",
        cfg["plugin"],
    ]


def run_plugin(image_path: Path, plugin_id: str, timeout: int | None = None) -> dict:
    if not VOL_PY.is_file():
        raise VolatilityError(
            f"Volatility 3 not found at {VOL_PY}. "
            "Clone it into the volatility3/ directory."
        )

    cmd = build_command(image_path, plugin_id)
    timeout = timeout or DEFAULT_TIMEOUT_SECONDS

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=False,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise VolatilityError(
            f"Volatility timed out after {timeout} seconds."
        ) from exc
    except FileNotFoundError as exc:
        raise VolatilityError("Python interpreter not found.") from exc
    except OSError as exc:
        raise VolatilityError(f"Failed to launch Volatility: {exc}") from exc

    if proc.returncode != 0:
        stderr = (proc.stderr or "").strip().splitlines()
        tail = "\n".join(stderr[-8:]) if stderr else "Unknown error."
        raise VolatilityError(
            "Volatility could not process this memory image.\n"
            f"Details: {tail}"
        )

    return {
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "command": " ".join(cmd),
    }