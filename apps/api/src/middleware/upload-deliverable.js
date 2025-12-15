import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure deliverables directory exists
const deliverablesDir = path.join("/app", "uploads", "deliverables");
if (!fs.existsSync(deliverablesDir)) {
  fs.mkdirSync(deliverablesDir, { recursive: true });
}

// Configure storage for deliverables
const deliverableStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, deliverablesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    const sanitizedOriginalName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${uniqueId}_${sanitizedOriginalName}${ext}`);
  },
});

// File filter for deliverables - allow common file types
const deliverableFileFilter = (req, file, cb) => {
  // Allow images, documents, archives, and common file types
  const allowedTypes =
    /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|7z|tar|gz|mp4|mov|avi|mp3|wav/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File type not allowed. Please upload images, documents, archives, or media files."
      )
    );
  }
};

// Create multer upload instance for deliverables
export const uploadDeliverable = multer({
  storage: deliverableStorage,
  fileFilter: deliverableFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Middleware for handling deliverable upload errors
export const handleDeliverableUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "File size must be less than 50MB",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  }
  next();
};
