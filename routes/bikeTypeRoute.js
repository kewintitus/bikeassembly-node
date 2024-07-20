const express = require('express');
const { getBikeTypes } = require('../controllers/bikeTypeController');

const router = express.Router();

router.get('/bikeTypes', getBikeTypes);

module.exports = router;
