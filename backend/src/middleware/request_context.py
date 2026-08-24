"""Request-context middleware: correlation id + access log."""
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from src.utils.logger import correlation_id_var, get_logger

logger = get_logger("unify.request")


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("x-correlation-id") or uuid.uuid4().hex
        token = correlation_id_var.set(correlation_id)
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "request failed method=%s path=%s", request.method, request.url.path
            )
            correlation_id_var.reset(token)
            raise
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "request completed method=%s path=%s status=%s duration_ms=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        response.headers["x-correlation-id"] = correlation_id
        correlation_id_var.reset(token)
        return response
