const express = require('express');
const { register, login, logout, deleteUser, editUserProfile } = require('../controllers/user.controller');
const multer = require('multer');
const { validateJwt } = require('../middlewares/jwtValidate');
const { multerMiddleware } = require('../middlewares/multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('profilePic');

const router = express.Router();

router.post('/register', multerMiddleware, register);

router.post('/login',login)
router.post('/logout',validateJwt,logout)

router.patch('/edit',validateJwt, multerMiddleware,editUserProfile)

router.delete('/delete',validateJwt,deleteUser)

module.exports = router;