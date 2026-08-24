"""Domain exceptions + global handlers producing the platform error envelope.

Envelope matches the frontend `ApiErrorBody`:
    {"statusCode": 400, "message": "...", "code": "...", "details": {...}}
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self,
        status_code: int = 400,
        message: str = "Bad request",
        code: str = "APP_ERROR",
        details: dict | None = None,
    ) -> None:
        self.status_code = status_code
        self.message = message
        self.code = code
        self.details = details
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(404, message, "NOT_FOUND")


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Not authenticated") -> None:
        super().__init__(401, message, "UNAUTHORIZED")


class ForbiddenError(AppException):
    def __init__(self, message: str = "Not authorized for this action") -> None:
        super().__init__(403, message, "FORBIDDEN")


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists") -> None:
        super().__init__(409, message, "CONFLICT")


def _error(status_code: int, message: str, code: str, details=None) -> JSONResponse:
    body: dict = {"statusCode": status_code, "message": message, "code": code}
    if details:
        body["details"] = details
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        return _error(exc.status_code, exc.message, exc.code, exc.details)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return _error(exc.status_code, detail, "HTTP_ERROR")

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        fields = {}
        for error in exc.errors():
            loc = ".".join(str(part) for part in error.get("loc", []) if part != "body")
            fields[loc or "body"] = error.get("msg", "Invalid value")
        return _error(422, "Validation failed", "VALIDATION_ERROR", {"fields": fields})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        return _error(500, "Internal server error", "INTERNAL_ERROR")
