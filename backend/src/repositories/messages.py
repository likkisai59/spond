from src.constants.collections import CONVERSATIONS, MESSAGES
from src.database.base_repository import BaseRepository

class ConversationRepository(BaseRepository):
    collection_name = CONVERSATIONS

    async def ensure_indexes(self) -> None:
        await self.create_index([("participants.user_id", 1)])
        await self.create_index([("updated_at", -1)])

class MessageRepository(BaseRepository):
    collection_name = MESSAGES

    async def ensure_indexes(self) -> None:
        await self.create_index([("conversation_id", 1)])
        await self.create_index([("sent_at", 1)])
