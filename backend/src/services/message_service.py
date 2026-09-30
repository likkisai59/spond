import uuid
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

class MessageService:
    def __init__(self):
        self.conversations = ConversationRepository()
        self.messages = MessageRepository()
        self.bookings = EventHubEventRepository()  # Assuming bookings are here

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
            if doc.get("created_at"):
                doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("updated_at"):
                doc["updated_at"] = doc["updated_at"].isoformat()
            if doc.get("last_message_at"):
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
            
        if doc.get("created_at"):
            doc["created_at"] = doc["created_at"].isoformat()
        if doc.get("updated_at"):
            doc["updated_at"] = doc["updated_at"].isoformat()
        if doc.get("last_message_at"):
            doc["last_message_at"] = doc["last_message_at"].isoformat()
            
        return doc

    async def create_conversation(self, payload: CreateConversationPayload, user_id: str) -> Dict[str, Any]:
        # Check if conversation for this booking already exists
        existing = await self.conversations.find_one({"booking_id": payload.booking_id})
        if existing:
            raise ValueError(f"Conversation for booking {payload.booking_id} already exists")
            
        # In a real scenario, we'd fetch the booking to get client_id, band_id, venue_owner_id
        # For now, we mock the participants based on current user being the client
        now = utc_now()
        doc = {
            "booking_id": payload.booking_id,
            "client_id": user_id,
            "band_id": "band-provider-id", # mock
            "venue_owner_id": None,
            "pinned_message_id": None,
            "status": "ACTIVE",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now,
            "event_name": f"Event for {payload.booking_id}"
        }
        
        created = await self.conversations.insert(doc)
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

    async def save_message(self, conversation_id: str, sender_id: str, payload: SendMessagePayload, message_type: str = "TEXT", attachment_data: dict = None) -> Dict[str, Any]:
        now = utc_now()
        
        msg_doc = {
            "conversation_id": conversation_id,
            "sender_id": sender_id,
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
        
        created_msg["created_at"] = created_msg["created_at"].isoformat()
        created_msg["updated_at"] = created_msg["updated_at"].isoformat()
        
        # Broadcast real-time message
        from src.services.websocket_manager import manager
        conv = await self.conversations.find_by_id(conversation_id)
        if conv:
            participants = [p for p in [conv.get("client_id"), conv.get("band_id"), conv.get("venue_owner_id")] if p]
            for p in set(participants):
                await manager.send_personal_message(
                    {"type": "messaging", "event": "message.created", "data": created_msg},
                    p
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
        
        if updated.get("created_at"): updated["created_at"] = updated["created_at"].isoformat()
        if updated.get("updated_at"): updated["updated_at"] = updated["updated_at"].isoformat()
        if updated.get("edited_at"): updated["edited_at"] = updated["edited_at"].isoformat()
        
        from src.services.websocket_manager import manager
        conv = await self.conversations.find_by_id(updated["conversation_id"])
        if conv:
            participants = [p for p in [conv.get("client_id"), conv.get("band_id"), conv.get("venue_owner_id")] if p]
            for p in set(participants):
                await manager.send_personal_message(
                    {"type": "messaging", "event": "message.updated", "data": updated},
                    p
                )
                
        return updated

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
        
        if updated.get("created_at"): updated["created_at"] = updated["created_at"].isoformat()
        if updated.get("updated_at"): updated["updated_at"] = updated["updated_at"].isoformat()
        
        return updated
        
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
