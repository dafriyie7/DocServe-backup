const { Dropbox } = require('dropbox');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

/**
 * Upload
 * @param {string} dropboxPath
 * @param {Buffer} fileContent
 */
const uploadFileToDropbox = async (dropboxPath, fileContent) => {
    try {
        await dbx.filesUpload({ path: `/${dropboxPath}`, contents: fileContent });
        console.log('File uploaded successfully');
    } catch (error) {
        console.error('Error uploading file to Dropbox:', error);
        throw error;
    }
};

/**
 * Download
 * @param {string} dropboxPath
 * @returns {Buffer}
 */
const downloadFileFromDropbox = async (dropboxPath) => {
    try {
        const response = await dbx.filesDownload({ path: `/${dropboxPath}` });
        return response.fileBinary;
    } catch (error) {
        console.error('Error downloading file from Dropbox:', error);
        throw error;
    }
};

/**
 * Delete
 * @param {string} dropboxPath
 */
const deleteFileFromDropbox = async (dropboxPath) => {
    try {
        await dbx.filesDeleteV2({ path: `/${dropboxPath}` });
        console.log('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file from Dropbox:', error);
        throw error;
    }
};

module.exports = { uploadFileToDropbox, downloadFileFromDropbox, deleteFileFromDropbox };