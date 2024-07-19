const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();



// Route to render file feed
router.get('/file-feed', fileController.getFiles);

// Route to handle file uploads and file operations
router.route('/')
    .post(fileController.uploadFile); // Handles file uploads

// Route to handle file searches separately
router.get('/search', fileController.searchFile);

// Route to handle file operations based on file ID
router.route('/:id')
    .post(fileController.sendEmail)
    .get(fileController.downloadFile)
    .delete(fileController.deleteFile);

module.exports = router;
