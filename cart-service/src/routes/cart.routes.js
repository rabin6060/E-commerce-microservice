const express = require('express');
const { addCart, getAllCarts, removeCartItem } = require('../controllers/cart.controller');


const router = express.Router();

router.post('/',addCart)
router.get('/',getAllCarts)
router.post('/:id',removeCartItem)

module.exports = router;