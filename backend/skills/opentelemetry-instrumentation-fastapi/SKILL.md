---
name: opentelemetry-instrumentation-fastapi
description: "OpenTelemetry FastAPI instrumentation with automatic tracing, request/response hooks, header capture, and URL exclusion patterns"
progressive_disclosure:
  entry_point:
    summary: "Automatic instrumentation for FastAPI applications with OpenTelemetry distributed tracing"
    when_to_use:
      - "When adding automatic request tracing to FastAPI applications"
      - "When needing custom request/response hooks for span enrichment"
      - "When capturing HTTP headers as span attributes"
      - "When excluding specific URLs from tracing (health checks, metrics)"
    quick_start:
      - "pip install opentelemetry-instrumentation-fastapi"
      - "FastAPIInstrumentor.instrument_app(app)"
      - "Configure excluded_urls for health endpoints"
      - "Add custom hooks for business-specific span attributes"
  token_estimate:
    entry: 75-90
    full: 4500-5500
---
# OpenTelemetry FastAPI Instrumentation Skill

## Overview

This library provides automatic and manual instrumentation of FastAPI web frameworks, instrumenting HTTP requests served by applications utilizing the framework. It integrates seamlessly with the OpenTelemetry SDK to provide distributed tracing out of the box.

**Key Features:**
- Automatic request/response tracing
- Request and response hooks for custom span enrichment
- HTTP header capture as span attributes
- URL exclusion patterns via regex
- Auto-instrumentation support via CLI
- Semantic convention compliance

## Installation

```bash
pip install opentelemetry-instrumentation-fastapi
```

### Additional Dependencies
```bash
# Core OpenTelemetry (required)
pip install opentelemetry-api
pip install opentelemetry-sdk

# OTLP Exporter (recommended for production)
pip install opentelemetry-exporter-otlp
```

## Basic Usage

### Simple Instrumentation
```python
import fastapi
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = fastapi.FastAPI()

@app.get("/foobar")
async def foobar():
    return {"message": "hello world"}

# Instrument the FastAPI app
FastAPIInstrumentor.instrument_app(app)
```

### Instrumentation with TracerProvider
```python
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Setup tracer provider
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Create and instrument app
app = FastAPI()
FastAPIInstrumentor.instrument_app(app, tracer_provider=provider)
```

## Configuration Options

### URL Exclusion (Exclude Lists)

Exclude certain URLs from tracking to reduce noise and cost.

#### Environment Variable
```bash
# FastAPI-specific exclusions
export OTEL_PYTHON_FASTAPI_EXCLUDED_URLS="client/.*/info,healthcheck"

# Global exclusions (applies to all instrumentations)
export OTEL_PYTHON_EXCLUDED_URLS="client/.*/info,healthcheck"
```

#### Programmatic Configuration
```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Exclude URLs matching patterns
FastAPIInstrumentor.instrument_app(
    app,
    excluded_urls="client/.*/info,healthcheck,/metrics"
)
```

#### Common Exclusion Patterns
```python
# Typical production exclusions
EXCLUDED_URLS = ",".join([
    r"healthcheck",           # /healthcheck
    r"/health",               # /health
    r"/metrics",              # /metrics  
    r"/docs",                 # FastAPI docs
    r"/openapi.json",         # OpenAPI schema
    r"client/.*/info",        # Dynamic client info endpoints
    r"/redoc",                # ReDoc documentation
])

FastAPIInstrumentor.instrument_app(app, excluded_urls=EXCLUDED_URLS)
```

### Request/Response Hooks

Hooks allow custom span enrichment at different points in the request lifecycle.

#### Hook Types

| Hook | When Called | Parameters |
|------|-------------|------------|
| `server_request_hook` | After span creation for incoming request | `(span, scope)` |
| `client_request_hook` | When `receive` method is called | `(span, scope, message)` |
| `client_response_hook` | When `send` method is called | `(span, scope, message)` |

#### Server Request Hook
```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.trace import Span
from typing import Any

def server_request_hook(span: Span, scope: dict[str, Any]):
    """Called when a new request span is created."""
    if span and span.is_recording():
        # Add custom attributes from request
        span.set_attribute("custom_user_attribute_from_request_hook", "some-value")
        
        # Extract user info from scope if authenticated
        user = scope.get("user")
        if user:
            span.set_attribute("user.id", str(user.get("id")))
            span.set_attribute("user.email", user.get("email"))
        
        # Add request metadata
        headers = dict(scope.get("headers", []))
        request_id = headers.get(b"x-request-id", b"").decode()
        if request_id:
            span.set_attribute("http.request_id", request_id)

FastAPIInstrumentor.instrument_app(app, server_request_hook=server_request_hook)
```

