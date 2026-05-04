import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garante que o diretório de uploads existe
const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Salva com nome único: user-id-timestamp
    const userId = req.userId || 'anonymous';
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

export default upload;
