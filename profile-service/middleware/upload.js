const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =
      file.fieldname === 'profileImage'
        ? 'uploads/avatars'
        : 'uploads/banners';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },        
  fileFilter: (_req, file, cb) => {
    cb(null, /jpeg|jpg|png/.test(file.mimetype)); 
  }
});
