"""Suma kontrolna dowodu — dowód, że pole `evidence` nie zostało sparafrazowane ani nadpisane."""
import hashlib


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    """Do plików binarnych (.msg/.docx/.pptx) — nigdy nie czytaj ich jako tekst UTF-8."""
    return hashlib.sha256(data).hexdigest()
