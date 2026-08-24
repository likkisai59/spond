import aioboto3
import os
from fastapi import UploadFile
from src.database.mongo import utc_now
from src.repositories.system import FileRepository, FolderRepository
from src.exceptions.handlers import NotFoundError, AppException
from src.core.config import settings

class FileService:
    def __init__(self):
        self.files = FileRepository()
        self.folders = FolderRepository()
        self.bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        self.session = aioboto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=self.region
        )

    async def _get_s3_key(self, module: str, original_name: str, module_id: str = None) -> str:
        # Structure: <module>/<module_id_or_general>/<filename>
        base_path = f"{module}"
        if module_id:
            base_path += f"/{module_id}"
        else:
            base_path += "/general"
        
        # generate a somewhat unique name to avoid conflicts, or just use original
        # for simplicity in Phase 4, we append timestamp if needed, but let's just use original name
        return f"{base_path}/{original_name}"

    async def upload_file(self, user_id: str, file: UploadFile, module: str, module_id: str = None) -> dict:
        if not self.bucket:
            # Fallback for local dev if no bucket is configured
            raise AppException(500, "S3 Bucket not configured")

        content = await file.read()
        file_size = len(content)
        
        if file_size > 10 * 1024 * 1024: # 10MB limit
            raise AppException(400, "File size exceeds 10MB limit")

        s3_key = await self._get_s3_key(module, file.filename, module_id)
        
        try:
            async with self.session.client("s3") as s3:
                await s3.put_object(
                    Bucket=self.bucket,
                    Key=s3_key,
                    Body=content,
                    ContentType=file.content_type
                )
        except Exception as e:
            raise AppException(500, f"S3 Upload failed: {str(e)}")

        # Assume public read bucket for url, or generate signed url. 
        # Using format: https://<bucket>.s3.<region>.amazonaws.com/<key>
        file_url = f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{s3_key}"

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
        
        fid = await self.files.insert(doc)
        return await self.get_file(fid)

    async def list_files(self, module: str, module_id: str = None) -> list[dict]:
        query = {"module": module}
        if module_id:
            query["module_id"] = module_id
        return await self.files.find_many(query)

    async def get_file(self, file_id: str) -> dict:
        f = await self.files.find_by_id(file_id)
        if not f:
            raise NotFoundError("File not found")
        return f

    async def delete_file(self, file_id: str, user_id: str) -> None:
        f = await self.get_file(file_id)
        # Check ownership or admin if strict
        
        # Delete from S3
        if self.bucket:
            try:
                async with self.session.client("s3") as s3:
                    await s3.delete_object(Bucket=self.bucket, Key=f["s3_key"])
            except Exception:
                pass # Ignore if already deleted in S3

        await self.files.delete_by_id(file_id)

    async def download_file_url(self, file_id: str) -> str:
        # Generates a presigned URL
        f = await self.get_file(file_id)
        if not self.bucket:
            return f["file_url"]
            
        try:
            async with self.session.client("s3") as s3:
                url = await s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket, 'Key': f["s3_key"]},
                    ExpiresIn=3600
                )
                return url
        except Exception:
            return f["file_url"]

    async def create_folder(self, folder_name: str, module: str, parent_folder_id: str = None) -> dict:
        doc = {
            "folder_name": folder_name,
            "module": module,
            "parent_folder_id": parent_folder_id,
            "created_at": utc_now()
        }
        fid = await self.folders.insert(doc)
        return await self.folders.find_by_id(fid)
