from bson import ObjectId
from src.database.mongo import utc_now
from src.repositories.messages import ConversationRepository, MessageRepository
from src.schemas.messages import ConversationResponse, ChatMessageResponse

class MessageService:
    def __init__(self):
        self.conversations = ConversationRepository()
        self.messages = MessageRepository()

    async def get_user_conversations(self, user_id: str) -> list[dict]:
        cursor = self.conversations.collection.find({"participants.user_id": user_id}).sort("updated_at", -1)
        conversations = []
        async for doc in cursor:
            # Format participants for naming
            other_participants = [p for p in doc.get("participants", []) if p["user_id"] != user_id]
            name = doc.get("name")
            if not name:
                name = ", ".join([p.get("name", "Unknown") for p in other_participants]) or "Unknown Conversation"
            
            conversations.append({
                "id": str(doc["_id"]),
                "type": doc.get("type", "Direct"),
                "name": name,
                "last_message": doc.get("last_message"),
                "last_message_at": doc.get("last_message_at"),
                "unread_count": 0, # To be implemented properly later
                "messages": []
            })
        return conversations

    async def get_conversation_history(self, conversation_id: str, user_id: str) -> list[dict]:
        # Optional: verify user is in conversation
        cursor = self.messages.collection.find({"conversation_id": conversation_id}).sort("sent_at", 1)
        messages = []
        async for doc in cursor:
            messages.append({
                "id": str(doc["_id"]),
                "sender_id": doc["sender_id"],
                "sender_name": doc.get("sender_name", "Unknown"),
                "content": doc["content"],
                "sent_at": doc["sent_at"],
                "is_mine": doc["sender_id"] == user_id
            })
        return messages

    async def save_message(self, conversation_id: str, sender_id: str, sender_name: str, content: str) -> dict:
        now = utc_now()
        message_doc = {
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "content": content,
            "sent_at": now
        }
        await self.messages.insert(message_doc)
        
        # Update conversation last_message
        await self.conversations.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {
                "last_message": content,
                "last_message_at": now,
                "updated_at": now
            }}
        )
        
        return {
            "id": str(message_doc.get("_id", ObjectId())),
            "sender_id": sender_id,
            "sender_name": sender_name,
            "content": content,
            "sent_at": now,
            "is_mine": False # Overridden later per user
        }
