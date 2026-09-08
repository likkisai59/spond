"""Pytest fixtures and in-memory mocks for Motor MongoDB, Redis, and integrations."""
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock, AsyncMock
from bson import ObjectId
import pytest

# Ensure backend root is on sys.path
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only-min-32-chars")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("RAZORPAY_KEY_ID", "rzp_test_mock_key")
os.environ.setdefault("RAZORPAY_KEY_SECRET", "rzp_test_mock_secret")

from src.database.mongo import mongo
from src.database.redis import RedisClient


def _matches_query(doc: dict[str, Any], query: dict[str, Any]) -> bool:
    """Evaluate document against a MongoDB-like query dict."""
    if not query:
        return True
    for key, val in query.items():
        if key == "$or":
            if not any(_matches_query(doc, subq) for subq in val):
                return False
            continue
        if key == "$and":
            if not all(_matches_query(doc, subq) for subq in val):
                return False
            continue

        doc_val = doc.get(key)
        if isinstance(val, dict):
            for op, op_val in val.items():
                if op == "$ne":
                    if doc_val == op_val:
                        return False
                elif op == "$in":
                    str_op_vals = [str(x) for x in op_val]
                    if doc_val not in op_val and str(doc_val) not in str_op_vals:
                        return False
                elif op == "$nin":
                    if doc_val in op_val or str(doc_val) in [str(x) for x in op_val]:
                        return False
                elif op == "$gt":
                    if doc_val is None or doc_val <= op_val:
                        return False
                elif op == "$gte":
                    if doc_val is None or doc_val < op_val:
                        return False
                elif op == "$lt":
                    if doc_val is None or doc_val >= op_val:
                        return False
                elif op == "$lte":
                    if doc_val is None or doc_val > op_val:
                        return False
        else:
            # Handle ObjectId vs string comparison
            if isinstance(val, ObjectId) or isinstance(doc_val, ObjectId):
                if str(doc_val) != str(val):
                    return False
            elif doc_val != val:
                return False
    return True


class MockAsyncCursor:
    def __init__(self, docs: list[dict[str, Any]]):
        self._docs = list(docs)
        self._iter = None

    def sort(self, sort_spec):
        if isinstance(sort_spec, list) and sort_spec:
            key, direction = sort_spec[0]
            reverse = direction == -1
            self._docs.sort(key=lambda d: (d.get(key) is not None, d.get(key)), reverse=reverse)
        return self

    def skip(self, n: int):
        self._docs = self._docs[n:]
        return self

    def limit(self, n: int):
        if n > 0:
            self._docs = self._docs[:n]
        return self

    async def to_list(self, length: int | None = None):
        if length is not None:
            return list(self._docs[:length])
        return list(self._docs)

    def __aiter__(self):
        self._iter = iter(self._docs)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: dict[str, dict[str, Any]] = {}

    async def insert_one(self, document: dict[str, Any], session=None):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        oid_str = str(doc["_id"])
        self.docs[oid_str] = doc
        res = MagicMock()
        res.inserted_id = doc["_id"]
        return res

    async def find_one(self, query: dict[str, Any] = None, session=None):
        query = query or {}
        for doc in self.docs.values():
            if _matches_query(doc, query):
                return dict(doc)
        return None

    def find(self, query: dict[str, Any] = None, session=None):
        query = query or {}
        matches = [dict(d) for d in self.docs.values() if _matches_query(d, query)]
        return MockAsyncCursor(matches)

    async def count_documents(self, query: dict[str, Any] = None, session=None) -> int:
        query = query or {}
        return sum(1 for d in self.docs.values() if _matches_query(d, query))

    async def find_one_and_update(
        self, query: dict[str, Any], update: dict[str, Any], return_document=True, session=None
    ):
        for doc in self.docs.values():
            if _matches_query(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                for k, v in update.items():
                    if not k.startswith("$"):
                        doc[k] = v
                return dict(doc)
        return None

    async def update_one(self, query: dict[str, Any], update: dict[str, Any], upsert=False, session=None):
        for doc in self.docs.values():
            if _matches_query(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                for k, v in update.items():
                    if not k.startswith("$"):
                        doc[k] = v
                res = MagicMock()
                res.modified_count = 1
                return res
        if upsert:
            new_doc = dict(query)
            if "$set" in update:
                new_doc.update(update["$set"])
            if "$setOnInsert" in update:
                new_doc.update(update["$setOnInsert"])
            if "_id" not in new_doc:
                new_doc["_id"] = ObjectId()
            self.docs[str(new_doc["_id"])] = new_doc
            res = MagicMock()
            res.upserted_id = new_doc["_id"]
            return res
        res = MagicMock()
        res.modified_count = 0
        return res

    async def update_many(self, query: dict[str, Any], update: dict[str, Any], session=None):
        count = 0
        for doc in self.docs.values():
            if _matches_query(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                count += 1
        res = MagicMock()
        res.modified_count = count
        return res

    async def delete_one(self, query: dict[str, Any], session=None):
        to_del = None
        for oid, doc in self.docs.items():
            if _matches_query(doc, query):
                to_del = oid
                break
        res = MagicMock()
        if to_del:
            del self.docs[to_del]
            res.deleted_count = 1
        else:
            res.deleted_count = 0
        return res

    async def delete_many(self, query: dict[str, Any], session=None):
        to_del = [oid for oid, doc in self.docs.items() if _matches_query(doc, query)]
        for oid in to_del:
            del self.docs[oid]
        res = MagicMock()
        res.deleted_count = len(to_del)
        return res

    async def create_index(self, keys, **kwargs):
        return "index_created"


class MockMongoDatabase:
    def __init__(self):
        self.collections: dict[str, MockCollection] = {}

    def __getitem__(self, name: str) -> MockCollection:
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]


class MockSessionContext:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    def start_transaction(self):
        return MockSessionContext()


class MockMongoClient:
    def __init__(self, db: MockMongoDatabase):
        self._db = db

    def __getitem__(self, name: str):
        return self._db

    async def start_session(self):
        return MockSessionContext()


class MockRedis:
    def __init__(self):
        self._store: dict[str, str] = {}

    async def get(self, key: str) -> str | None:
        return self._store.get(key)

    async def set(self, key: str, value: str, ex=None, nx=False) -> bool:
        if nx and key in self._store:
            return False
        self._store[key] = str(value)
        return True

    async def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._store:
                del self._store[k]
                count += 1
        return count

    async def exists(self, *keys: str) -> int:
        return sum(1 for k in keys if k in self._store)

    async def expire(self, key: str, time: int) -> bool:
        return key in self._store

    async def aclose(self):
        pass


@pytest.fixture(autouse=True)
def setup_mock_db(monkeypatch):
    """Automatically mock MongoDB, Redis, and EmailService for all tests."""
    mock_db = MockMongoDatabase()
    mock_client = MockMongoClient(mock_db)
    
    # Attach mock to mongo singleton
    mongo._db = mock_db
    mongo._client = mock_client
    
    # Setup mock redis
    mock_redis = MockRedis()
    RedisClient._client = mock_redis

    # Mock external email service
    monkeypatch.setattr("src.services.email_service.EmailService.send_password_reset_email", AsyncMock())
    monkeypatch.setattr("src.services.email_service.EmailService.send_otp_email", AsyncMock())
    monkeypatch.setattr("src.services.email_service.EmailService.send_group_invite_email", AsyncMock())
    
    yield mock_db
    
    # Teardown
    mongo._db = None
    mongo._client = None
    RedisClient._client = None
