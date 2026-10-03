"""
File storage for vehicle images and documents (RC, insurance, PUC).

Blueprint Section 15 recommends S3-compatible object storage. This
sandbox has no network access to AWS/R2 (see network_configuration —
only package registries are reachable), so — same call the original
codebase made for the exact same reason — only the *interface* is
built here, deliberately, so that not being able to reach a cloud
provider doesn't block writing or testing the rest of the listing/
verification flow. Swap LocalFileStorage for an S3FileStorage
implementing the same one method and nothing else in this module
changes.

LocalFileStorage is explicitly NOT what production should run on, and
is not meant for anything other than dev/test.
"""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Protocol

from app.config import settings

MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}


class UnsupportedFileError(Exception):
    pass


class FileStorage(Protocol):
    async def save(self, content: bytes, content_type: str, key_prefix: str) -> str:
        """Returns a URL the file can be retrieved from. Raises
        UnsupportedFileError for anything failing the size/type checks —
        callers should turn that into a 422, not a 500."""
        ...


def _validate(content: bytes, content_type: str) -> None:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise UnsupportedFileError(f"Unsupported file type: {content_type}")
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise UnsupportedFileError("File exceeds the 10MB limit")
    if len(content) == 0:
        raise UnsupportedFileError("Empty file")


class LocalFileStorage:
    """Dev/test only — see module docstring."""

    def __init__(self, base_dir: str = "/tmp/quantaliez-auto-uploads"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, content: bytes, content_type: str, key_prefix: str) -> str:
        _validate(content, content_type)
        ext = {"application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png"}[content_type]
        key = f"{key_prefix}/{uuid.uuid4().hex}.{ext}"
        path = self.base_dir / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        # app/main.py mounts /uploads as a static file server against this
        # same base_dir, so what save() returns is actually fetchable by a
        # browser (a vehicle card thumbnail, the gallery, a verification
        # document preview) — not just a path meaningful to this process.
        return f"{settings.app_base_url}/uploads/{key}"


default_storage = LocalFileStorage()
