const express = require('express');
const { register, login, logout } = require('../controllers/user.controller');
const multer = require('multer');
const { logger } = require('../utils/logger');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('profilePic');

const router = express.Router();

router.post('/register', (req, res, next) => {
  req.on('close', () => {
    logger.warn('Client disconnected during file upload');
  });
  upload(req, res, (err) => {
    if (err) {
      logger.error("Upload error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    next();
  });
}, register);

router.post('/login',login)
router.post('/logout',logout)

module.exports = router;