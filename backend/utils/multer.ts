import multer from "multer";
import path from "path";

export const EXTENSION_IMAGE = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
];
export const EXTENSION_ICON = [".svg", ".ico"];
export const EXTENSION_VIDEO = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];
export const EXTENSION_DOCUMENT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
];

const EXTENSION = [...EXTENSION_IMAGE, ...EXTENSION_ICON, ...EXTENSION_VIDEO];

const storageFile: multer.StorageEngine = multer.diskStorage({
  destination: "public/",
  filename: (_req, file, cb) => {
    cb(
      null,
      path.basename(file.originalname).replace(/\.[^/.]+$/, "") +
        path.extname(file.originalname)
    );
  },
});

const storageDocument: multer.StorageEngine = multer.diskStorage({
  destination: "public/",
  filename: (_req, file, cb) => {
    cb(
      null,
      path.basename(file.originalname).replace(/\.[^/.]+$/, "") +
        path.extname(file.originalname)
    );
  },
});

export const UploadImage = multer({
  storage: storageFile,
  limits: {
    fileSize: 70 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const extension: boolean =
      EXTENSION.indexOf(path.extname(file.originalname).toLowerCase()) >= 0;

    if (extension) {
      return callback(null, true);
    }

    callback(
      new Error(
        `Extension and mime type not allowed, only ${EXTENSION.join(
          ", "
        )} are allowed`
      )
    );
  },
});

export const UploadDocument = multer({
  storage: storageDocument,
  limits: {
    fileSize: 70 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const extension: boolean =
      EXTENSION_DOCUMENT.indexOf(
        path.extname(file.originalname).toLowerCase()
      ) >= 0;

    if (extension) {
      return callback(null, true);
    }

    callback(
      new Error(
        `Extension and mime type not allowed, only ${EXTENSION_DOCUMENT.join(
          ", "
        )} are allowed`
      )
    );
  },
});
