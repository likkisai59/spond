import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from src.database.mongo import utc_now
from src.repositories.messages import ConversationRepository, MessageRepository
from src.repositories.eventhub import EventHubEventRepository
from src.schemas.messages import (
    ConversationResponse, 
    MessageSchema, 
    CreateConversationPayload,
    SendMessagePayload,
    MessageUpdatePayload
)
from src.core.config import settings
from src.database.base_repository import BaseRepository
from src.services.notification_service import NotificationService

class BookingRepository(BaseRepository):
    collection_name = "band_bookings"

class VenueBookingRepository(BaseRepository):
    collection_name = "band_venue_bookings"

class MessageService:
    def __init__(self):
        self.conversations = ConversationRepository()
        self.messages = MessageRepository()
        self.events = EventHubEventRepository()
        self.band_bookings = BookingRepository()
        self.venue_bookings = VenueBookingRepository()

    async def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        # A user is in a conversation if they are the client, the band, or the venue owner
        query = {
            "$or": [
                {"client_id": user_id},
                {"band_id": user_id},
                {"venue_owner_id": user_id}
            ]
        }
        cursor = self.conversations.collection.find(query).sort("last_message_at", -1)
        conversations = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            
            # Format datetime fields
            if doc.get("created_at") and hasattr(doc["created_at"], 'isoformat'):
                doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("updated_at") and hasattr(doc["updated_at"], 'isoformat'):
                doc["updated_at"] = doc["updated_at"].isoformat()
            if doc.get("last_message_at") and hasattr(doc["last_message_at"], 'isoformat'):
                doc["last_message_at"] = doc["last_message_at"].isoformat()
                
            # If there's a pinned message, format it
            if doc.get("pinned_message"):
                doc["pinned_message"]["id"] = str(doc["pinned_message"].pop("_id", doc["pinned_message"].get("id")))
                
            conversations.append(doc)
            
        return conversations

    async def get_conversation(self, conversation_id: str, user_id: str) -> Dict[str, Any]:
        doc = await self.conversations.find_by_id(conversation_id)
        if not doc:
            raise ValueError("Conversation not found")
        
        # Verify participation
        if doc.get("client_id") != user_id and doc.get("band_id") != user_id and doc.get("venue_owner_id") != user_id:
            raise PermissionError("Not authorized to access this conversation")
            
        if doc.get("created_at") and hasattr(doc["created_at"], 'isoformat'):
            doc["created_at"] = doc["created_at"].isoformat()
        if doc.get("updated_at") and hasattr(doc["updated_at"], 'isoformat'):
            doc["updated_at"] = doc["updated_at"].isoformat()
        if doc.get("last_message_at") and hasattr(doc["last_message_at"], 'isoformat'):
            doc["last_message_at"] = doc["last_message_at"].isoformat()
            
        return doc

    async def create_conversation(self, payload: CreateConversationPayload, user_id: str) -> Dict[str, Any]:
        # Check if conversation for this booking already exists
        existing = await self.conversations.find_one({"booking_id": payload.booking_id})
        if existing:
            existing["id"] = str(existing.pop("_id", existing.get("id")))
            existing["created_at"] = existing["created_at"].isoformat() if hasattr(existing["created_at"], 'isoformat') else existing["created_at"]
            existing["updated_at"] = existing["updated_at"].isoformat() if hasattr(existing["updated_at"], 'isoformat') else existing["updated_at"]
            existing["last_message_at"] = existing["last_message_at"].isoformat() if hasattr(existing["last_message_at"], 'isoformat') else existing["last_message_at"]
            return existing
            
        # Fetch the booking to get client_id, band_id, venue_owner_id
        client_id = user_id
        band_id = None
        venue_owner_id = None
        event_name = f"Event for {payload.booking_id}"
        
        from bson import ObjectId
        
        def is_valid_objectid(val: str) -> bool:
            try:
                ObjectId(val)
                return True
            except:
                return False

        # Try band_bookings
        query: dict = {"$or": [{"id": payload.booking_id}]}
        if is_valid_objectid(payload.booking_id):
            query["$or"].append({"_id": ObjectId(payload.booking_id)})
            
        booking = await self.band_bookings.find_one(query)
        if booking:
            client_id = booking.get("customer_id") or user_id
            # Try multiple fields to get the provider's user/owner id
            band_id = (
                booking.get("provider_owner_id") or
                booking.get("provider_user_id") or
                booking.get("owner_id")
            )
            # If provider_owner_id is missing, try to resolve via provider_id (artist record's created_by)
            if not band_id and booking.get("provider_id"):
                from src.database.base_repository import BaseRepository
                class _ArtistRepo(BaseRepository):
                    collection_name = "band_artists"
                artist_rec = await _ArtistRepo().find_by_id(booking["provider_id"])
                if artist_rec:
                    band_id = artist_rec.get("created_by") or artist_rec.get("user_id")
            event_name = booking.get("event_name") or booking.get("title") or booking.get("provider_name") or event_name
        else:
            # Try band_venue_bookings
            booking = await self.venue_bookings.find_one(query)
            if booking:
                client_id = booking.get("customer_id") or booking.get("client_id") or user_id
                venue_owner_id = (
                    booking.get("provider_owner_id") or
                    booking.get("provider_user_id") or
                    booking.get("venue_owner_id") or
                    booking.get("venue_id")
                )
                # If still missing, resolve via venue record
                if not venue_owner_id and booking.get("provider_id"):
                    from src.database.base_repository import BaseRepository
                    class _VenueRepo(BaseRepository):
                        collection_name = "band_venues"
                    venue_rec = await _VenueRepo().find_by_id(booking["provider_id"])
                    if venue_rec:
                        venue_owner_id = venue_rec.get("created_by") or venue_rec.get("user_id")
                event_name = booking.get("event_name") or booking.get("event_title") or booking.get("title") or booking.get("provider_name") or event_name
            else:
                # Try eventhub_events
                booking = await self.events.find_one(query)
                if booking:
                    client_id = booking.get("customer_id") or user_id
                    band_id = booking.get("artist_id")
                    venue_owner_id = booking.get("venue_id")
                    event_name = booking.get("event_name") or booking.get("title") or event_name
                    
        # Fallback names if missing
        if event_name == f"Event for {payload.booking_id}":
            if band_id:
                event_name = "Artist Booking"
            elif venue_owner_id:
                event_name = "Venue Booking"

        now = utc_now()
        doc = {
            "booking_id": payload.booking_id,
            "client_id": client_id,
            "band_id": band_id,
            "venue_owner_id": venue_owner_id,
            "pinned_message_id": None,
            "status": "ACTIVE",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now,
            "event_name": event_name
        }
        
        created = await self.conversations.insert(doc)
        created["id"] = str(created.pop("_id", created.get("id")))
        created["created_at"] = created["created_at"].isoformat()
        created["updated_at"] = created["updated_at"].isoformat()
        created["last_message_at"] = created["last_message_at"].isoformat()
        
        return created

    async def get_messages(self, conversation_id: str, user_id: str, page: int = 1, limit: int = 50) -> List[Dict[str, Any]]:
        # Verify access
        await self.get_conversation(conversation_id, user_id)
        
        skip = (page - 1) * limit
        messages_docs = await self.messages.find_many(
            {"conversation_id": conversation_id},
            sort=[("created_at", -1)],
            skip=skip,
            limit=limit
        )
        
        # Reverse to get chronological order for the frontend
        messages_docs.reverse()
        
        for msg in messages_docs:
            if msg.get("created_at"):
                msg["created_at"] = msg["created_at"].isoformat()
            if msg.get("updated_at"):
                msg["updated_at"] = msg["updated_at"].isoformat()
            if msg.get("edited_at"):
                msg["edited_at"] = msg["edited_at"].isoformat()
            if msg.get("read_at"):
                msg["read_at"] = msg["read_at"].isoformat()
                
            for reaction in msg.get("reactions", []):
                if isinstance(reaction.get("created_at"), datetime):
                    reaction["created_at"] = reaction["created_at"].isoformat()
                    
        return messages_docs

    async def save_message(self, conversation_id: str, sender_id: str, payload: SendMessagePayload, message_type: str = "TEXT", attachment_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        from src.repositories import UserRepository
        sender = await UserRepository().find_by_id(sender_id)
        sender_name = sender.get("full_name", "Unknown User") if sender else "Unknown User"
        now = utc_now()
        
        msg_doc = {
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "message_type": message_type,
            "content": payload.content,
            "reply_to_message_id": payload.reply_to_message_id,
            "edited_at": None,
            "read_at": None,
            "is_deleted": False,
            "reactions": [],
            "created_at": now,
            "updated_at": now
        }
        
        if attachment_data:
            msg_doc.update(attachment_data)
            
        created_msg = await self.messages.insert(msg_doc)
        
        # Update conversation last message
        await self.conversations.update_by_id(conversation_id, {
            "last_message_at": now
        })
        
        if created_msg.get("created_at") and hasattr(created_msg["created_at"], 'isoformat'):
            created_msg["created_at"] = created_msg["created_at"].isoformat()
        if created_msg.get("updated_at") and hasattr(created_msg["updated_at"], 'isoformat'):
            created_msg["updated_at"] = created_msg["updated_at"].isoformat()
        
        # Broadcast real-time message
        from src.services.websocket_manager import manager
        conv = await self.conversations.find_by_id(conversation_id)
        if conv:
            participants = [p for p in [conv.get("client_id"), conv.get("band_id"), conv.get("venue_owner_id")] if p]
            
            # Send Notifications to everyone except sender
            notif_service = NotificationService()
            for p in set(participants):
                await manager.send_personal_message(
                    {"type": "messaging", "event": "message.created", "data": created_msg},
                    p
                )
                
                if p != sender_id:
                    # Resolve sender name (optional improvement: fetch real name)
                    msg_preview = payload.content if payload.content else "Sent an attachment"
                    if len(msg_preview) > 50:
                        msg_preview = msg_preview[:47] + "..."
                        
                    await notif_service.create_notification(
                        user_id=p,
                        title="New Message",
                        message=f"You received a new message: {msg_preview}",
                        notification_type="NEW_MESSAGE",
                        module="messages"
                    )
        
        return created_msg
        
    async def mark_as_read(self, conversation_id: str, user_id: str) -> List[Dict[str, Any]]:
        # Find all unread messages in conversation not sent by user
        now = utc_now()
        query = {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id},
            "read_at": None
        }
        
        await self.messages.collection.update_many(
            query,
            {"$set": {"read_at": now, "updated_at": now}}
        )
        
        # Return updated messages
        updated_cursor = self.messages.collection.find({
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id},
            "read_at": now
        })
        
        updated_msgs = []
        async for doc in updated_cursor:
            doc["id"] = str(doc.pop("_id"))
            if doc.get("created_at"): doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("updated_at"): doc["updated_at"] = doc["updated_at"].isoformat()
            if doc.get("read_at"): doc["read_at"] = doc["read_at"].isoformat()
            updated_msgs.append(doc)
            
        return updated_msgs

    async def edit_message(self, message_id: str, user_id: str, payload: MessageUpdatePayload) -> Dict[str, Any]:
        msg = await self.messages.find_by_id(message_id)
        if not msg:
            raise ValueError("Message not found")
        if msg.get("sender_id") != user_id:
            raise PermissionError("Cannot edit someone else's message")
            
        now = utc_now()
        updated = await self.messages.update_by_id(message_id, {
            "content": payload.content,
            "edited_at": now,
            "updated_at": now
        })
        
        if updated:
            if updated.get("created_at"): updated["created_at"] = updated["created_at"].isoformat()
            if updated.get("updated_at"): updated["updated_at"] = updated["updated_at"].isoformat()
            if updated.get("edited_at"): updated["edited_at"] = updated["edited_at"].isoformat()
            
            from src.services.websocket_manager import manager
            conv = await self.conversations.find_by_id(updated.get("conversation_id", ""))
            if conv:
                participants = [p for p in [conv.get("client_id"), conv.get("band_id"), conv.get("venue_owner_id")] if p]
                for p in set(participants):
                    await manager.send_personal_message(
                        {"type": "messaging", "event": "message.updated", "data": updated},
                        p
                    )
                    
            return updated
        return {}

    async def delete_message(self, message_id: str, user_id: str) -> Dict[str, Any]:
        msg = await self.messages.find_by_id(message_id)
        if not msg:
            raise ValueError("Message not found")
        if msg.get("sender_id") != user_id:
            raise PermissionError("Cannot delete someone else's message")
            
        now = utc_now()
        updated = await self.messages.update_by_id(message_id, {
            "is_deleted": True,
            "content": "This message was deleted.",
            "updated_at": now
        })
        
        if updated:
            if updated.get("created_at"): updated["created_at"] = updated["created_at"].isoformat()
            if updated.get("updated_at"): updated["updated_at"] = updated["updated_at"].isoformat()
            
            from src.services.websocket_manager import manager
            conv = await self.conversations.find_by_id(updated.get("conversation_id", ""))
            if conv:
                participants = [p for p in [conv.get("client_id"), conv.get("band_id"), conv.get("venue_owner_id")] if p]
                for p in set(participants):
                    await manager.send_personal_message(
                        {"type": "messaging", "event": "message.deleted", "data": updated},
                        p
                    )
            return updated
        return {}

    async def add_reaction(self, message_id: str, user_id: str, emoji: str) -> Dict[str, Any]:
        msg = await self.messages.find_by_id(message_id)
        if not msg:
            raise ValueError("Message not found")
            
        reactions = msg.get("reactions", [])
        # Check if already reacted
        if any(r.get("user_id") == user_id and r.get("emoji") == emoji for r in reactions):
            return next(r for r in reactions if r.get("user_id") == user_id and r.get("emoji") == emoji)
            
        now = utc_now()
        new_reaction = {
            "id": uuid.uuid4().hex,
            "message_id": message_id,
            "user_id": user_id,
            "emoji": emoji,
            "created_at": now.isoformat()
        }
        
        await self.messages.collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$push": {"reactions": dict(new_reaction)}}
        )
        
        return new_reaction

    async def remove_reaction(self, message_id: str, user_id: str, emoji: str) -> bool:
        result = await self.messages.collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$pull": {"reactions": {"user_id": user_id, "emoji": emoji}}}
        )
        return result.modified_count > 0
