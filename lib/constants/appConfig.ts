export const REFRESH_DELAYS = {
  IMMEDIATE: 0,
  SHORT: 1500,
  MEDIUM: 3000,
} as const;

export const FILE_UPLOAD = {
  MAX_FILES: 20,
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
} as const;

export const SCAN_CONFIG = {
  PROGRESS_UPDATE_INTERVAL: 100,
  TIMEOUT_MS: 300000,
} as const;

export const ERROR_MESSAGES = {
  SERVER_ERROR: "Oops, something broke",
  DELETE_FAILED: "Could not delete. Try again?",
  MOVE_FAILED: "Could not move. Try again?",
  UPLOAD_FAILED: "Could not upload. Try again?",
  SCAN_FAILED: "Could not scan. Try again?",
  SYNC_FAILED: "Could not sync. Try again?",
  REPORT_FAILED: "Could not generate report",
} as const;

export const SUCCESS_MESSAGES = {
  FILE_DELETED: "File removed",
  FILE_MOVED: "File moved",
  FILE_UPLOADED: "File uploaded",
  FOLDER_DELETED: "Folder removed",
  FOLDER_MOVED: "Folder moved",
  FOLDER_SYNCED: "Folder synced",
  REPORT_GENERATED: "Report downloaded",
} as const;
