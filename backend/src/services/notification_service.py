import asyncio
from src.database.mongo import utc_now
from src.repositories.system import NotificationRepository, NotificationLogRepository
from src.exceptions.handlers import NotFoundError

class NotificationService:
    def __init__(self):
        self.notifications = NotificationRepository()
        self.logs = NotificationLogRepository()

    async def create_notification(self, user_id: str, title: str, message: str, notification_type: str, module: str) -> dict:
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
        
        # In a real app we might trigger push notifications or websockets here
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
        from bson import ObjectId
        deleted = await self.notifications.collection.delete_one({"_id": ObjectId(nid), "user_id": user_id})
        if deleted.deleted_count == 0:
            raise NotFoundError("Notification not found")
        await self.logs.collection.delete_many({"notification_id": nid})

    async def clear_all(self, user_id: str) -> None:
        notifs = await self.list_notifications(user_id)
        for n in notifs:
            await self.logs.collection.delete_many({"notification_id": str(n["_id"])})
        await self.notifications.collection.delete_many({"user_id": user_id})

# Background Task Helper
async def send_notification_task(user_id: str, title: str, message: str, notification_type: str, module: str):
    service = NotificationService()
    await service.create_notification(user_id, title, message, notification_type, module)