#### Client Request Hook
```python
def client_request_hook(span: Span, scope: dict[str, Any], message: dict[str, Any]):
    """Called when receive() is called on the ASGI app."""
    if span and span.is_recording():
        span.set_attribute("custom_user_attribute_from_client_request_hook", "some-value")
        
        # Log message type
        msg_type = message.get("type")
        if msg_type:
            span.set_attribute("asgi.message.type", msg_type)
```

#### Client Response Hook
```python
def client_response_hook(span: Span, scope: dict[str, Any], message: dict[str, Any]):
    """Called when send() is called on the ASGI app."""
    if span and span.is_recording():
        span.set_attribute("custom_user_attribute_from_response_hook", "some-value")
        
        # Capture response status
        if message.get("type") == "http.response.start":
            status_code = message.get("status")
            span.set_attribute("http.response.status_code", status_code)
```

#### All Hooks Together
```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

FastAPIInstrumentor().instrument(
    server_request_hook=server_request_hook,
    client_request_hook=client_request_hook,
    client_response_hook=client_response_hook
)
```

### HTTP Header Capture

Capture HTTP request and response headers as span attributes following [semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#http-server-span).

#### Request Headers

**Environment Variable:**
```bash
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="content-type,custom_request_header"
```

**Programmatic:**
```python
FastAPIInstrumentor.instrument_app(
    app,
    http_capture_headers_server_request=["content-type", "x-request-id", "x-user-id"]
)
```

**Regex Patterns:**
```bash
# Match all headers starting with Accept or X-
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="Accept.*,X-.*"

# Capture ALL request headers
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST=".*"
```

#### Response Headers

**Environment Variable:**
```bash
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="content-type,custom_response_header"
```

**Programmatic:**
```python
FastAPIInstrumentor.instrument_app(
    app,
    http_capture_headers_server_response=["content-type", "x-request-id", "x-rate-limit"]
)
```

**Regex Patterns:**
```bash
# Match all headers starting with Content or X-
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="Content.*,X-.*"

# Capture ALL response headers
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE=".*"
```

#### Header Attribute Naming

Headers are normalized and added as span attributes:

| Original Header | Span Attribute Name | Example Value |
|-----------------|---------------------|---------------|
| `Content-Type` | `http.request.header.content_type` | `["application/json"]` |
| `X-Request-ID` | `http.request.header.x_request_id` | `["abc-123"]` |
| `X-Custom-Header` | `http.response.header.x_custom_header` | `["value1", "value2"]` |

**Note:** Header names are case-insensitive. `CUStom-Header` matches `custom-header`.

### Header Sanitization

Prevent storing sensitive data (PII, session keys, passwords) by sanitizing specific headers.

**Environment Variable:**
```bash
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS=".*session.*,set-cookie,authorization"
```

**Programmatic:**
```python
FastAPIInstrumentor.instrument_app(
    app,
    http_capture_headers_sanitize_fields=["authorization", "cookie", ".*session.*"]
)
```

**Result:** Sanitized headers will show `[REDACTED]` instead of actual values.

### Excluding Internal Spans

Exclude `receive` and/or `send` spans from traces to reduce span count.

```python
# Exclude both receive and send spans
FastAPIInstrumentor.instrument_app(
    app,
    exclude_spans=["receive", "send"]
)

# Exclude only receive spans
FastAPIInstrumentor.instrument_app(
    app,
    exclude_spans=["receive"]
)
```

## Auto-Instrumentation (CLI)

Use the OpenTelemetry CLI for zero-code instrumentation.

```bash
# Run with auto-instrumentation
opentelemetry-instrument uvicorn app.main:app --host 0.0.0.0 --port 8000

# With environment configuration
OTEL_PYTHON_FASTAPI_EXCLUDED_URLS="healthcheck,/metrics" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
opentelemetry-instrument python -m uvicorn app.main:app
```

## Complete Production Example

```python
import os
from fastapi import FastAPI, Request
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.trace import Span
from typing import Any
import logging

logger = logging.getLogger(__name__)

# Server request hook for custom attributes
def server_request_hook(span: Span, scope: dict[str, Any]):
    """Enrich spans with custom request attributes."""
    if span and span.is_recording():
        # Add path and method explicitly
        span.set_attribute("http.route", scope.get("root_path", "") + scope.get("path", ""))
        
        # Extract authenticated user from scope (set by auth middleware)
        user = scope.get("user")
        if user:
            span.set_attribute("user.id", str(user.id))
            span.set_attribute("user.tenant_id", str(user.tenant_id))
        
        # Extract request ID from headers
        headers = dict(scope.get("headers", []))
        request_id = headers.get(b"x-request-id", b"").decode()
        if request_id:
            span.set_attribute("http.request_id", request_id)

# Response hook for response metadata
def client_response_hook(span: Span, scope: dict[str, Any], message: dict[str, Any]):
    """Add response metadata to spans."""
    if span and span.is_recording() and message.get("type") == "http.response.start":
        status = message.get("status", 0)
        span.set_attribute("http.response.status_code", status)
        
        # Mark error spans
        if status >= 400:
            span.set_attribute("error", True)

def init_telemetry(service_name: str) -> TracerProvider:
    """Initialize OpenTelemetry with production-ready configuration."""
    
    # Create resource with service identity
    resource = Resource.create({
        SERVICE_NAME: service_name,
        "service.version": os.getenv("APP_VERSION", "1.0.0"),
        "deployment.environment": os.getenv("APP_ENV", "development"),
    })
    
    # Create tracer provider
    provider = TracerProvider(resource=resource)
    
    # Configure OTLP exporter
    exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
    )
    
    # Use batch processor for production
    provider.add_span_processor(BatchSpanProcessor(exporter))
    
    # Set global tracer provider
    trace.set_tracer_provider(provider)
    
    return provider

# Create FastAPI app
app = FastAPI(
    title="Payments Service",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    """Initialize telemetry on startup."""
    # Initialize tracer provider
    provider = init_telemetry("payments-service")
    
    # Instrument FastAPI with all configurations
    FastAPIInstrumentor.instrument_app(
        app,
        tracer_provider=provider,
        excluded_urls="healthcheck,/health,/metrics,/docs,/openapi.json,/redoc",
        server_request_hook=server_request_hook,
        client_response_hook=client_response_hook,
        http_capture_headers_server_request=["content-type", "x-request-id", "x-user-id"],
        http_capture_headers_server_response=["content-type", "x-request-id"],
        http_capture_headers_sanitize_fields=["authorization", "cookie"],
        exclude_spans=["receive", "send"]  # Reduce span count
    )
    
    logger.info("OpenTelemetry instrumentation initialized")

@app.get("/health")
async def health():
    """Health check endpoint (excluded from tracing)."""
    return {"status": "healthy"}

@app.get("/users/{user_id}")
async def get_user(user_id: str, request: Request):
    """Example endpoint with automatic tracing."""
    # Span is automatically created by instrumentation
    # Custom attributes can be added via request hook
    return {"user_id": user_id, "status": "active"}

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    trace.get_tracer_provider().shutdown()
```

## Uninstrumentation

Remove instrumentation when needed (e.g., for testing).

```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Remove instrumentation
FastAPIInstrumentor.uninstrument_app(app)
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `OTEL_PYTHON_FASTAPI_EXCLUDED_URLS` | Comma-delimited regex patterns for URLs to exclude | `healthcheck,/metrics` |
| `OTEL_PYTHON_EXCLUDED_URLS` | Global URL exclusion patterns (all instrumentations) | `client/.*/info` |
| `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` | Request headers to capture | `content-type,x-*` |
| `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE` | Response headers to capture | `content-type` |
| `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS` | Headers to sanitize (redact) | `authorization,cookie` |

## Best Practices

1. **Always Exclude Health/Metrics Endpoints**: Reduce noise and cost by excluding `/health`, `/metrics`, `/docs` from tracing
2. **Use BatchSpanProcessor**: Always use batch processing in production for performance
3. **Sanitize Sensitive Headers**: Always redact `authorization`, `cookie`, and session-related headers
4. **Add Business Context via Hooks**: Use request hooks to add user IDs, tenant IDs, and business-specific attributes
5. **Set Meaningful Service Names**: Use `SERVICE_NAME` resource attribute for service identification
6. **Configure Sampling**: For high-traffic services, configure appropriate sampling rates
7. **Test with Uninstrumentation**: Use `uninstrument_app()` in tests to isolate tracing logic
8. **Follow Semantic Conventions**: Use standard attribute names (`http.method`, `http.status_code`, etc.)

## Common Patterns

### Multi-Service Tracing
```python
# Service A - Propagate context
import httpx
from opentelemetry.propagate import inject

async def call_service_b():
    headers = {}
    inject(headers)  # Inject trace context
    async with httpx.AsyncClient() as client:
        return await client.post("http://service-b/api", headers=headers)

# Service B - Receive context automatically via FastAPI instrumentation
@app.post("/api")
async def handle_request(request: Request):
    # Span automatically linked to parent from Service A
    return {"status": "ok"}
```

### Conditional Instrumentation
```python
import os

# Only instrument in non-test environments
if os.getenv("APP_ENV") != "test":
    FastAPIInstrumentor.instrument_app(app)
```

## Resources

- [OpenTelemetry FastAPI Instrumentation Docs](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
- [OpenTelemetry Python Documentation](https://opentelemetry-python.readthedocs.io/)
- [Semantic Conventions for HTTP](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md)
- [OpenTelemetry Project](https://opentelemetry.io/)

## Related Skills

- **opentelemetry-fastapi-logging**: Full logging setup with OpenTelemetry integration
- **fastapi-standard-development**: Core FastAPI patterns
- **error-handling-fallback**: Error handling with trace context
- **async-non-blocking-service**: Async patterns with telemetry