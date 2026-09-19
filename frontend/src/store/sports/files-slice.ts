import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FileType, SportsFile } from "@/types";
// Removed mock import

export interface UploadedFileInput {
  name: string;
  type?: FileType;
  sizeKb?: number;
  folder?: string;
}

export interface FilesState {
  files: SportsFile[];
}

const initialState: FilesState = { files: [] };

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
});

export const { filesAdded, fileRemoved } = filesSlice.actions;
export default filesSlice.reducer;
