import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/i;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Only images and document files are allowed!'), false);
    }
};

// Configure multer
export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
});