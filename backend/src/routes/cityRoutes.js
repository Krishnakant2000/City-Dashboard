const express = require('express');
const router = express.Router();
const { getCities, getCityHistory } = require('../controllers/cityController');

router.get('/', getCities);
router.get('/:id/history', getCityHistory);

module.exports = router;