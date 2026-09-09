import os
from typing import Any
import aioboto3
from fastapi import UploadFile
from src.database.mongo import utc_now
from src.repositories.system import FileRepository, FolderRepository
from src.exceptions.handlers import NotFoundError, AppException
from src.core.config import settings

class FileService:
    def __init__(self):
        self.files = FileRepository()
        self.folders = FolderRepository()

    @property
    def bucket(self) -> str:
        return settings.AWS_S3_BUCKET.strip()

    @property
    def region(self) -> str:
        return settings.AWS_REGION.strip() or "ap-south-1"

    @property
    def session(self) -> aioboto3.Session:
        return aioboto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID.strip(),
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY.strip(),
            region_name=self.region
        )

    async def _get_s3_key(self, module: str, original_name: str, module_id: str | None = None) -> str:
        base_path = f"{module}"
        if module_id:
            base_path += f"/{module_id}"
        else:
            base_path += "/general"
        
        # Clean filename to avoid path traversal
        clean_name = os.path.basename(original_name)
        return f"{base_path}/{clean_name}"

    async def upload_file(self, user_id: str, file: UploadFile, module: str, module_id: str | None = None) -> dict[str, Any]:
        content = await file.read()
        file_size = len(content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB limit
            raise AppException(400, "File size exceeds 10MB limit")

        s3_key = await self._get_s3_key(module, file.filename or "file", module_id)
        file_url = ""

        if self.bucket:
            try:
                async with self.session.client("s3") as s3:  # pyright: ignore
                    await s3.put_object(
                        Bucket=self.bucket,
                        Key=s3_key,
                        Body=content,
                        ContentType=file.content_type or "application/octet-stream"
                    )
                file_url = f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{s3_key}"
            except Exception as e:
                # If S3 upload fails in dev mode, fallback to local disk
                if settings.APP_ENV in ("dev", "development"):
                    file_url = await self._save_local(s3_key, content)
                else:
                    raise AppException(500, f"S3 Upload failed: {str(e)}")
        else:
            # Fallback for local dev when no bucket is configured
            file_url = await self._save_local(s3_key, content)

        doc = {
            "module": module,
            "module_id": module_id,
            "file_name": file.filename,
            "original_name": file.filename,
            "file_type": file.content_type,
            "file_size": file_size,
            "s3_key": s3_key,
            "file_url": file_url,
            "uploaded_by": user_id,
            "created_at": utc_now()
        }
        
        return await self.files.insert(doc)

    async def _save_local(self, rel_path: str, content: bytes) -> str:
        local_path = os.path.join("uploads", rel_path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(content)
        return f"/uploads/{rel_path}"

    async def list_files(self, module: str, module_id: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"module": module}
        if module_id:
            query["module_id"] = module_id
        return await self.files.find_many(query)

    async def get_file(self, file_id: str) -> dict[str, Any]:
        f = await self.files.find_by_id(file_id)
        if not f:
            raise NotFoundError("File not found")
        return f

    async def delete_file(self, file_id: str, user_id: str) -> None:
        f = await self.get_file(file_id)
        
        if self.bucket:
            try:
                async with self.session.client("s3") as s3:  # pyright: ignore
                    await s3.delete_object(Bucket=self.bucket, Key=f["s3_key"])
            except Exception:
                pass
        else:
            local_path = os.path.join("uploads", f.get("s3_key", ""))
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except Exception:
                    pass

        await self.files.delete_by_id(file_id)

    async def download_file_url(self, file_id: str) -> str:
        f = await self.get_file(file_id)
        if not self.bucket:
            return str(f["file_url"])
            
        try:
            async with self.session.client("s3") as s3:  # pyright: ignore
                url = await s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket, 'Key': f["s3_key"]},
                    ExpiresIn=3600
                )
                return str(url)
        except Exception:
            return str(f["file_url"])

    async def create_folder(self, folder_name: str, module: str, parent_folder_id: str | None = None) -> dict[str, Any]:
        doc = {
            "folder_name": folder_name,
            "module": module,
            "parent_folder_id": parent_folder_id,
            "created_at": utc_now()
        }
        return await self.folders.insert(doc)
