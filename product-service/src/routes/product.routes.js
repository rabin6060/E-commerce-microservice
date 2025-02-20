const express = require('express');
const { createProduct } = require('../controllers/product.controller');
const { multerMiddleware } = require('../middlewares/multer');


const router = express.Router();

router.post('/',multerMiddleware,createProduct)

module.exports = router;