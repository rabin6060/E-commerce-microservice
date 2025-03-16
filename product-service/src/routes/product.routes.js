const express = require('express');
const { createProduct, getAllProducts, getSingleProductById, deleteProduct, getProductsByUserId } = require('../controllers/product.controller');
const { multerMiddleware } = require('../middlewares/multer');



const router = express.Router();

router.post('/',multerMiddleware,createProduct)

router.get('/',getAllProducts)
router.get('/user',getProductsByUserId)
router.get('/:id',getSingleProductById)



router.delete('/:id',deleteProduct)

module.exports = router;