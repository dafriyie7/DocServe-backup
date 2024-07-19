const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const File = require('../models/fileModel');
const fs = require('fs');
const path = require('path');
const { uploadFileToDropbox, downloadFileFromDropbox, deleteFileFromDropbox } = require('../config/dropbox');

// @desc Get all files
// @route GET /files/file-feed
// @access public
const getFiles = asyncHandler(async (req, res) => {
    const files = await File.find();
    res.render('file-feed', { files });
});

// @desc Search for file
// @route GET /files/search/:id
// @access public
const searchFile = asyncHandler(async (req, res) => {
        const file = await File.findById(req.params.id).populate('uploadedBy', 'name email');
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(200).json(file);
});

// @desc Upload file
// @route POST /files
// @access public
const uploadFile = asyncHandler(async (req, res) => {
    
});

// @desc Download file
// @route GET /files/:id
// @access public
const downloadFile = asyncHandler(async (req, res) => {
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
});

// @desc Delete file
// @route DELETE /files/:id
// @access public
const deleteFile = asyncHandler(async (req, res) => {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        await deleteFileFromDropbox(file.path);
        await file.remove();
        res.status(200).json({ message: 'File deleted successfully' });
});

// @desc Share file
// @route POST /files/:id/email
// @access public
const sendEmail = asyncHandler(async (req, res) => {
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
                path: `https://www.dropbox.com/s/${file.path}` // Dropbox URL
            }]
        };

        await transporter.sendMail(mailOptions);

        file.emailsSent += 1;
        await file.save();

        res.status(200).json({ message: 'Email sent successfully' });
});

module.exports = {
    getFiles,
    searchFile,
    uploadFile,
    downloadFile,
    deleteFile,
    sendEmail
};
