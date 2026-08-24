from src.database.base_repository import BaseRepository
from src.constants.collections import (
    PAYMENTS, TRANSACTIONS, PAYMENT_RECEIPTS,
    FILES, FOLDERS, NOTIFICATIONS, NOTIFICATION_LOGS
)

class PaymentRepository(BaseRepository):
    collection_name = PAYMENTS
    async def ensure_indexes(self) -> None:
        await self.create_index([("user_id", 1)])
        await self.create_index([("order_id", 1)], unique=True)
        await self.create_index([("payment_id", 1)])

class TransactionRepository(BaseRepository):
    collection_name = TRANSACTIONS
    async def ensure_indexes(self) -> None:
        await self.create_index([("payment_id", 1)])

class PaymentReceiptRepository(BaseRepository):
    collection_name = PAYMENT_RECEIPTS
    async def ensure_indexes(self) -> None:
        await self.create_index([("payment_id", 1)], unique=True)

class FileRepository(BaseRepository):
    collection_name = FILES
    async def ensure_indexes(self) -> None:
        await self.create_index([("module", 1), ("module_id", 1)])

class FolderRepository(BaseRepository):
    collection_name = FOLDERS
    async def ensure_indexes(self) -> None:
        await self.create_index([("module", 1)])

class NotificationRepository(BaseRepository):
    collection_name = NOTIFICATIONS
    async def ensure_indexes(self) -> None:
        await self.create_index([("user_id", 1), ("is_read", 1)])
        await self.create_index([("created_at", -1)])

class NotificationLogRepository(BaseRepository):
    collection_name = NOTIFICATION_LOGS
    async def ensure_indexes(self) -> None:
        await self.create_index([("notification_id", 1)])
