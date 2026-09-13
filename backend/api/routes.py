"""FastAPI route definitions."""
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from config import CHUNK_SIZE, MAX_UPLOAD_BYTES, MEMORY_DIR
from utils.validation import (
    check_size,
    resolve_image_path,
    sanitise_filename,
    validate_extension,
)
from volatility.parser import parse_json_output, render_table
from volatility.plugins import list_plugins
from volatility.runner import VolatilityError, run_plugin

router = APIRouter(prefix="/api")


# ---------------- Schemas ----------------

class RunRequest(BaseModel):
    image: str = Field(..., min_length=1, max_length=255)
    plugin: str = Field(..., min_length=1, max_length=64)


# ---------------- Endpoints ----------------

@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "volatility-web"}


@router.get("/plugins")
def plugins() -> dict:
    return {"plugins": list_plugins()}


@router.get("/images")
def list_images() -> dict:
    allowed = {".raw", ".mem", ".dmp", ".vmem", ".img", ".dd"}
    items = [
        {"name": p.name, "size": p.stat().st_size}
        for p in sorted(MEMORY_DIR.iterdir())
        if p.is_file() and p.suffix.lower() in allowed
    ]
    return {"images": items}


@router.post("/images/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...)) -> dict:
    try:
        name = sanitise_filename(file.filename or "")
        validate_extension(name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    dest = MEMORY_DIR / name
    written = 0
    try:
        with dest.open("wb") as fh:
            while chunk := await file.read(CHUNK_SIZE):
                written += len(chunk)
                if written > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="File too large.")
                fh.write(chunk)
    except HTTPException:
        dest.unlink(missing_ok=True)
        raise
    except Exception as exc:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}")

    return {"name": name, "size": written}


@router.delete("/images/{name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(name: str) -> None:
    try:
        path = resolve_image_path(name)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    path.unlink(missing_ok=True)
    return None


@router.post("/volatility/run")
def run(req: RunRequest) -> dict:
    try:
        image_path = resolve_image_path(req.image)
        check_size(image_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        result = run_plugin(image_path, req.plugin)
    except ValueError as exc:                                # unknown plugin
        raise HTTPException(status_code=400, detail=str(exc))
    except VolatilityError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    parsed = parse_json_output(result["stdout"])
    raw_text = render_table(parsed["rows"], parsed["columns"])

    return {
        "status": "success",
        "plugin": req.plugin,
        "image": req.image,
        "columns": parsed["columns"],
        "rows": parsed["rows"],
        "raw": raw_text,
        "stderr": result["stderr"],
        "command": result["command"],
    }