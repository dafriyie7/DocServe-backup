const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const File = require('../models/fileModel');
const fs = require('fs');
const path = require('path');
const { uploadFileToDropbox, downloadFileFromDropbox, deleteFileFromDropbox } = require('../config/dropbox');

// @desc Get all files
// @route GET /files/file-feed
// @access public
const renderFileFeed = asyncHandler(async (req, res) => {
    const files = await File.find();
    res.render('file-feed', { files });
});

// @desc Search for file
// @route GET /files/search/:id
// @access public
const searchFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id).populate('uploadedBy', 'name email');
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc Upload file
// @route POST /files
// @access public
const uploadFile = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;
        const filePath = req.file.path;
        const uploadedBy = req.user ? req.user._id : null;

        const dropboxPath = `uploads/${req.file.originalname}`;
        await uploadFileToDropbox(dropboxPath, fs.readFileSync(filePath));

        const newFile = new File({
            title,
            description,
            path: dropboxPath,
            uploadedBy
        });

        await newFile.save();
        fs.unlinkSync(filePath); // Clean up local file
        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc Download file
// @route GET /files/:id
// @access public
const downloadFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        file.downloadCount += 1;
        await file.save();

        const fileData = await downloadFileFromDropbox(file.path);
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(file.path)}`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(fileData);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc Delete file
// @route DELETE /files/:id
// @access public
const deleteFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        await deleteFileFromDropbox(file.path);

        await file.remove();
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc Share file
// @route POST /files/:id/email
// @access public
const sendEmail = asyncHandler(async (req, res) => {
    try {
        const { recipientEmail, subject, text } = req.body;
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'your-email-service',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject,
            text,
            attachments: [{
                filename: path.basename(file.path),
                path: file.path // This will need to be updated if you're using Dropbox
            }]
        };

        await transporter.sendMail(mailOptions);

        file.emailsSent += 1;
        await file.save();

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = {
    renderFileFeed,
    searchFile,
    uploadFile,
    downloadFile,
    deleteFile,
    sendEmail
};
