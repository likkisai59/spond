import {
  createAsyncThunk,
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FileType, SportsFile } from "@/types";
import { filesService } from "@/services/sports";

export interface UploadedFileInput {
  name: string;
  type?: FileType;
  sizeKb?: number;
  folder?: string;
}

export interface FilesState {
  files: SportsFile[];
  status?: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: FilesState = { files: [] };

export const fetchFilesThunk = createAsyncThunk(
  "sports/files/fetchFiles",
  async () => {
    const response = await filesService.list({ module: "sports" } as any);
    const resData = (response?.data as any)?.data || response?.data || response;
    const items = Array.isArray(resData) ? resData : (resData?.items || []);
    return items.map((item: any): SportsFile => {
      const fileName = item.fileName || item.file_name || item.name || "Untitled";
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      let type: FileType = "Document";
      if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) type = "Image";
      else if (["pdf"].includes(ext)) type = "PDF";
      else if (["xls", "xlsx", "csv"].includes(ext)) type = "Spreadsheet";
      else if (["mp4", "mov", "avi", "webm"].includes(ext)) type = "Video";

      const folderRaw = item.moduleId || item.module_id || item.folder || "Training";
      const folder = folderRaw === "general" ? "Training" : (folderRaw.charAt(0).toUpperCase() + folderRaw.slice(1));
      const sizeBytes = item.fileSize || item.file_size || (item.sizeKb ? item.sizeKb * 1024 : 0);
      const createdAt = item.createdAt || item.created_at || new Date().toISOString();

      return {
        id: item.id || item._id,
        name: fileName,
        type: item.type || type,
        sizeKb: item.sizeKb || Math.max(1, Math.round(sizeBytes / 1024)),
        folder,
        uploadedBy: item.uploadedBy || item.uploaded_by || "You",
        createdAt,
        updatedAt: item.updatedAt || item.updated_at || createdAt,
      };
    });
  }
);

const filesSlice = createSlice({
  name: "sports/files",
  initialState,
  reducers: {
    filesAdded: {
      reducer(state, action: PayloadAction<SportsFile[]>) {
        state.files.unshift(...action.payload);
      },
      prepare(inputs: UploadedFileInput[]) {
        const now = new Date().toISOString();
        const files: SportsFile[] = inputs.map((input) => ({
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          name: input.name,
          type: input.type ?? "Document",
          sizeKb: input.sizeKb ?? 64,
          folder: input.folder ?? "Training",
          uploadedBy: "You",
        }));
        return { payload: files };
      },
    },
    fileRemoved(state, action: PayloadAction<string>) {
      state.files = state.files.filter((f) => f.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFilesThunk.fulfilled, (state, action) => {
      state.files = action.payload;
    });
  },
});

export const { filesAdded, fileRemoved } = filesSlice.actions;
export default filesSlice.reducer;
