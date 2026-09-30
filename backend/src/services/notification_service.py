import asyncio
from src.database.mongo import utc_now
from src.repositories.system import NotificationRepository, NotificationLogRepository
from src.exceptions.handlers import NotFoundError

from src.database.base_repository import to_object_id
from src.repositories import UserRepository

class NotificationService:
    def __init__(self):
        self.notifications = NotificationRepository()
        self.logs = NotificationLogRepository()
        self.users = UserRepository()

    async def create_notification(self, user_id: str, title: str, message: str, notification_type: str, module: str) -> dict:
        user = await self.users.find_by_id(user_id)
        if user:
            prefs = user.get("notification_preferences", {})
            pref_key_map = {
                "BOOKING_REQUEST": "booking_enabled",
                "BOOKING_STATUS": "booking_enabled",
                "BOOKING_UPDATE": "booking_enabled",
                "PAYMENT": "payment_enabled",
                "PAYMENT_CONFIRMATION": "payment_enabled",
                "NEW_REVIEW": "review_enabled",
                "REVIEW_REPLY": "review_enabled",
                "CHAT_CREATED": "message_enabled",
                "NEW_MESSAGE": "message_enabled",
                "SYSTEM": "system_enabled",
            }
            toggle_key = pref_key_map.get(notification_type)
            if toggle_key and prefs.get(toggle_key) is False:
                # User disabled this category
                return {"id": "skipped", "status": "skipped", "reason": "preference_disabled"}

        doc = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "module": module,
            "is_read": False,
            "created_at": utc_now()
        }
        notif_doc = await self.notifications.insert(doc)
        notif_id = notif_doc["id"]
        
        # Broadcast real-time notification
        from src.services.websocket_manager import manager
        # MongoDB datetime is not JSON serializable by default, so convert created_at
        ws_notif = notif_doc.copy()
        if "created_at" in ws_notif and hasattr(ws_notif["created_at"], "isoformat"):
            ws_notif["created_at"] = ws_notif["created_at"].isoformat()
        if "_id" in ws_notif:
            del ws_notif["_id"]
            
        await manager.send_personal_message(
            {"type": "notification", "data": ws_notif},
            user_id
        )

        await self.logs.insert({
            "notification_id": notif_id,
            "status": "DELIVERED",
            "sent_at": utc_now()
        })
        
        return notif_doc

    async def list_notifications(self, user_id: str) -> list[dict]:
        return await self.notifications.find_many({"user_id": user_id}, sort=[("created_at", -1)])

    async def get_notification(self, nid: str) -> dict:
        notif = await self.notifications.find_by_id(nid)
        if not notif:
            raise NotFoundError("Notification not found")
        return notif

    async def mark_read(self, nid: str, user_id: str) -> dict:
        notif = await self.get_notification(nid)
        if notif.get("user_id") != user_id:
            raise NotFoundError("Notification not found")
        await self.notifications.update_by_id(nid, {"is_read": True})
        return await self.get_notification(nid)

    async def mark_all_read(self, user_id: str) -> None:
        await self.notifications.collection.update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )

    async def delete_notification(self, nid: str, user_id: str) -> None:
        deleted = await self.notifications.collection.delete_one({"_id": to_object_id(nid), "user_id": user_id})
        if deleted.deleted_count == 0:
            raise NotFoundError("Notification not found")
        await self.logs.collection.delete_many({"notification_id": nid})

    async def clear_all(self, user_id: str) -> None:
        notifs = await self.list_notifications(user_id)
        for n in notifs:
            nid_str = str(n.get("id") or n.get("_id"))
            await self.logs.collection.delete_many({"notification_id": nid_str})
        await self.notifications.collection.delete_many({"user_id": user_id})

# Background Task Helper
async def send_notification_task(user_id: str, title: str, message: str, notification_type: str, module: str):
    service = NotificationService()
    await service.create_notification(user_id, title, message, notification_type, module)
