from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks
from typing import Optional
from src.dependencies.auth import get_current_user
from src.services.file_service import FileService
from src.services.notification_service import send_notification_task
from src.schemas.files import FolderCreateRequest

router = APIRouter(prefix="/files", tags=["Files"])
service = FileService()

@router.post("/upload")
async def upload_file(
    module: str = Form(...),
    module_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: dict = Depends(get_current_user)
) -> dict:
    uploaded = await service.upload_file(user["id"], file, module, module_id)
    
    background_tasks.add_task(
        send_notification_task,
        user["id"],
        "File Uploaded",
        f"File {file.filename} was uploaded successfully.",
        "FILE_UPLOADED",
        module
    )
    
    return {"status": "success", "data": uploaded}

@router.get("")
async def list_files(module: str, module_id: str = None, _: dict = Depends(get_current_user)) -> dict:
    files = await service.list_files(module, module_id)
    return {"status": "success", "data": {"items": files}}

@router.get("/{id}")
async def get_file(id: str, _: dict = Depends(get_current_user)) -> dict:
    f = await service.get_file(id)
    return {"status": "success", "data": f}

@router.delete("/{id}")
async def delete_file(id: str, user: dict = Depends(get_current_user)) -> dict:
    await service.delete_file(id, user["id"])
    return {"status": "success"}

@router.get("/download/{id}")
async def download_file(id: str, _: dict = Depends(get_current_user)) -> dict:
    url = await service.download_file_url(id)
    return {"status": "success", "data": {"download_url": url}}

@router.post("/folder")
async def create_folder(data: FolderCreateRequest, _: dict = Depends(get_current_user)) -> dict:
    folder = await service.create_folder(data.folder_name, data.module, data.parent_folder_id)
    return {"status": "success", "data": folder}
