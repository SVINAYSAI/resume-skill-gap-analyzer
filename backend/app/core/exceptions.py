"""
Custom exception classes and global exception handlers.
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class FileParsingError(AppError):
    """Raised when file parsing fails."""

    def __init__(self, message: str = "Failed to parse the uploaded file."):
        super().__init__(message=message, status_code=400)


class ExtractionError(AppError):
    """Raised when text extraction produces insufficient content."""

    def __init__(self, message: str = "Could not extract readable text from the input."):
        super().__init__(message=message, status_code=400)


class AIServiceError(AppError):
    """Raised when the AI service fails after retries."""

    def __init__(self, message: str = "AI service failed to process the request. Please try again."):
        super().__init__(message=message, status_code=502)


class ValidationError(AppError):
    """Raised for input validation failures."""

    def __init__(self, message: str = "Invalid input provided."):
        super().__init__(message=message, status_code=400)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Global handler for all AppError subclasses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": None,
            "errors": [exc.message],
        },
    )
