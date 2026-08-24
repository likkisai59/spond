from pydantic import BaseModel, Field
from typing import Optional

class FolderCreateRequest(BaseModel):
    folder_name: str
    module: str
    parent_folder_id: Optional[str] = None

class FileResponse(BaseModel):
    id: str
    module: str
    module_id: Optional[str]
    file_name: str
    original_name: str
    file_type: str
    file_size: int
    file_url: str
    uploaded_by: str
    created_at: str
