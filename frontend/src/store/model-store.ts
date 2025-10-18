import { create } from "zustand";
import type { ModelDownloadJob, ModelDownloadRequestPayload } from "@/lib/types";
import { cancelModelDownload, listModelDownloads, startModelDownload } from "@/lib/api";

interface ModelManagerState {
  downloads: ModelDownloadJob[];
  isFetching: boolean;
  error?: string;
  fetchDownloads: () => Promise<void>;
  startDownload: (payload: ModelDownloadRequestPayload) => Promise<ModelDownloadJob>;
  cancelDownload: (jobId: string) => Promise<ModelDownloadJob | undefined>;
  upsertDownload: (job: ModelDownloadJob) => void;
  removeDownload: (jobId: string) => void;
}

export const useModelManagerStore = create<ModelManagerState>((set, get) => ({
  downloads: [],
  isFetching: false,
  error: undefined,
  async fetchDownloads() {
    if (get().isFetching) return;
    set({ isFetching: true, error: undefined });
    try {
      const jobs = await listModelDownloads();
      set({ downloads: jobs, isFetching: false });
    } catch (error) {
      set({ error: (error as Error).message, isFetching: false });
    }
  },
  async startDownload(payload) {
    set({ error: undefined });
    try {
      const job = await startModelDownload(payload);
      set((state) => {
        const next = state.downloads.filter((entry) => entry.id !== job.id);
        return { downloads: [job, ...next] };
      });
      return job;
    } catch (error) {
      throw error;
    }
  },
  async cancelDownload(jobId) {
    try {
      const job = await cancelModelDownload(jobId);
      set((state) => {
        const next = state.downloads.map((entry) =>
          entry.id === job.id ? job : entry,
        );
        return { downloads: next };
      });
      return job;
    } catch (error) {
      set({ error: (error as Error).message });
      return undefined;
    }
  },
  upsertDownload(job) {
    set((state) => {
      const existingIndex = state.downloads.findIndex((entry) => entry.id === job.id);
      if (existingIndex === -1) {
        return { downloads: [job, ...state.downloads] };
      }
      const next = [...state.downloads];
      next[existingIndex] = job;
      return { downloads: next };
    });
  },
  removeDownload(jobId) {
    set((state) => ({
      downloads: state.downloads.filter((entry) => entry.id !== jobId),
    }));
  },
}));
