const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signup', authController.renderSignup);
router.get('/login', authController.renderLogin);
router.get('/forgot-password', authController.renderForgotPassword);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgot-password', authController.resetPassword);
router.get('/reset-password/:token', authController.resetPasswordForm);
router.post('/reset-password/:token', authController.updatePassword);

router.get('/verify-email', authController.verifyEmail);

module.exports = router;