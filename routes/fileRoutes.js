const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Define the filename
    }
});

const upload = multer({ storage: storage });

// Route to render file feed
router.get('/file-feed', fileController.renderFileFeed);

// Route to handle file uploads and file operations
router.route('/')
    .get(fileController.uploadFile)
    .post(upload.single('file'), fileController.uploadFile);

// Route to handle file searches separately
router.get('/search', fileController.searchFile);

// Route to handle file operations based on file ID
router.route('/:id')
    .post(fileController.sendEmail)
    .get(fileController.downloadFile)
    .delete(fileController.deleteFile);

module.exports = router;