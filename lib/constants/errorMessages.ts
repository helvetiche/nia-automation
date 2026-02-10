export const ERROR_MESSAGES = {
  SERVER_ERROR: "server is broken",
  AUTH_REQUIRED: "not authorized",
  AUTH_INVALID: "invalid token",
  NOT_FOUND: "not found",
  INVALID_INPUT: "invalid input",
  UPLOAD_FAILED: "upload failed",
  DELETE_FAILED: "delete failed",
  UPDATE_FAILED: "update failed",
  FETCH_FAILED: "fetch failed",
} as const;

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "uploaded successfully",
  DELETE_SUCCESS: "deleted successfully",
  UPDATE_SUCCESS: "updated successfully",
  CREATE_SUCCESS: "created successfully",
} as const;
