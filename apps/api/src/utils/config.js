import path from "path";

// Base directory for uploads - /app is used to match Docker volume mount
export const UPLOADS_BASE_DIR = "/app";

// Portfolio images directory
export const PORTFOLIO_UPLOAD_DIR = path.join(UPLOADS_BASE_DIR, "uploads", "portfolio");
