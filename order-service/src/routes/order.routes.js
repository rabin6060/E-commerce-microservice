const express = require('express');
const { addOrder, success, cancel } = require('../controllers/order.controller');


const router = express.Router();

router.get('/success',success)
router.get('/cancel',cancel)
router.post('/',addOrder)


module.exports = router;