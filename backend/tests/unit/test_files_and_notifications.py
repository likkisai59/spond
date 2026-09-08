"""Unit tests for FileService and NotificationService."""
from unittest.mock import AsyncMock, MagicMock
import io
import pytest
from bson import ObjectId
from fastapi import UploadFile
from src.services.notification_service import NotificationService
from src.services.file_service import FileService
from src.exceptions.handlers import NotFoundError, AppException


@pytest.fixture
def notification_service():
    return NotificationService()


@pytest.fixture
def file_service():
    return FileService()


@pytest.mark.asyncio
async def test_notification_create_and_get(notification_service):
    user_id = str(ObjectId())
    notif = await notification_service.create_notification(
        user_id=user_id,
        title="Training Rescheduled",
        message="Session moved to 6:00 PM",
        notification_type="Event",
        module="sports",
    )
    assert notif["title"] == "Training Rescheduled"
    assert notif["user_id"] == user_id
    assert notif["is_read"] is False

    # Check log was created
    log = await notification_service.logs.find_one({"notification_id": notif["id"]})
    assert log is not None
    assert log["status"] == "DELIVERED"


@pytest.mark.asyncio
async def test_notification_mark_read(notification_service):
    user_id = str(ObjectId())
    notif = await notification_service.create_notification(
        user_id=user_id,
        title="Payment Reminder",
        message="Dues pending",
        notification_type="Payment",
        module="sports",
    )
    marked = await notification_service.mark_read(notif["id"], user_id=user_id)
    assert marked["is_read"] is True


@pytest.mark.asyncio
async def test_notification_mark_all_read(notification_service):
    user_id = str(ObjectId())
    for i in range(3):
        await notification_service.create_notification(
            user_id=user_id,
            title=f"Update {i}",
            message="Content",
            notification_type="General",
            module="sports",
        )
    await notification_service.mark_all_read(user_id=user_id)
    all_notifs = await notification_service.list_notifications(user_id=user_id)
    assert len(all_notifs) == 3
    assert all(n["is_read"] is True for n in all_notifs)


@pytest.mark.asyncio
async def test_notification_delete(notification_service):
    user_id = str(ObjectId())
    notif = await notification_service.create_notification(
        user_id=user_id,
        title="To Delete",
        message="Delete me",
        notification_type="General",
        module="sports",
    )
    await notification_service.delete_notification(notif["id"], user_id=user_id)

    with pytest.raises(NotFoundError):
        await notification_service.get_notification(notif["id"])


@pytest.mark.asyncio
async def test_file_service_s3_key_generation(file_service):
    # With module_id
    key1 = await file_service._get_s3_key("sports", "schedule.pdf", "group_123")
    assert key1 == "sports/group_123/schedule.pdf"

    # Without module_id
    key2 = await file_service._get_s3_key("band", "album_art.png")
    assert key2 == "band/general/album_art.png"


@pytest.mark.asyncio
async def test_file_service_size_limit_exceeded(file_service, monkeypatch):
    file_service.bucket = "test-spond-bucket"
    # Create an upload file mock with >10MB
    oversized_content = b"x" * (10 * 1024 * 1024 + 1)
    file_mock = MagicMock(spec=UploadFile)
    file_mock.filename = "large_video.mp4"
    file_mock.content_type = "video/mp4"
    file_mock.read = AsyncMock(return_value=oversized_content)

    with pytest.raises(AppException) as exc_info:
        await file_service.upload_file(
            user_id=str(ObjectId()),
            file=file_mock,
            module="sports",
        )
    assert exc_info.value.status_code == 400
    assert "exceeds 10MB" in str(exc_info.value.message)
