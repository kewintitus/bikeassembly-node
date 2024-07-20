const express = require('express');
const { createBikeRecord } = require('../controllers/bikeRecordsController');

const router = express.Router();

router.get('/bikeRecords', () => {});
router.post('/bikeRecords', createBikeRecord);

module.exports = router;
