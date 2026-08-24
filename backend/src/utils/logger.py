"""Structured JSON logging (compact single-line, correlation-id aware)."""
import json
import logging
import sys
from contextvars import ContextVar

correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="-")

_configured = False


def setup_logging(service_name: str, env: str) -> None:
    global _configured
    if _configured:
        return

    class JsonFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            payload = {
                "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
                "level": record.levelname,
                "service": service_name,
                "env": env,
                "logger": record.name,
                "message": record.getMessage(),
                "correlation_id": correlation_id_var.get(),
            }
            if record.exc_info:
                payload["exception"] = self.formatException(record.exc_info)
            return json.dumps(payload, default=str)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").disabled = True
    _configured = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
