const express = require('express');
const { register, login, logout, deleteUser, editUserProfile, getAllUsers, getme } = require('../controllers/user.controller');
const { validateJwt } = require('../middlewares/jwtValidate');
const { multerMiddleware } = require('../middlewares/multer');


const router = express.Router();

router.get('/',getAllUsers)
router.get('/:id',validateJwt,getme)

router.post('/register', multerMiddleware, register);

router.post('/login',login)
router.post('/logout',validateJwt,logout)

router.patch('/edit',validateJwt, multerMiddleware,editUserProfile)

router.delete('/delete',validateJwt,deleteUser)

module.exports = router;