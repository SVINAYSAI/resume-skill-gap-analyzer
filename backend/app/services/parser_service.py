"""
File parsing service — extracts plain text from PDF uploads or raw text input.
"""

import logging
from io import BytesIO

import fitz  # PyMuPDF

from app.core.config import get_settings
from app.core.exceptions import ExtractionError, FileParsingError

logger = logging.getLogger(__name__)

# Supported MIME types
SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text content from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages: list[str] = []
        for page in doc:
            pages.append(page.get_text("text"))
        doc.close()
        return "\n".join(pages).strip()
    except Exception as e:
        logger.error(f"PDF parsing failed: {e}")
        raise FileParsingError(f"Failed to parse the PDF file: {str(e)}")


def extract_text_from_upload(file_bytes: bytes, content_type: str, filename: str) -> str:
    """
    Dispatch to the appropriate parser based on file MIME type.
    Validates file size and extracted text length.
    """
    settings = get_settings()

    # Validate file size
    if len(file_bytes) > settings.max_file_size_bytes:
        raise FileParsingError(
            f"File '{filename}' exceeds the maximum size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Validate MIME type
    if content_type not in SUPPORTED_MIME_TYPES:
        raise FileParsingError(
            f"Unsupported file type '{content_type}'. Supported types: PDF, plain text."
        )

    # Parse by type
    if content_type == "application/pdf":
        text = extract_text_from_pdf(file_bytes)
    elif content_type == "text/plain":
        text = file_bytes.decode("utf-8", errors="replace").strip()
    else:
        raise FileParsingError(f"Unsupported file type: {content_type}")

    # Validate extracted text has enough content
    if len(text) < 50:
        raise ExtractionError(
            "Could not extract enough readable text from the uploaded file. "
            "Please paste the text directly or try a different file."
        )

    return text


def validate_text_input(text: str, field_name: str = "input") -> str:
    """Validate that raw text input has sufficient content."""
    cleaned = text.strip()
    if not cleaned:
        raise ExtractionError(f"The {field_name} text is empty. Please provide content.")
    if len(cleaned) < 20:
        raise ExtractionError(
            f"The {field_name} text is too short (minimum 20 characters). "
            "Please provide more detail."
        )
    return cleaned
